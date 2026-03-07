from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.api.dependencies import get_current_user
from src.core.database import get_db
from src.models.project import Project
from src.models.social import Comment, Like
from src.models.tracking import Notification
from src.models.user import User
from src.schemas.social import (
    CommentCreateRequest,
    CommentListResponse,
    CommentResponse,
    LikeCountResponse,
    LikeStatusResponse,
    ToggleLikeResponse,
    UpvoteCommentResponse,
)

router = APIRouter()


async def get_project_summary(db: AsyncSession, project_id: str):
    result = await db.execute(
        select(Project.id, Project.title, Project.created_by_id).where(Project.id == project_id)
    )
    project_row = result.first()
    if not project_row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project_row


async def create_notification(
    db: AsyncSession,
    user_id: str | None,
    message: str,
    notification_type: str,
    related_project_id: str | None,
):
    if not user_id:
        return

    db.add(
        Notification(
            user_id=user_id,
            message=message,
            type=notification_type,
            related_project_id=related_project_id,
        )
    )


@router.post("/projects/{project_id}/like", response_model=ToggleLikeResponse)
async def toggle_project_like(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await get_project_summary(db, project_id)

    existing_result = await db.execute(
        select(Like).where(Like.user_id == current_user.id, Like.project_id == project_id)
    )
    existing_like = existing_result.scalar_one_or_none()

    liked = False
    if existing_like:
        await db.delete(existing_like)
    else:
        liked = True
        db.add(Like(user_id=current_user.id, project_id=project_id))
        if project.created_by_id and project.created_by_id != current_user.id:
            actor_name = current_user.first_name or current_user.email.split("@")[0]
            await create_notification(
                db,
                user_id=project.created_by_id,
                message=f"{actor_name} liked your project \"{project.title}\".",
                notification_type="NEW_UPVOTE",
                related_project_id=project_id,
            )

    await db.commit()

    count_result = await db.execute(
        select(func.count(Like.id)).where(Like.project_id == project_id)
    )
    count = count_result.scalar() or 0

    return {"liked": liked, "count": count}


@router.get("/projects/{project_id}/like/status", response_model=LikeStatusResponse)
async def get_project_like_status(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Like.id).where(Like.user_id == current_user.id, Like.project_id == project_id)
    )
    return {"liked": result.first() is not None}


@router.get("/projects/{project_id}/like/count", response_model=LikeCountResponse)
async def get_project_like_count(project_id: str, db: AsyncSession = Depends(get_db)):
    count_result = await db.execute(
        select(func.count(Like.id)).where(Like.project_id == project_id)
    )
    return {"count": count_result.scalar() or 0}


@router.post("/projects/{project_id}/comments", response_model=CommentResponse)
async def add_project_comment(
    project_id: str,
    payload: CommentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cleaned_text = payload.text.strip()
    if not cleaned_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Comment text is required")

    project = await get_project_summary(db, project_id)

    parent_comment = None
    if payload.parent_id:
        parent_result = await db.execute(
            select(Comment).where(Comment.id == payload.parent_id, Comment.project_id == project_id)
        )
        parent_comment = parent_result.scalar_one_or_none()
        if not parent_comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent comment not found")

    comment = Comment(
        user_id=current_user.id,
        project_id=project_id,
        text=cleaned_text,
        parent_id=payload.parent_id,
    )
    db.add(comment)

    actor_name = current_user.first_name or current_user.email.split("@")[0]
    if parent_comment and parent_comment.user_id != current_user.id:
        await create_notification(
            db,
            user_id=parent_comment.user_id,
            message=f"{actor_name} replied to your comment on \"{project.title}\".",
            notification_type="NEW_COMMENT",
            related_project_id=project_id,
        )
    elif project.created_by_id and project.created_by_id != current_user.id:
        await create_notification(
            db,
            user_id=project.created_by_id,
            message=f"{actor_name} commented on your project \"{project.title}\".",
            notification_type="NEW_COMMENT",
            related_project_id=project_id,
        )

    await db.commit()

    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.user))
        .where(Comment.id == comment.id)
    )
    saved_comment = result.scalar_one()
    return saved_comment


@router.get("/projects/{project_id}/comments", response_model=CommentListResponse)
async def get_project_comments(
    project_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit

    total_result = await db.execute(
        select(func.count(Comment.id)).where(Comment.project_id == project_id)
    )
    total = total_result.scalar() or 0

    comments_result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.user))
        .where(Comment.project_id == project_id)
        .order_by(Comment.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    comments = comments_result.scalars().all()

    return {
        "comments": comments,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": ceil(total / limit) if total else 1,
    }


@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

    if comment.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to delete this comment")

    await db.delete(comment)
    await db.commit()
    return {"deleted": True}


@router.post("/comments/{comment_id}/upvote", response_model=UpvoteCommentResponse)
async def upvote_comment(
    comment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.user))
        .where(Comment.id == comment_id)
    )
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

    existing_upvote = await db.execute(
        select(Like).where(Like.user_id == current_user.id, Like.comment_id == comment_id)
    )
    like = existing_upvote.scalar_one_or_none()
    upvoted = like is None

    if like is None:
        db.add(Like(user_id=current_user.id, comment_id=comment_id, project_id=comment.project_id))
        comment.upvotes += 1

        if comment.user_id != current_user.id:
            actor_name = current_user.first_name or current_user.email.split("@")[0]
            await create_notification(
                db,
                user_id=comment.user_id,
                message=f"{actor_name} upvoted your comment.",
                notification_type="NEW_UPVOTE",
                related_project_id=comment.project_id,
            )

        await db.commit()
    else:
        await db.rollback()

    return {"upvoted": upvoted, "count": comment.upvotes}