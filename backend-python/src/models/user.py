import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import ARRAY
from src.models.base import Base



def get_utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    """
    SQLAlchemy model representing the user in the database.
    Replicates the Prisma User model.
    """
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String)
    first_name: Mapped[Optional[str]] = mapped_column(String)
    last_name: Mapped[Optional[str]] = mapped_column(String)
    image: Mapped[Optional[str]] = mapped_column(String)
    profile_image: Mapped[Optional[str]] = mapped_column(String)
    bio: Mapped[Optional[str]] = mapped_column(Text)
    headline: Mapped[Optional[str]] = mapped_column(String)
    location: Mapped[Optional[str]] = mapped_column(String)
    github_url: Mapped[Optional[str]] = mapped_column(String)
    portfolio_url: Mapped[Optional[str]] = mapped_column(String)
    role: Mapped[str] = mapped_column(String, default="STUDENT")
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    email_verified: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    password_hash: Mapped[Optional[str]] = mapped_column(String)

    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    total_time_spent: Mapped[int] = mapped_column(Integer, default=0)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    points: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[int] = mapped_column(Integer, default=1)
    last_active_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    notifications: Mapped[list] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    progress: Mapped[list] = relationship("ProjectProgress", back_populates="user", cascade="all, delete-orphan")
    github_progress: Mapped[list] = relationship("GitHubProjectProgress", back_populates="user", cascade="all, delete-orphan")
    bookmarks: Mapped[list] = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"
