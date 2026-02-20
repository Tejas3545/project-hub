import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Text, Integer, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import ARRAY
from src.models.base import Base



def get_utc_now():
    return datetime.utcnow()

class Domain(Base):
    __tablename__ = "domains"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    github_projects: Mapped[List["GitHubProject"]] = relationship("GitHubProject", back_populates="domain", cascade="all, delete")
    projects: Mapped[List["Project"]] = relationship("Project", back_populates="domain", cascade="all, delete")

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    domain_id: Mapped[str] = mapped_column(ForeignKey("domains.id", ondelete="CASCADE"), index=True)
    domain: Mapped["Domain"] = relationship("Domain", back_populates="projects")
    
    progress: Mapped[list] = relationship("ProjectProgress", back_populates="project", cascade="all, delete-orphan")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

class GitHubProject(Base):
    __tablename__ = "github_projects"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[Optional[str]] = mapped_column(String, unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    repo_url: Mapped[str] = mapped_column(String, nullable=False)
    repo_owner: Mapped[Optional[str]] = mapped_column(String)
    repo_name: Mapped[Optional[str]] = mapped_column(String)
    default_branch: Mapped[str] = mapped_column(String, default="main")
    download_url: Mapped[str] = mapped_column(String, default="")
    live_url: Mapped[Optional[str]] = mapped_column(String)
    download_count: Mapped[int] = mapped_column(Integer, default=0)
    
    domain_id: Mapped[str] = mapped_column(ForeignKey("domains.id", ondelete="CASCADE"), index=True)
    domain: Mapped["Domain"] = relationship("Domain", back_populates="github_projects")
    
    stars: Mapped[int] = mapped_column(Integer, default=0, index=True)
    forks: Mapped[int] = mapped_column(Integer, default=0)
    language: Mapped[Optional[str]] = mapped_column(String, index=True)
    tech_stack: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    difficulty: Mapped[str] = mapped_column(String, default="MEDIUM", index=True)
    topics: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    last_updated: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    author: Mapped[str] = mapped_column(String, default="Project Hub")
    introduction: Mapped[Optional[str]] = mapped_column(Text)
    implementation: Mapped[Optional[str]] = mapped_column(Text)
    technical_skills: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    tools_used: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    concepts_used: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)

    sub_domain: Mapped[Optional[str]] = mapped_column(String)
    case_study: Mapped[Optional[str]] = mapped_column(Text)
    problem_statement: Mapped[Optional[str]] = mapped_column(Text)
    solution_description: Mapped[Optional[str]] = mapped_column(Text)
    prerequisites: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    prerequisites_text: Mapped[Optional[str]] = mapped_column(Text)
    
    estimated_min_time: Mapped[int] = mapped_column(Integer, default=10)
    estimated_max_time: Mapped[int] = mapped_column(Integer, default=40)
    deliverables: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    supposed_deadline: Mapped[Optional[str]] = mapped_column(String)
    optional_extensions: Mapped[Optional[str]] = mapped_column(Text)
    requirements: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    requirements_text: Mapped[Optional[str]] = mapped_column(Text)
    evaluation_criteria: Mapped[Optional[str]] = mapped_column(Text)

    qa_status: Mapped[str] = mapped_column(String, default="PENDING")
    qa_feedback: Mapped[Optional[str]] = mapped_column(Text)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    reviewed_by: Mapped[Optional[str]] = mapped_column(String)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    progress: Mapped[list] = relationship("GitHubProjectProgress", back_populates="github_project", cascade="all, delete-orphan")
