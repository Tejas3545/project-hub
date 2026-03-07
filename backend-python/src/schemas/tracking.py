from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Optional, List, Any
from datetime import datetime

class ProjectSimpleResponse(BaseModel):
    id: str
    title: str

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)

class GitHubProjectSimpleResponse(BaseModel):
    id: str
    title: str
    repo_owner: Optional[str] = None
    repo_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)

class NotificationBase(BaseModel):
    message: str
    type: str
    related_project_id: Optional[str] = None
    is_read: bool = False

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

class NotificationResponse(NotificationBase):
    id: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)

class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    unread_count: int
    page: int
    limit: int

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

class ProjectProgressBase(BaseModel):
    status: str
    time_spent: int = 0
    is_running: bool = False
    notes: Optional[str] = None

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

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
    project: Optional[ProjectSimpleResponse] = None

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)

class GitHubProjectProgressBase(BaseModel):
    status: str
    time_spent: int = 0
    notes: Optional[str] = None
    checklist: List[bool] = []

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

class GitHubProjectProgressResponse(GitHubProjectProgressBase):
    id: str
    user_id: str
    github_project_id: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    github_project: Optional[GitHubProjectSimpleResponse] = None

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)
