from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class NotificationBase(BaseModel):
    message: str
    type: str
    related_project_id: Optional[str] = None
    is_read: bool = False

class NotificationResponse(NotificationBase):
    id: str
    user_id: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ProjectProgressBase(BaseModel):
    status: str
    time_spent: int = 0
    is_running: bool = False
    notes: Optional[str] = None

class ProjectProgressResponse(ProjectProgressBase):
    id: str
    user_id: str
    project_id: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    last_timer_start: Optional[datetime] = None
    target_completion_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GitHubProjectProgressBase(BaseModel):
    status: str
    time_spent: int = 0
    notes: Optional[str] = None
    checklist: List[bool] = []

class GitHubProjectProgressResponse(GitHubProjectProgressBase):
    id: str
    user_id: str
    github_project_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
