"""
Routes for user analytics and dashboard statistics.
"""
from fastapi import APIRouter, Depends, Query
from typing import List

from src.api.dependencies import get_current_user
from src.models.user import User

router = APIRouter()

@router.get("/dashboard")
async def get_analytics_dashboard(
    current_user: User = Depends(get_current_user)
):
    """
    Get generic analytics dashboard stats.
    Returns stub data for now.
    """
    return {
        "projects_completed": 0,
        "total_time_spent": 0,
        "current_streak": current_user.current_streak if hasattr(current_user, "current_streak") else 0,
        "longest_streak": 0,
        "points": 0,
        "achievements_count": 0
    }

@router.get("/leaderboard")
async def get_leaderboard(
    limit: int = Query(50),
    current_user: User = Depends(get_current_user)
):
    """
    Get user leaderboard for gamification.
    """
    return []

@router.post("/update-streak")
async def update_user_streak(
    current_user: User = Depends(get_current_user)
):
    """
    Update and get user's current streak.
    """
    return {
        "message": "Streak updated",
        "currentStreak": 1,
        "longestStreak": 1
    }

@router.get("/time-tracking")
async def get_time_tracking(
    days: int = Query(7),
    current_user: User = Depends(get_current_user)
):
    """
    Get time tracking data for chart.
    """
    return []

@router.get("/progress-insights")
async def get_progress_insights(
    current_user: User = Depends(get_current_user)
):
    """
    Get AI or algorithm-generated insights on user progress.
    """
    return {
        "insights": ["Keep up the good work!"]
    }
