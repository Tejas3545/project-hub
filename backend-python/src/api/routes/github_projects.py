"""
Routes for GitHub projects with pagination support.
The frontend expects responses in {projects: [], pagination: {}} format.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Optional

from src.core.database import get_db
from src.core.config import settings
from src.models.project import GitHubProject, Domain
from src.schemas.project import GitHubProjectResponse, GitHubProjectListResponse
from src.api.dependencies import get_current_user
import httpx
from datetime import datetime, timezone

router = APIRouter()

async def proxy_github_search(
    db: AsyncSession,
    search: Optional[str],
    domain_id: Optional[str],
    difficulty: Optional[str],
    page: int,
    limit: int
):
    """Proxy query to GitHub API, upsert results, and return them. Returns (projects, total_count) or (None, 0) on failure/rate limit."""
    query_parts = []
    if search:
        query_parts.append(search.replace(" ", "+"))
        
    domain_name = None
    if domain_id:
        domain_result = await db.execute(select(Domain).where(Domain.id == domain_id))
        domain = domain_result.scalars().first()
        if domain:
            domain_name = domain.name
            query_parts.append(f"language:{domain.name}")
            
    if not query_parts:
        query_parts.append("stars:>500")
        
    gh_query = "+".join(query_parts)
    
    # GitHub search API max limit: 1000 total accessible results
    if page * limit > 1000:
        page = max(1, 1000 // limit)
        
    url = f"https://api.github.com/search/repositories?q={gh_query}&sort=stars&order=desc&page={page}&per_page={limit}"
    
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "ProjectHub-Sync-Bot"
    }
    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"
        
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                items = data.get("items", [])
                total_count = min(data.get("total_count", 0), 1000)
                
                # Ensure we have a domain to assign to
                fallback_domain_result = await db.execute(select(Domain).where(Domain.slug == "dynamic"))
                fallback_domain = fallback_domain_result.scalars().first()
                if not fallback_domain:
                    fallback_domain = Domain(name="Dynamic Search", slug="dynamic", description="Dynamically cached projects")
                    db.add(fallback_domain)
                    await db.flush()
                
                domain_id_to_use = domain_id if domain_id else fallback_domain.id
                
                saved_projects = []
                for repo in items:
                    slug = repo["full_name"].lower().replace("/", "-")
                    result = await db.execute(select(GitHubProject).where(GitHubProject.slug == slug))
                    existing = result.scalars().first()
                    
                    diff = "MEDIUM"
                    size = repo.get("size", 0)
                    if size > 100000: diff = "HARD"
                    elif size < 10000: diff = "EASY"
                    
                    live_url = repo.get("homepage")
                    if live_url and not str(live_url).startswith("http"):
                        live_url = f"https://{live_url}"
                        
                    topics = repo.get("topics", [])
                    library_keywords = {"library", "framework", "sdk", "api-wrapper", "toolkit", "plugin", "module", "package", "backend-framework", "frontend-framework"}
                    project_type = "LIBRARY" if any(kw in topics for kw in library_keywords) else "PROJECT"
                        
                    if not existing:
                        existing = GitHubProject(
                            title=repo["name"],
                            slug=slug,
                            description=repo.get("description") or "No description provided.",
                            repo_url=repo["html_url"],
                            repo_owner=repo["owner"]["login"],
                            repo_name=repo["name"],
                            default_branch=repo.get("default_branch", "main"),
                            domain_id=domain_id_to_use,
                            stars=repo.get("stargazers_count", 0),
                            forks=repo.get("forks_count", 0),
                            language=repo.get("language") or domain_name,
                            difficulty=diff,
                            topics=topics,
                            project_type=project_type,
                            live_url=live_url,
                            author=repo["owner"]["login"],
                            last_updated=datetime.now(timezone.utc)
                        )
                        db.add(existing)
                    else:
                        existing.stars = repo.get("stargazers_count", existing.stars)
                        existing.forks = repo.get("forks_count", existing.forks)
                        existing.project_type = project_type
                        
                    saved_projects.append(existing)
                    
                await db.commit()
                
                if difficulty:
                    saved_projects = [p for p in saved_projects if p.difficulty == difficulty.upper()]
                    
                return saved_projects, total_count
        except Exception as e:
            print(f"GitHub Proxy Error: {e}")
            pass
            
    return None, 0

@router.get("/languages", response_model=list[str])
async def get_github_project_languages(db: AsyncSession = Depends(get_db)):
    """
    Get all unique programming languages from cached GitHub projects.
    """
    result = await db.execute(
        select(GitHubProject.language)
        .where(GitHubProject.language != None)
        .distinct()
    )
    languages = result.scalars().all()
    return sorted(list(set(lang for lang in languages if lang)))


@router.get("", response_model=GitHubProjectListResponse)
async def get_github_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
    domainId: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    sortBy: Optional[str] = "created_at",
    order: Optional[str] = "desc",
    qaStatus: Optional[str] = None,
    projectType: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Get paginated list of GitHub projects with optional filtering.
    Returns {projects: [], pagination: {total, page, limit, totalPages}}.
    """
    # === 1. Attempt Live Proxy of GitHub API ===
    # If the user is specifically looking for a QA status, we MUST query local DB.
    # Otherwise, proxy to GitHub first.
    if not qaStatus:
        gh_projects, gh_total = await proxy_github_search(
            db=db, search=search, domain_id=domainId, difficulty=difficulty, page=page, limit=limit
        )
        if gh_projects is not None:
            total_pages = (gh_total + limit - 1) // limit if gh_total > 0 else 0
            return {
                "projects": gh_projects,
                "pagination": {
                    "total": gh_total,
                    "page": page,
                    "limit": limit,
                    "total_pages": total_pages,
                }
            }

    # === 2. Fallback to Local DB (Rate Limit or QA Status Filter) ===
    stmt = select(GitHubProject)
    count_stmt = select(func.count()).select_from(GitHubProject)

    if domainId:
        stmt = stmt.where(GitHubProject.domain_id == domainId)
        count_stmt = count_stmt.where(GitHubProject.domain_id == domainId)

    if difficulty:
        stmt = stmt.where(GitHubProject.difficulty == difficulty.upper())
        count_stmt = count_stmt.where(GitHubProject.difficulty == difficulty.upper())

    if qaStatus:
        stmt = stmt.where(GitHubProject.qa_status == qaStatus)
        count_stmt = count_stmt.where(GitHubProject.qa_status == qaStatus)

    if projectType:
        stmt = stmt.where(GitHubProject.project_type == projectType.upper())
        count_stmt = count_stmt.where(GitHubProject.project_type == projectType.upper())

    if search:
        search_term = f"%{search}%"
        search_filter = (
            GitHubProject.title.ilike(search_term)
            | GitHubProject.description.ilike(search_term)
        )
        stmt = stmt.where(search_filter)
        count_stmt = count_stmt.where(search_filter)

    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    # Apply sorting
    sort_column = getattr(GitHubProject, sortBy, GitHubProject.created_at)
    if order == "asc":
        stmt = stmt.order_by(sort_column.asc())
    else:
        stmt = stmt.order_by(sort_column.desc())

    # Apply pagination
    offset = (page - 1) * limit
    stmt = stmt.offset(offset).limit(limit)

    result = await db.execute(stmt)
    projects = result.scalars().all()

    total_pages = (total + limit - 1) // limit if total > 0 else 0

    return {
        "projects": projects,
        "pagination": {
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": total_pages,
        },
    }


@router.get("/search")
async def search_github_projects(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Search GitHub projects by title or description.
    Returns {projects: [], pagination: {}}.
    """
    search_term = f"%{q}%"
    search_filter = (
        GitHubProject.title.ilike(search_term)
        | GitHubProject.description.ilike(search_term)
    )

    # Proxy to GitHub API
    gh_projects, gh_total = await proxy_github_search(
        db=db, search=q, domain_id=None, difficulty=None, page=page, limit=limit
    )
    if gh_projects is not None:
        total_pages = (gh_total + limit - 1) // limit if gh_total > 0 else 0
        return {
            "projects": gh_projects,
            "pagination": {
                "total": gh_total,
                "page": page,
                "limit": limit,
                "totalPages": total_pages,
            }
        }

    # Fallback to Local Search
    count_stmt = select(func.count()).select_from(GitHubProject).where(search_filter)
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    offset = (page - 1) * limit
    stmt = (
        select(GitHubProject)
        .where(search_filter)
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    projects = result.scalars().all()

    total_pages = (total + limit - 1) // limit if total > 0 else 0

    return {
        "projects": projects,
        "pagination": {
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": total_pages,
        },
    }


@router.get("/domain/{domain_slug}", response_model=GitHubProjectListResponse)
async def get_github_projects_by_domain(
    domain_slug: str,
    page: int = Query(1, ge=1),
    limit: int = Query(200, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    """
    Get GitHub projects filtered by domain slug.
    """
    # First find the domain
    domain_result = await db.execute(select(Domain).where(Domain.slug == domain_slug))
    domain = domain_result.scalars().first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")

    count_stmt = (
        select(func.count())
        .select_from(GitHubProject)
        .where(GitHubProject.domain_id == domain.id)
    )
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    offset = (page - 1) * limit
    stmt = (
        select(GitHubProject)
        .where(GitHubProject.domain_id == domain.id)
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    projects = result.scalars().all()

    total_pages = (total + limit - 1) // limit if total > 0 else 0

    return {
        "projects": projects,
        "pagination": {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        },
    }


@router.get("/{project_id}", response_model=GitHubProjectResponse)
async def get_github_project_by_id(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get a single GitHub project by its ID.
    """
    result = await db.execute(
        select(GitHubProject).where(GitHubProject.id == project_id)
    )
    project = result.scalars().first()

    if not project:
        raise HTTPException(status_code=404, detail="GitHub project not found")

    return project


@router.post("/{project_id}/review")
async def review_github_project(
    project_id: str,
    data: dict,
    db: AsyncSession = Depends(get_db),
):
    """
    Submit a QA review for a GitHub project.
    """
    result = await db.execute(
        select(GitHubProject).where(GitHubProject.id == project_id)
    )
    project = result.scalars().first()

    if not project:
        raise HTTPException(status_code=404, detail="GitHub project not found")

    if "qaStatus" in data:
        project.qa_status = data["qaStatus"]
    if "qaFeedback" in data:
        project.qa_feedback = data["qaFeedback"]
    if "reviewedBy" in data:
        project.reviewed_by = data["reviewedBy"]

    from datetime import datetime, timezone
    project.reviewed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(project)
    return project
