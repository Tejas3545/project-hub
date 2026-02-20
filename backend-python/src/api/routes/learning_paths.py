"""
Routes for learning paths and recommendations.
"""
from fastapi import APIRouter, Depends

from src.api.dependencies import get_current_user
from src.models.user import User

router = APIRouter()

@router.get("")
async def get_learning_paths():
    """
    Get generic learning paths available.
    """
    return {"paths": []}

@router.get("/recommendations")
async def get_learning_path_recommendations(
    current_user: User = Depends(get_current_user)
):
    """
    Get recommended learning paths for the user.
    """
    return {"recommendations": [], "insights": None}
