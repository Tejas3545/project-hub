from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from src.core.database import get_db
from src.api.dependencies import get_current_user
from src.models.user import User
from src.models.tracking import ProjectProgress, GitHubProjectProgress
from src.schemas.tracking import ProjectProgressResponse, GitHubProjectProgressResponse, GitHubProjectProgressBase

router = APIRouter()

@router.get("/progress", response_model=List[ProjectProgressResponse])
async def get_user_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the authenticated user's standard project progress.
    """
    stmt = select(ProjectProgress).where(ProjectProgress.user_id == current_user.id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/github-progress", response_model=List[GitHubProjectProgressResponse])
async def get_github_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the authenticated user's GitHub project progress.
    """
    stmt = select(GitHubProjectProgress).where(GitHubProjectProgress.user_id == current_user.id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/github-progress/{project_id}", response_model=GitHubProjectProgressResponse)
async def get_single_github_progress(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the authenticated user's progress for a specific GitHub project.
    Creates a NOT_STARTED record if none exists.
    """
    stmt = select(GitHubProjectProgress).where(
        GitHubProjectProgress.user_id == current_user.id,
        GitHubProjectProgress.github_project_id == project_id,
    )
    result = await db.execute(stmt)
    progress = result.scalar_one_or_none()

    if not progress:
        progress = GitHubProjectProgress(
            user_id=current_user.id,
            github_project_id=project_id,
            status="NOT_STARTED",
            time_spent=0,
        )
        db.add(progress)
        await db.commit()
        await db.refresh(progress)

    return progress


@router.put("/github-progress/{project_id}", response_model=GitHubProjectProgressResponse)
async def update_github_progress(
    project_id: str,
    data: GitHubProjectProgressBase,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update the authenticated user's progress for a specific GitHub project.
    Creates a new record if none exists. Auto-manages started_at/completed_at timestamps.
    """
    from datetime import datetime, timezone

    stmt = select(GitHubProjectProgress).where(
        GitHubProjectProgress.user_id == current_user.id,
        GitHubProjectProgress.github_project_id == project_id,
    )
    result = await db.execute(stmt)
    progress = result.scalar_one_or_none()

    if not progress:
        progress = GitHubProjectProgress(
            user_id=current_user.id,
            github_project_id=project_id,
        )
        db.add(progress)

    # Update fields from request body
    progress.status = data.status
    progress.time_spent = data.time_spent
    progress.notes = data.notes
    progress.checklist = data.checklist

    # Auto-manage timestamps
    if data.status == "IN_PROGRESS" and not progress.started_at:
        progress.started_at = datetime.now(timezone.utc)
    if data.status == "COMPLETED" and not progress.completed_at:
        progress.completed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(progress)
    return progress

@router.get("/activity")
async def get_user_activity(
    current_user: User = Depends(get_current_user)
):
    """
    Get the authenticated user's recent activity feed.
    """
    return []

@router.get("/bookmarks")
async def get_user_bookmarks(
    current_user: User = Depends(get_current_user)
):
    """
    Get all bookmarks for the authenticated user.
    """
    return []

@router.get("/bookmarks/{project_id}/check")
async def check_bookmark(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Check if a specific project is bookmarked.
    """
    return {"bookmarked": False}

@router.post("/bookmarks/{project_id}")
async def toggle_bookmark(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Toggle bookmark status for a project.
    """
    return {"bookmarked": True}

@router.post("/bookmarks/batch-check")
async def batch_check_bookmarks(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Check bookmark status for multiple projects at once.
    """
    return {"bookmarks": {}}
