from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from src.core.database import get_db
from src.api.dependencies import get_current_user
from src.models.user import User
from src.models.tracking import ProjectProgress, GitHubProjectProgress
from src.schemas.tracking import ProjectProgressResponse, GitHubProjectProgressResponse

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
