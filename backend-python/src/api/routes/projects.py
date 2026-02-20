from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from src.core.database import get_db
from src.models.project import GitHubProject, Domain
from src.schemas.project import GitHubProjectResponse

router = APIRouter()

@router.get("/", response_model=List[GitHubProjectResponse])
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    domain_slug: Optional[str] = None,
    difficulty: Optional[str] = None,
    language: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a list of all GitHub projects with optional filtering and pagination.
    Supports filtering by domain, difficulty, and primary language.
    """
    stmt = select(GitHubProject).where(GitHubProject.is_active == True)
    
    if domain_slug:
        # Join Domain to filter by slug
        stmt = stmt.join(Domain).where(Domain.slug == domain_slug)
        
    if difficulty:
        stmt = stmt.where(GitHubProject.difficulty == difficulty.upper())
        
    if language:
        stmt = stmt.where(GitHubProject.language == language)
        
    # Apply pagination
    stmt = stmt.offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    projects = result.scalars().all()
    return projects

@router.get("/search", response_model=List[GitHubProjectResponse])
async def search_projects(
    q: str = Query(..., min_length=2),
    db: AsyncSession = Depends(get_db)
):
    """
    Search projects by title or description elements.
    """
    search_term = f"%{q}%"
    stmt = select(GitHubProject).where(
        (GitHubProject.title.ilike(search_term)) | 
        (GitHubProject.description.ilike(search_term))
    ).limit(20)
    
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{project_id}", response_model=GitHubProjectResponse)
async def get_project_by_id(project_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get full details for a single project by ID.
    """
    result = await db.execute(select(GitHubProject).where(GitHubProject.id == project_id))
    project = result.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    return project
