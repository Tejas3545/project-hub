from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Optional, List
from datetime import datetime

class DomainBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)
    name: str
    slug: str
    description: Optional[str] = None

class DomainResponse(DomainBase):
    id: str
    created_at: datetime
    updated_at: datetime

class GitHubProjectBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)
    title: str
    slug: Optional[str] = None
    description: str
    repo_url: str
    repo_owner: Optional[str] = None
    repo_name: Optional[str] = None
    default_branch: str = "main"
    download_url: str = ""
    live_url: Optional[str] = None
    project_type: str = "PROJECT"
    
    stars: int = 0
    forks: int = 0
    language: Optional[str] = None
    tech_stack: List[str] = []
    difficulty: str = "MEDIUM"
    topics: List[str] = []
    
    author: str = "Project Hub"
    introduction: Optional[str] = None
    implementation: Optional[str] = None
    technical_skills: List[str] = []
    tools_used: List[str] = []
    concepts_used: List[str] = []

    sub_domain: Optional[str] = None
    case_study: Optional[str] = None
    problem_statement: Optional[str] = None
    solution_description: Optional[str] = None
    prerequisites: List[str] = []
    prerequisites_text: Optional[str] = None
    
    estimated_min_time: int = 10
    estimated_max_time: int = 40
    deliverables: List[str] = []
    supposed_deadline: Optional[str] = None
    optional_extensions: Optional[str] = None
    requirements: List[str] = []
    requirements_text: Optional[str] = None
    evaluation_criteria: Optional[str] = None

class GitHubProjectResponse(GitHubProjectBase):
    id: str
    domain_id: str
    download_count: int
    is_active: bool
    last_updated: Optional[datetime] = None
    qa_status: str
    qa_feedback: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    domain: Optional[DomainResponse] = None

class PaginationSchema(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    total: int
    page: int
    limit: int
    total_pages: int

class GitHubProjectListResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    projects: List[GitHubProjectResponse]
    pagination: PaginationSchema
