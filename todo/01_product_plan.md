# Domain-Based Student Project Platform — End-to-End Product Plan

## 1. Problem Statement

### 1.1 Current Reality for Students

Students today face three structural problems when trying to become job-ready:

| Problem | Description |
|---------|-------------|
| **Project Confusion** | Students know domains (AI, Web Dev, Cybersecurity, etc.) but do not know what to build. They rely on random YouTube tutorials, GitHub repos, or copied mini-projects. |
| **Lack of Industry-Grade Structure** | Existing projects rarely include: real-world problem framing, case studies, clear deliverables, time expectations, difficulty calibration. |
| **No Progressive Skill Path** | Projects are not ordered from easy → medium → hard. Students jump into advanced topics without prerequisites. |

**Result:**
- Weak portfolios
- Low confidence
- Poor interview performance
- Recruiters see repetitive, low-signal projects

### 1.2 Gap in the Market

There is no single platform that:
- Starts from domain selection
- Provides hundreds of structured, difficulty-segregated projects
- Treats projects as mini real-world engagements, not tutorials

---

## 2. Solution Overview

A domain-first, project-centric learning platform where students:

1. **Select a domain**
2. **Browse hundreds of projects** in that domain
3. **Choose projects** categorized by:
   - Difficulty (Easy / Medium / Hard)
   - Time commitment
   - Skill focus
4. **Work on projects** that feel like real industry assignments

> **This is not a course platform. This is a project execution and portfolio-building platform.**

---

## 3. Supported Domains

| Domain | Description |
|--------|-------------|
| AI | Artificial Intelligence projects |
| Machine Learning | ML algorithms and models |
| Data Science | Data analysis and visualization |
| Web Development | Full-stack web applications |
| Cybersecurity | Security tools and practices |
| Cloud Computing | Cloud infrastructure and services |
| IoT | Internet of Things projects |
| Embedded Systems | Hardware-software integration |
| Finance | Financial applications |
| Stock Market & Crypto Trading | Trading platforms and analysis |
| Digital Marketing | Marketing tools and automation |

Each domain is treated as an independent vertical with its own project taxonomy.

---

## 4. Core Platform Philosophy

| Principle | Meaning |
|-----------|---------|
| **Domain-first** | Users start with what they want to become |
| **Project-driven** | No passive learning, only execution |
| **Difficulty-aware** | Clear separation of Easy / Medium / Hard |
| **Realistic** | Projects mirror real industry problems |
| **Outcome-focused** | Deliverables > lectures |

---

## 5. Project Structure

Each project is a structured **project dossier**, not a blog post.

### 5.1 Mandatory Sections per Project

| Section | Description |
|---------|-------------|
| **Project Title** | Clear, descriptive name |
| **Domain & Sub-domain** | Classification |
| **Difficulty Level** | Easy / Medium / Hard |
| **Industry Context / Case Study** | Realistic business or technical background |
| **Problem Statement** | Clear, bounded, realistic problem |
| **What You Need to Build / Do** | Explicit scope and clear success criteria |
| **Prerequisites** | Skills, tools, concepts required |
| **Estimated Time Commitment** | Minimum time and maximum time (deadline window) |
| **Deliverables** | Code, Documentation, Reports, Dashboards, Deployments |
| **Optional Extensions** | For Advanced Students |
| **Evaluation Criteria** | Optional but powerful |

---

## 6. User Roles

### 6.1 Student

1. Select domain
2. Browse projects
3. Filter by difficulty, time, skills
4. View full project details
5. Start and track progress
6. Submit completed projects
7. Receive feedback

### 6.2 Admin / Content Team (Internal)

- Create and manage domains
- Add/edit projects
- Tag prerequisites and skills
- Control visibility and difficulty calibration

*(Future: Mentors, Recruiters – not in MVP)*

---

## 7. User Journey

### 7.1 Entry Point
- Landing page with: value proposition, domain cards

### 7.2 Domain Selection
- User selects a domain (e.g., AI)
- Lands on Domain Overview Page

### 7.3 Domain Overview Page
- Domain description
- Skill map (optional visual)
- Project count by difficulty

### 7.4 Project Browsing
- **Filters:** Difficulty, Time commitment, Sub-domain, Tools/Tech
- Project cards grid

### 7.5 Project Detail Page
- Full project dossier
- Clear CTA: Start Project

---

## 8. UX & UI Design

### 8.1 Design Principles
- Clean
- Minimal
- Focused on readability
- No clutter

### 8.2 Key UI Components
- Domain Cards
- Project Cards
- Difficulty Badges
- Time Range Indicators
- Prerequisite Tags
- Structured Content Sections

### 8.3 Layout
- **Left:** Filters
- **Center:** Project Grid
- **Full-width:** Project Detail Pages

---

## 9. Information Architecture

```
Home
├── Domains
│   ├── AI
│   │   ├── Easy Projects
│   │   ├── Medium Projects
│   │   └── Hard Projects
│   ├── Web Development
│   └── ...
├── Project Detail
└── Admin Dashboard
```

---

## 10. Tech Stack

### 10.1 Frontend
- **Framework:** React / Next.js
- **Styling:** Tailwind CSS
- **State Management:** Zustand / Redux Toolkit

### 10.2 Backend
- **Runtime:** Node.js
- **Framework:** Express / NestJS
- **API:** REST (initially)

### 10.3 Database
- **Primary DB:** PostgreSQL
- **ORM:** Prisma

### 10.4 Authentication (Optional for MVP)
- Clerk / Auth0 / Firebase Auth

### 10.5 Hosting
- **Frontend:** Vercel
- **Backend:** Railway / Render
- **Database:** Supabase / Neon

---

## 11. Data Models

### Domain
| Field | Type |
|-------|------|
| id | UUID |
| name | String |
| description | Text |

### Project
| Field | Type |
|-------|------|
| id | UUID |
| domain_id | UUID |
| title | String |
| difficulty | Enum (Easy/Medium/Hard) |
| case_study | Text |
| problem_statement | Text |
| requirements | JSON |
| prerequisites | JSON |
| min_time | String |
| max_time | String |
| deliverables | JSON |

---

## 12. MVP Scope

### Include
- Domain selection
- Project browsing
- Project detail pages
- Admin project creation

### Exclude
- Progress tracking
- Submissions
- Certificates
- Community features

---

## 13. Future Expansion

- User accounts & saved projects
- Project submissions
- Mentor feedback
- Recruiter access
- AI-generated project suggestions
- Skill gap analysis

---

## 14. Why This Platform Will Work

- Solves a real, painful problem
- Not another course marketplace
- High signal for recruiters
- Strong portfolio alignment
- Scales across domains

---

## 15. Final Positioning Statement

> **A domain-first project platform that turns learners into builders by giving them industry-grade problems, not tutorials.**
