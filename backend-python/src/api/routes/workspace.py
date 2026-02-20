"""
Routes for workspace features (timer, active sessions, etc.).
"""
from fastapi import APIRouter, Depends

from src.api.dependencies import get_current_user
from src.models.user import User

router = APIRouter()


@router.get("/timer/active")
async def get_active_timer(
    current_user: User = Depends(get_current_user),
):
    """
    Get the currently active timer for the authenticated user.
    Returns null if no timer is active.
    """
    return {"session": None}
