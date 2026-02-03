# Project Hub - Real GitHub Projects Platform

> **Build Real Skills Through Real Projects** - A curated platform featuring 487+ authentic GitHub repositories across 5 professional domains, designed for developers to learn by building industry-grade applications.

![Project Hub](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-green?style=for-the-badge&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

## 🚀 Features

### ✨ Real GitHub Projects
- **487+ Real Repositories**: Curated collection of production-ready projects
- **5 Professional Domains**: Web Development, AI, Machine Learning, Data Science, Cybersecurity
- **Direct Downloads**: One-click download of complete source code via GitHub ZIP archives
- **Live Demos**: Access to deployed applications when available
- **Technology Stack Info**: View frameworks and libraries used in each project

### 🔒 Authentication & Security
- **Protected Access**: Login required to access domain pages and projects
- **JWT Authentication**: Secure token-based authentication system
- **Rate Limiting**: IP-based protection against abuse
- **Input Sanitization**: XSS and SQL injection prevention
- **Security Headers**: OWASP-compliant security configuration

### 🎨 Professional UI/UX
- **Glassmorphism Design**: Modern gradient cards with smooth animations
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Color-Coded Difficulty**: Visual badges (Beginner/Intermediate/Advanced)
- **Search & Filters**: Find projects by technology, difficulty, or keywords
- **Download Analytics**: Track popular projects and downloads

### 📊 Project Features
- **Detailed Metadata**: Repository stats, stars, forks, language breakdown
- **Tech Stack Tags**: Visual representation of technologies used
- **Difficulty Levels**: Auto-calculated based on code complexity
- **GitHub Integration**: Real-time sync with GitHub API
- **Pagination**: Smooth browsing through large project collections

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: React Context API
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, Rate Limiting

### Database
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Schema**: Users, Domains, Projects, GitHubProjects, Bookmarks, Progress

### External APIs
- **GitHub API**: Repository data fetching
- **Authentication**: OAuth-compatible (JWT-based)

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database (Supabase recommended)
- GitHub Personal Access Token
- Git

### 1. Clone Repository

```bash
git clone https://github.com/Tejas3545/project-hub.git
cd project-hub
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `backend/` directory:

```env
# Database
DATABASE_URL="your-supabase-connection-string"

# Server
PORT=5000
NODE_ENV=development

# JWT Secrets
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# GitHub API
GITHUB_TOKEN="your-github-token"

# CORS
ALLOWED_ORIGINS="http://localhost:3000"
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seedRealGitHubProjects.ts
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 5. Run Development Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Access: http://localhost:3000

---

## 🎯 Domain Coverage

### 1. Web Development (100 projects)
React, Vue, Angular, Node.js, Next.js, Express, Django, Flask

### 2. Artificial Intelligence (100 projects)
TensorFlow, PyTorch, OpenAI, Hugging Face, LangChain

### 3. Machine Learning (89 projects)
Scikit-learn, XGBoost, Keras, AutoML, MLflow

### 4. Data Science (98 projects)
Pandas, NumPy, Jupyter, Matplotlib, Seaborn, SQL

### 5. Cybersecurity (100 projects)
Python, Kali Linux, Metasploit, OWASP Tools

**Total: 487 Real GitHub Projects**

---

## 🚀 Deployment

### Backend (Render)
- Connect GitHub repository
- Deploy from `backend/` directory
- Add environment variables
- Live: https://project-hub1.onrender.com

### Frontend (Vercel)
- Import GitHub repository
- Framework: Next.js
- Root directory: `frontend/`
- Environment: `NEXT_PUBLIC_API_URL`

---

## 📝 License

MIT License

---

## 👨‍💻 Author

**Tejas Solanki** - [@Tejas3545](https://github.com/Tejas3545)

---

**⭐ If you find this project helpful, please give it a star on GitHub!**

---

*Last Updated: February 1, 2026*
