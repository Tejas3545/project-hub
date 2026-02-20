# Project Hub - Agent Knowledge Base (AGENT.md)

This document provides essential context for any AI agent interacting with the Project Hub codebase.

## 1. Project Overview
**Project Hub** is a curated platform featuring 992 authentic GitHub repositories across 5 professional domains (Web Development, AI, Machine Learning, Data Science, Cybersecurity). It is designed for developers to learn by building industry-grade applications. It provides a real-world solution framework where users can track their progress, time, notes, and milestones.

## 2. Architecture & Tech Stack
The project is split into a modern frontend and a robust backend.

### Frontend (`/frontend`)
- **Framework**: Next.js 15.5.12 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS v4, Radix UI primitives
- **State/Auth**: React Context API, NextAuth.js (Google OAuth)
- **Design Language**: "Antintern-Inspired" - Clean, professional interface with glassmorphism effects, a visually rich Blue Dark Mode (strictly NO orange colors), and smooth animations.

### Backend (`/backend`)
- **Runtime & Framework**: Node.js 18+, Express.js 4.x
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL 15 (hosted on Supabase), Prisma 5.x
- **Auth & Security**: JWT (jsonwebtoken), Helmet, CORS, Express Rate Limit
- **API Style**: RESTful APIs

## 3. Core Features & Concepts
- **Domains & Difficulty**: Projects are categorized into domains and have precise difficulty levels (Beginner, Intermediate, Advanced).
- **Gamification & Tracking**: The system tracks time spent (`TimeSession`), notes (`ProjectNote`), deadlines, and includes gamification elements like XP points, levels, streaks, and `Achievement`s.
- **GitHub Integrations**: Automatically fetches project details from GitHub. Users have progress trackers specifically for these `GitHubProject`s.
- **Roles & Workflows**: Users have roles (`STUDENT`, `ADMIN`), and projects have QA workflows (`QaStatus`).

## 4. Database Schema Overview (Prisma)
The database uses PostgreSQL via Prisma (`backend/prisma/schema.prisma`).
Key models include:
- `User`: Handles authentication (JWT/NextAuth), gamification, and profile data.
- `Project` / `GitHubProject`: Represents the applications, including difficulty, requirements, deliverables, and tech stack.
- `Domain`: Represents the category of the project.
- `ProjectProgress` / `GitHubProjectProgress`: Tracks the user's journey through a project (status, time spent).
- `TimeSession`, `ProjectNote`, `Deadline`, `Achievement`: M3 Workspace & Gamification features.

## 5. Setup & Development Guidelines

### Local Development Flow
1. **Backend** (port 5000): 
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```
2. **Frontend** (port 3000):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Agent Contribution Guidelines
- **UI/UX Consistency**: Any frontend additions must strictly adhere to the Antintern-inspired Blue Dark Mode. Avoid introducing default colors that clash.
- **Type Safety**: Thoroughly implement TypeScript interfaces for any new backend models or frontend components.
- **Database Changes**: If adding new tables or columns, modify `prisma/schema.prisma` and execute `npx prisma db push`.
- **API Standards**: Add new endpoints under `backend/src/routes` and wire them into `backend/src/controllers`. Use JWT authentication middleware for protected routes.
- **Code Organization**: Ensure no test/testing mock files remain in the production codebase unless specifically requested. Use standard `camelCase` naming conventions for models and controllers.
