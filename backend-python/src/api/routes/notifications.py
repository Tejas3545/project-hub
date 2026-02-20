from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from src.core.database import get_db
from src.api.dependencies import get_current_user
from src.models.user import User
from src.models.tracking import Notification
from src.schemas.tracking import NotificationResponse

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
async def get_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the authenticated user's notifications.
    """
    skip = (page - 1) * limit
    stmt = select(Notification).where(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    return result.scalars().all()
