import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import ARRAY
from src.models.base import Base



def get_utc_now():
    return datetime.utcnow()

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    related_project_id: Mapped[Optional[str]] = mapped_column(String)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)
    
    user: Mapped[object] = relationship("User", back_populates="notifications")

class ProjectProgress(Base):
    __tablename__ = "project_progress"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    
    status: Mapped[str] = mapped_column(String, default="NOT_STARTED", index=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    time_spent: Mapped[int] = mapped_column(Integer, default=0) # in minutes
    is_running: Mapped[bool] = mapped_column(Boolean, default=False)
    last_timer_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    target_completion_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
    
    user: Mapped[object] = relationship("User", back_populates="progress")
    project: Mapped[object] = relationship("Project", back_populates="progress")

class GitHubProjectProgress(Base):
    __tablename__ = "github_project_progress"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    github_project_id: Mapped[str] = mapped_column(ForeignKey("github_projects.id", ondelete="CASCADE"), index=True)
    
    status: Mapped[str] = mapped_column(String, default="IN_PROGRESS", index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    time_spent: Mapped[int] = mapped_column(Integer, default=0) # in seconds
    notes: Mapped[Optional[str]] = mapped_column(Text)
    checklist: Mapped[List[bool]] = mapped_column(ARRAY(Boolean), default=list)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
    
    user: Mapped[object] = relationship("User", back_populates="github_progress")
    github_project: Mapped[object] = relationship("GitHubProject", back_populates="progress")

class Bookmark(Base):
    __tablename__ = "bookmarks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    project_id: Mapped[Optional[str]] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    github_project_id: Mapped[Optional[str]] = mapped_column(ForeignKey("github_projects.id", ondelete="CASCADE"), index=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)
    
    user: Mapped[object] = relationship("User", back_populates="bookmarks")
    project: Mapped[object] = relationship("Project", back_populates="bookmarks")
    github_project: Mapped[object] = relationship("GitHubProject", back_populates="bookmarks")
