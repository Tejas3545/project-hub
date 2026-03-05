# Project Hub - Application Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Data Models](#data-models)
5. [API Endpoints](#api-endpoints)
6. [Features](#features)
7. [Authentication](#authentication)
8. [Database Schema](#database-schema)
9. [Frontend Structure](#frontend-structure)
10. [Configuration](#configuration)

---

## Overview

**Project Hub** is a comprehensive platform designed to help developers build real-world skills through real projects. It features 992 curated GitHub repositories across 5 professional domains:

1. **Web Development** (200 projects) - React, Next.js, Node.js, Express, Vue, Angular
2. **Artificial Intelligence** (200 projects) - TensorFlow, PyTorch, OpenAI, LangChain
3. **Machine Learning** (200 projects) - Scikit-learn, XGBoost, Keras, MLflow
4. **Data Science** (193 projects) - Pandas, NumPy, Jupyter, Matplotlib, SQL
5. **Cybersecurity** (199 projects) - Python, Kali Linux, Metasploit, OWASP Tools

The platform is built with two backends:
- **Node.js/Express** (original backend)
- **Python FastAPI** (new backend port - in progress)

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                       │
│                    Deployed on Vercel                           │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Marketing │  │  Workstation │  │    Admin    │              │
│  │    Pages    │  │    (Auth)    │  │    Panel    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests (REST API)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Backend (FastAPI - Python)                     │
│                    Deployed on Render                            │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Auth      │  │   Projects   │  │   Analytics │              │
│  │   Routes    │  │   Routes     │  │   Routes    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Domains    │  │  Workspace  │  │   Learning   │              │
│  │  Routes     │  │   Routes    │  │   Paths      │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     Database (PostgreSQL)                        │
│                     Hosted on Supabase                            │
│                                                                   │
│  Tables: Users, Domains, Projects, GitHubProjects, Bookmarks,     │
│          Progress, Notifications, etc.                            │
└─────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
project-hub/
├── frontend/                          # Next.js Frontend (TypeScript)
│   ├── app/                          # App Router pages
│   │   ├── (marketing)/              # Marketing pages (public)
│   │   │   └── page.tsx              # Landing page
│   │   ├── (workstation)/             # Authenticated pages
│   │   │   ├── dashboard/             # User dashboard
│   │   │   ├── domains/               # Domain browsing
│   │   │   ├── projects/              # Project listing
│   │   │   ├── workspace/             # User workspace
│   │   │   ├── analytics/             # Analytics dashboard
│   │   │   ├── achievements/          # Gamification
│   │   │   ├── leaderboard/           # Leaderboard
│   │   │   ├── admin/                 # Admin panel
│   │   │   └── login/                 # Login page
│   │   ├── api/                      # API routes (Next.js)
│   │   ├── globals.css               # Global styles
│   │   └── layout.tsx                # Root layout
│   ├── components/                   # React components
│   ├── lib/                          # Utilities & API client
│   │   ├── api.ts                    # API client with caching
│   │   ├── auth.ts                   # Authentication utilities
│   │   ├── prismadb.ts               # Prisma client
│   │   └── utils.ts                   # Utility functions
│   ├── hooks/                        # Custom React hooks
│   ├── types/                         # TypeScript types
│   └── public/                       # Static assets
│
├── backend-python/                    # FastAPI Backend (Python)
│   ├── src/
│   │   ├── main.py                   # FastAPI app instance
│   │   ├── core/                     # Core functionality
│   │   │   ├── config.py              # Settings (Pydantic)
│   │   │   ├── security.py            # JWT & password utils
│   │   │   ├── database.py            # SQLAlchemy async setup
│   │   │   └── exceptions.py          # Custom exceptions
│   │   ├── api/
│   │   │   ├── dependencies.py       # Auth & DB dependencies
│   │   │   └── routes/                # API routes
│   │   │       ├── auth.py            # Authentication
│   │   │       ├── user.py            # User management
│   │   │       ├── domains.py         # Domain CRUD
│   │   │       ├── projects.py        # Project management
│   │   │       ├── github_projects.py # GitHub projects
│   │   │       ├── workspace.py       # Workspace/timer
│   │   │       ├── gamification.py    # Achievements
│   │   │       ├── analytics.py      # Stats & insights
│   │   │       ├── notifications.py   # User notifications
│   │   │       └── learning_paths.py  # Learning paths
│   │   ├── models/                   # SQLAlchemy models
│   │   │   ├── base.py               # Base model
│   │   │   ├── user.py               # User model
│   │   │   ├── project.py            # Project & Domain models
│   │   │   └── tracking.py           # Progress & notifications
│   │   ├── schemas/                  # Pydantic schemas
│   │   └── services/                 # Business logic
│   ├── tests/                        # Pytest tests
│   ├── alembic/                      # Database migrations
│   ├── pyproject.toml                # Python dependencies
│   └── alembic.ini                   # Alembic config
│
├── docs/                             # Documentation PDFs
├── room/                             # Project specifications
└── README.md                         # Main documentation
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5.12 | React framework with App Router |
| TypeScript | 5.0 | Type-safe JavaScript |
| Tailwind CSS | v4 | Utility-first CSS |
| Radix UI | - | Accessible UI primitives |
| NextAuth.js | - | Authentication (Google OAuth) |
| Axios | - | HTTP client |
| Lucide React | - | Icon library |
| Inter | - | Display font |
| JetBrains Mono | - | Code font |

### Backend (Python FastAPI)

| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.129+ | Modern Python web framework |
| SQLAlchemy | 2.0+ | Async ORM |
| asyncpg | 0.31+ | Async PostgreSQL driver |
| Pydantic | 2.12+ | Data validation |
| Pydantic Settings | 2.13+ | Settings management |
| JWT (PyJWT) | 2.11+ | Token authentication |
| Passlib/Bcrypt | 5.0+ | Password hashing |
| Alembic | 1.18+ | Database migrations |
| Uvicorn | 0.41+ | ASGI server |
| Cerebras/Google GenAI | - | AI integration |
| pytest | 9.0+ | Testing framework |

### Database

| Technology | Purpose |
|------------|---------|
| PostgreSQL 15 | Primary database |
| Supabase | PostgreSQL hosting |
| Prisma | Node.js ORM (original backend) |

### External Services

| Service | Purpose |
|---------|---------|
| GitHub API | Repository data fetching |
| Google OAuth | Social authentication |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Cloudinary | Image uploads (optional) |

---

## Data Models

### User Model

The `User` model represents platform users with authentication, profile, and gamification data.

```python
class User(Base):
    # Identification
    id: str                          # UUID primary key
    email: str                       # Unique email
    name: str                        # Full name
    
    # Profile
    first_name: Optional[str]
    last_name: Optional[str]
    image: Optional[str]             # Avatar URL
    profile_image: Optional[str]
    bio: Optional[str]               # User biography
    headline: Optional[str]          # Job title
    location: Optional[str]
    github_url: Optional[str]
    portfolio_url: Optional[str]
    
    # Authentication
    role: str                        # "STUDENT" or "ADMIN"
    is_verified: bool
    email_verified: Optional[datetime]
    password_hash: Optional[str]    # Hashed password
    
    # Timestamps
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    # Gamification
    total_time_spent: int            # Total minutes
    current_streak: int              # Current login streak
    longest_streak: int              # Best streak
    points: int                      # Gamification points
    level: int                       # User level
    last_active_date: Optional[datetime]
    
    # Relationships
    notifications: List[Notification]
    progress: List[ProjectProgress]
    github_progress: List[GitHubProjectProgress]
    bookmarks: List[Bookmark]
```

### Domain Model

Represents the 5 professional domains.

```python
class Domain(Base):
    id: str
    name: str                        # e.g., "Web Development"
    slug: str                        # e.g., "web-development"
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    github_projects: List[GitHubProject]
    projects: List[Project]
```

### Project Models

Two types of projects exist in the system:

#### Project (Basic)
```python
class Project(Base):
    id: str
    title: str
    description: str
    domain_id: str                   # Foreign key to Domain
    domain: Domain
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    progress: List[ProjectProgress]
    bookmarks: List[Bookmark]
```

#### GitHubProject (Enhanced)
```python
class GitHubProject(Base):
    # Basic Info
    id: str
    title: str
    slug: Optional[str]
    description: str
    repo_url: str                    # GitHub repository URL
    repo_owner: Optional[str]
    repo_name: Optional[str]
    default_branch: str               # Default branch (main/master)
    download_url: str
    live_url: Optional[str]
    download_count: int
    
    # Domain
    domain_id: str
    domain: Domain
    
    # GitHub Metrics
    stars: int
    forks: int
    language: Optional[str]           # Primary language
    tech_stack: List[str]            # Technologies used
    difficulty: str                  # BEGINNER/INTERMEDIATE/ADVANCED
    topics: List[str]                # GitHub topics
    project_type: str                # PROJECT type
    last_updated: Optional[datetime]
    is_active: bool
    
    # Content
    author: str
    introduction: Optional[str]
    implementation: Optional[str]
    technical_skills: List[str]
    tools_used: List[str]
    concepts_used: List[str]
    
    # Project Details
    sub_domain: Optional[str]
    case_study: Optional[str]
    problem_statement: Optional[str]
    solution_description: Optional[str]
    prerequisites: List[str]
    prerequisites_text: Optional[str]
    estimated_min_time: int          # Minutes
    estimated_max_time: int
    deliverables: List[str]
    supposed_deadline: Optional[str]
    optional_extensions: Optional[str]
    requirements: List[str]
    requirements_text: Optional[str]
    evaluation_criteria: Optional[str]
    
    # QA
    qa_status: str                   # PENDING/APPROVED/REJECTED
    qa_feedback: Optional[str]
    reviewed_at: Optional[datetime]
    reviewed_by: Optional[str]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    progress: List[GitHubProjectProgress]
    bookmarks: List[Bookmark]
```

### Tracking Models

#### ProjectProgress
```python
class ProjectProgress(Base):
    id: str
    user_id: str
    project_id: str
    
    status: str                      # NOT_STARTED/IN_PROGRESS/COMPLETED
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    time_spent: int                  # Minutes
    is_running: bool
    last_timer_start: Optional[datetime]
    target_completion_date: Optional[datetime]
    notes: Optional[str]
    
    created_at: datetime
    updated_at: datetime
    
    user: User
    project: Project
```

#### GitHubProjectProgress
```python
class GitHubProjectProgress(Base):
    id: str
    user_id: str
    github_project_id: str
    
    status: str                      # IN_PROGRESS/COMPLETED
    started_at: datetime
    completed_at: Optional[datetime]
    time_spent: int                  # Seconds
    notes: Optional[str]
    checklist: List[bool]             # Task completion
    
    created_at: datetime
    updated_at: datetime
    
    user: User
    github_project: GitHubProject
```

#### Bookmark
```python
class Bookmark(Base):
    id: str
    user_id: str
    project_id: Optional[str]         # FK to Project
    github_project_id: Optional[str] # FK to GitHubProject
    
    created_at: datetime
    
    user: User
    project: Optional[Project]
    github_project: Optional[GitHubProject]
```

#### Notification
```python
class Notification(Base):
    id: str
    user_id: str
    message: str
    type: str                         # Notification type
    related_project_id: Optional[str]
    is_read: bool
    created_at: datetime
    
    user: User
```

---

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login with email/password | No |
| GET | `/me` | Get current user | Yes |
| POST | `/refresh` | Refresh access token | No |
| POST | `/logout` | Logout user | Yes |
| POST | `/google-auth` | Google OAuth login | No |
| PUT | `/update-profile` | Update user profile | Yes |

### User Routes (`/api/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/bookmarks` | Get user bookmarks | Yes |
| POST | `/bookmarks/{projectId}` | Toggle bookmark | Yes |
| GET | `/bookmarks/{projectId}/check` | Check if bookmarked | Yes |
| POST | `/bookmarks/batch-check` | Batch check bookmarks | Yes |
| GET | `/progress` | Get project progress | Yes |
| PUT | `/progress/{projectId}` | Update progress | Yes |
| GET | `/github-progress` | Get GitHub project progress | Yes |
| PUT | `/github-progress/{projectId}` | Update GitHub progress | Yes |
| PUT | `/profile` | Update profile | Yes |
| POST | `/profile/image` | Upload profile image | Yes |

### Domain Routes (`/api/domains`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/` | Get all domains | No |
| GET | `/{id}` | Get domain by ID | No |
| GET | `/slug/{slug}` | Get domain by slug | No |
| POST | `/` | Create domain (Admin) | Yes (Admin) |
| PUT | `/{id}` | Update domain (Admin) | Yes (Admin) |
| DELETE | `/{id}` | Delete domain (Admin) | Yes (Admin) |

### Project Routes (`/api/projects`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/` | Get all projects | No |
| GET | `/{id}` | Get project by ID | No |
| GET | `/domain/{domainId}` | Get projects by domain | No |
| POST | `/` | Create project (Admin) | Yes (Admin) |
| PUT | `/{id}` | Update project (Admin) | Yes (Admin) |
| DELETE | `/{id}` | Delete project (Admin) | Yes (Admin) |

### GitHub Projects Routes (`/api/github-projects`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/` | List projects (paginated) | No |
| GET | `/{id}` | Get project by ID | No |
| GET | `/domain/{domainSlug}` | Get by domain | No |
| GET | `/search` | Search projects | No |
| POST | `/{id}/review` | Submit for review (Admin) | Yes (Admin) |

### Analytics Routes (`/api/analytics`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/dashboard` | Get dashboard stats | Yes |
| GET | `/leaderboard` | Get user leaderboard | Yes |
| POST | `/update-streak` | Update daily streak | Yes |
| GET | `/time-tracking` | Get time tracking data | Yes |
| GET | `/progress-insights` | Get AI insights | Yes |

### Workspace Routes (`/api/workspace`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/timer/active` | Get active timer | Yes |

### Gamification Routes (`/api/gamification`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/achievements/all` | Get all achievements | No |
| GET | `/achievements/user` | Get user achievements | Yes |

### Notifications Routes (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/` | Get user notifications | Yes |
| GET | `/unread-count` | Get unread count | Yes |
| PUT | `/{id}/read` | Mark as read | Yes |
| PUT | `/read-all` | Mark all as read | Yes |

### Learning Paths Routes (`/api/learning-paths`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/` | Get all learning paths | No |
| GET | `/recommendations` | Get personalized recommendations | Yes |

---

## Features

### 1. User Authentication
- **Email/Password Registration**: Standard registration with email validation
- **JWT Authentication**: Stateless token-based authentication
- **Token Refresh**: Automatic token refresh mechanism
- **Google OAuth**: Social login via Google
- **Role-based Access**: STUDENT and ADMIN roles

### 2. Domain Management
- **5 Professional Domains**: Web Dev, AI, ML, Data Science, Cybersecurity
- **Domain Browsing**: View projects by domain
- **Domain Details**: Description, project count, slug-based routing

### 3. Project Management
- **GitHub Integration**: Curated GitHub repositories
- **Rich Metadata**: Stars, forks, languages, tech stack, difficulty
- **Filtering**: By domain, difficulty, language, project type
- **Search**: Full-text search across projects
- **Pagination**: Efficient paginated listings

### 4. User Progress Tracking
- **Project Progress**: Track status (NOT_STARTED, IN_PROGRESS, COMPLETED)
- **Time Tracking**: Track time spent on each project
- **Notes**: Personal notes per project
- **Checklist**: Task checklist for GitHub projects
- **Target Dates**: Set completion goals

### 5. Bookmarks
- **Save Favorites**: Bookmark projects for quick access
- **Batch Checking**: Efficient bookmark status checking
- **Organization**: Personal project collections

### 6. Gamification
- **Points System**: Earn points for activities
- **Streaks**: Daily login streaks
- **Levels**: User progression levels
- **Leaderboard**: Compete with other users
- **Achievements**: Unlock achievements (planned)

### 7. Analytics & Insights
- **Dashboard**: Personal statistics overview
- **Time Tracking**: Visual charts of time spent
- **Progress Insights**: AI-powered recommendations
- **Activity History**: Track completed projects

### 8. Notifications
- **Real-time Updates**: Stay informed about activities
- **Read/Unread**: Mark notifications as read
- **Bulk Actions**: Mark all as read

### 9. Admin Panel
- **Domain Management**: Create/edit/delete domains
- **Project Management**: Full CRUD for projects
- **User Management**: View and manage users
- **QA Review**: Review and approve submitted projects

### 10. Workspace
- **Active Timer**: Track time on current project
- **Session Management**: Multiple work sessions

---

## Authentication

### JWT Flow

1. **Registration**: User submits email/password
2. **Login**: Server validates credentials, issues JWT
3. **Token Storage**: Access token in memory, refresh token in localStorage
4. **Protected Requests**: Include `Authorization: Bearer <token>`
5. **Token Refresh**: Automatic refresh on 401 responses

### Token Structure

```python
# Access Token
{
    "sub": "user-id",
    "exp": "expiration-timestamp",
    "type": "access"
}

# Refresh Token (longer expiry)
{
    "sub": "user-id",
    "exp": "expiration-timestamp",
    "type": "refresh"
}
```

### Security Features

- **Password Hashing**: Bcrypt with salt
- **Token Expiry**: 7 days for access, 30 days for refresh
- **CORS Protection**: Configurable allowed origins
- **Rate Limiting**: IP-based abuse prevention (planned)

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │   Domain    │       │  GitHub     │
│             │       │             │       │  Project    │
│ - id        │       │ - id        │◄──────│ - id        │
│ - email     │       │ - name      │       │ - domain_id │
│ - name      │       │ - slug      │       │ - title     │
│ - role      │       │ - description│      │ - repo_url  │
│ - points    │       └─────────────┘       │ - stars     │
│ - level     │                            │ - forks     │
│ - streak    │                            │ - difficulty│
└──────┬──────┘                            └──────┬──────┘
       │                                          │
       │         ┌─────────────┐                 │
       │         │  Bookmark   │                 │
       └────────►│             │◄────────────────┘
                │ - user_id   │
                │ - project_id│
                │ - github_id │
                └──────┬──────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Project    │ │  GitHub     │ │Notification │
│ Progress    │ │ Progress   │ │             │
│ - user_id   │ │ - user_id   │ │ - user_id  │
│ - project_id│ │ - github_id │ │ - message  │
│ - status    │ │ - status    │ │ - is_read  │
│ - time_spent│ │ - time_spent│ └─────────────┘
│ - notes     │ │ - checklist │
└─────────────┘ └─────────────┘
```

### Indexes

| Table | Column | Type |
|-------|--------|------|
| users | email | Unique |
| domains | slug | Unique |
| github_projects | slug | Unique |
| github_projects | stars | Index |
| github_projects | language | Index |
| github_projects | difficulty | Index |
| github_projects | project_type | Index |
| github_projects | is_active | Index |
| bookmarks | user_id | Index |
| bookmarks | project_id | Index |
| notifications | user_id | Index |
| notifications | is_read | Index |

---

## Frontend Structure

### Pages Overview

#### Marketing Pages (`/`)
- **Landing Page** (`/`): Main marketing page

#### Authentication (`/login`)
- **Login Page**: Email/password and Google OAuth

#### Workstation Pages (Authenticated)

**Dashboard** (`/dashboard`)
- Overview statistics
- Recent activity
- Quick access to projects

**Domains** (`/domains`)
- Browse all 5 domains
- Domain cards with project counts
- `/domains/{slug}`: Domain details with projects

**Projects** (`/projects`)
- Project listings with filters
- `/projects/{projectId}`: Project details

**GitHub Projects** (`/github-projects/{id}`)
- Enhanced project view
- GitHub repository integration
- Progress tracking

**Workspace** (`/workspace`)
- Active timer
- Notes management
- `/workspace/{id}`: Project workspace

**Analytics** (`/analytics`)
- Personal statistics
- Time tracking charts
- Progress insights

**Achievements** (`/achievements`)
- Gamification badges
- Points and levels

**Leaderboard** (`/leaderboard`)
- User rankings
- Streak leaders

**Notifications** (`/notifications`)
- User notifications
- Mark as read

**Profile** (`/profile`)
- User profile management
- Image upload

**Settings** (`/settings`)
- Account settings

**Search** (`/search`)
- Global project search
- Advanced filters

**Learning Paths** (`/learning-paths`)
- Curated learning routes
- AI recommendations

#### Admin Panel (`/admin`)

- **Dashboard** (`/admin`): Admin overview
- **Users** (`/admin/users`): User management
- **Domains** (`/admin/domains`): Domain CRUD
- **Projects** (`/admin/projects`): Project management
- **Approvals** (`/admin/approvals`): QA review
- **GitHub Projects** (`/admin/github-projects`): GitHub project management

### API Client Features

The frontend includes an enhanced API client with:

- **Automatic Token Refresh**: Handles 401 responses
- **Request Caching**: Reduces duplicate requests
- **Type Safety**: Full TypeScript support
- **Error Handling**: Centralized error management

---

## Configuration

### Environment Variables

#### Backend (`.env`)

```env
# Application
PROJECT_NAME="Project Hub API"
VERSION="1.0.0"
API_V1_STR="/api"

# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Security
SECRET_KEY="your-secret-key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days

# External APIs
GITHUB_TOKEN="ghp_xxx"
CEREBRAS_API_KEY="xxx"
GEMINI_API_KEY="xxx"

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
```

#### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Database Configuration

The application uses:
- **PostgreSQL** as the primary database
- **SQLAlchemy 2.0** with async support
- **Alembic** for migrations
- **asyncpg** as the async PostgreSQL driver

### Deployment

#### Frontend (Vercel)
1. Import GitHub repository
2. Set root directory to `frontend`
3. Configure environment variables
4. Deploy with auto-deploy on push

#### Backend (Render)
1. Create Web Service
2. Set root directory to `backend-python`
3. Build command: `npm install && npx prisma generate`
4. Start command: `npm start`
5. Configure environment variables

---

## Development Guidelines

### Python Backend (FastAPI)

Follow these rules when working on the backend:

1. **Follow the project.md blueprint**: Strictly adhere to the specification
2. **Docstrings**: Every function, route, and class must have proper docstrings
3. **Type Hints**: Use Python type hints throughout
4. **PEP 8**: Follow Python style conventions
5. **Use `uv`**: Manage dependencies with `uv add <package>`
6. **Pydantic**: Use Pydantic for data validation
7. **Testing**: Write comprehensive tests with pytest
8. **OpenAPI**: Let FastAPI auto-generate Swagger documentation

### Database Operations

- Use async SQLAlchemy operations
- Always use dependency injection for DB sessions
- Implement proper error handling with HTTPException
- Use transactions for multi-step operations

### API Design

- RESTful conventions
- Consistent response formats
- Proper HTTP status codes
- Pagination for list endpoints
- Filtering and search capabilities

---

## Testing

### Backend Tests

Run tests with pytest:

```bash
cd backend-python
pytest
```

Test structure:
- `tests/conftest.py`: Fixtures and configuration
- `tests/test_auth.py`: Authentication tests
- `tests/test_projects.py`: Project endpoint tests
- `tests/test_user.py`: User management tests

---

## Future Enhancements

Based on the project roadmap:

1. **AI Integration**: Use Cerebras/Google GenAI for project recommendations
2. **Real-time Features**: WebSocket support for live updates
3. **Social Features**: Comments, likes, following
4. **Advanced Analytics**: More detailed progress insights
5. **Achievements System**: Full gamification implementation
6. **Learning Paths**: Curated project sequences
7. **Collaboration**: Team project features
8. **API Versioning**: Proper API versioning strategy

---

## Support & Resources

- **Frontend README**: `frontend/README.md`
- **Backend README**: `backend-python/README.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **OAuth Setup**: `GOOGLE_OAUTH_SETUP.md`
- **Technical Docs**: `TECHNICAL_DOCUMENTATION.md`
- **Product Plans**: `docs/` directory

---

*Last Updated: March 2026*
