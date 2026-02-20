#  Project Hub - Real-World Project Platform

> **Build Real Skills Through Real Projects** - A curated platform featuring 992 authentic GitHub repositories across 5 professional domains, designed for developers to learn by building industry-grade applications.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-green?style=for-the-badge&logo=postgresql)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)

##  Production Ready

✅ **992 Real GitHub Projects** - Fully seeded and ready for deployment  
✅ **Clean Codebase** - All test files removed, organized structure  
✅ **Deployment Ready** - See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guide  
✅ **Documented** - See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for full documentation

---

##  Key Features

###  Real GitHub Projects
- **992 Curated Repositories**: Production-ready projects across 5 domains
- **Quality Filtered**: No libraries, frameworks, or tools - only real applications
- **GitHub API Sourced**: Automatically fetched and filtered from 10,000+ repositories
- **Technology Stack Insights**: View frameworks and libraries used in each project

###  5 Professional Domains
1. **Web Development** (200 projects) - React, Next.js, Node.js, Express, Vue, Angular
2. **Artificial Intelligence** (200 projects) - TensorFlow, PyTorch, OpenAI, LangChain
3. **Machine Learning** (200 projects) - Scikit-learn, XGBoost, Keras, MLflow
4. **Data Science** (193 projects) - Pandas, NumPy, Jupyter, Matplotlib, SQL
5. **Cybersecurity** (199 projects) - Python, Kali Linux, Metasploit, OWASP Tools

###  Authentication & Security
- **JWT Authentication**: Secure token-based access control
- **Google OAuth**: Single sign-on with Google accounts
- **Protected Routes**: Login required for domain and project access
- **Rate Limiting**: IP-based abuse prevention
- **Security Headers**: OWASP-compliant configuration (Helmet, CORS)

###  Modern UI/UX
- **Antintern-Inspired Design**: Clean, professional interface with glassmorphism effects
- **Blue Dark Mode**: Visually rich dark theme with NO orange colors
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Professional transitions and interactions
- **Accessibility**: ARIA-compliant components with screen reader support

###  Advanced Features
- **Project Workspace**: Track time spent, take notes, manage deliverables
- **Progress Tracking**: Save your work across sessions (auto-save every 30s)
- **Search & Filters**: Find projects by technology, difficulty, domain, or keywords
- **Detailed Metadata**: Repository stats, stars, forks, language breakdown
- **Difficulty Levels**: Visual badges for Beginner, Intermediate, Advanced
- **Bookmarking**: Save favorite projects for quick access

---

##  Technology Stack

### Frontend (Deployed on Vercel)
```
Framework:     Next.js 15.5.12 (App Router)
Language:      TypeScript 5.0
Styling:       Tailwind CSS v4
UI Components: Radix UI primitives + Custom components
State:         React Context API  
Auth:          NextAuth.js with Google OAuth
HTTP Client:   Axios
Fonts:         Inter (display), JetBrains Mono (code)
Icons:         Lucide React
```

### Backend (Deployed on Render)
```
Runtime:       Node.js 18+
Framework:     Express.js 4.x
Language:      TypeScript
ORM:           Prisma 5.x
Database:      PostgreSQL (Supabase)
Auth:          JWT (jsonwebtoken)
Security:      Helmet, CORS, Express Rate Limit
API Style:     RESTful with JWT authentication
```

### Database (Supabase)
```
Database:      PostgreSQL 15
ORM:           Prisma
Tables:        User, Domain, Project, GitHubProject,
               Bookmark, UserProgress, GithubProgress
```

### External Services
- **GitHub API**: Repository data fetching and downloads
- **Cloudinary**: Image uploads (optional)
- **Supabase**: PostgreSQL database hosting
- **Render**: Backend API deployment
- **Vercel**: Frontend deployment with auto-deploy

---

##  Installation & Local Development

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- GitHub Personal Access Token
- Google OAuth credentials (optional)

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

Create `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
PORT=5000
NODE_ENV=development
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-refresh-secret-change-this"
GITHUB_TOKEN="ghp_your_github_personal_access_token"
ALLOWED_ORIGINS="http://localhost:3000"
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/addProjectsComplete.ts  # Seed data (optional)
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="generate-using: openssl rand -base64 32"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

> ** Note**: See `GOOGLE_OAUTH_SETUP.md` for detailed OAuth setup.

### 5. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev  # http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev  # http://localhost:3000
```

---

##  Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project to Vercel
3. Set root directory: `frontend`
4. Add environment variables (see below)
5. Deploy!

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<production-secret>
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

### Backend (Render)

1. Create Web Service on Render
2. Set root directory: `backend`
3. Build command: `npm install && npx prisma generate`
4. Start command: `npm start`
5. Add environment variables
6. Deploy!

**Environment Variables:**
```
DATABASE_URL=<supabase-url>
PORT=5000
NODE_ENV=production
JWT_SECRET=<production-secret>
JWT_REFRESH_SECRET=<production-refresh-secret>
GITHUB_TOKEN=<your-token>
ALLOWED_ORIGINS=https://your-app.vercel.app
```

**Full deployment guide**: See `DEPLOYMENT_GUIDE.md`

---

##  Project Structure

```
project-hub/
 frontend/                 # Next.js Frontend
    app/                 # App Router pages
    components/          # React components
    lib/                 # Utilities & API client
    types/               # TypeScript types
    public/              # Static assets
 backend/                  # Express Backend
    src/                 # Source code
       routes/         # API routes
       controllers/    # Request handlers
       middleware/     # Auth, CORS, etc.
       services/       # Business logic
    prisma/             # Database schema & seeds
 docs/                     # Documentation PDFs
 GOOGLE_OAUTH_SETUP.md    # OAuth setup guide
 DEPLOYMENT_GUIDE.md      # Deployment checklist
 README.md                # This file
```

---

##  Git Push Commands

```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "feat: Antintern design, accessibility fixes, deployment docs"

# Push to GitHub
git push origin main
```

**See `DEPLOYMENT_GUIDE.md` for detailed push instructions and troubleshooting.**

---

##  Available Scripts

### Frontend
```bash
npm run dev          # Development server
npm run build        # Production build
npm start            # Production server
```

### Backend
```bash
npm run dev          # Development (nodemon)
npm run build        # Compile TypeScript
npm start            # Production server
npx prisma studio    # Database GUI
```

---

##  Documentation

- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Google OAuth configuration
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment checklist & troubleshooting
- **[TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)** - API and components
- **[docs/](./docs/)** - Product specifications and planning documents

---

##  Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

##  License

MIT License - see LICENSE file for details

---

##  Author

**Tejas Solanki**  
GitHub: [@Tejas3545](https://github.com/Tejas3545)

---

##  Acknowledgments

- Design inspiration: [Antintern](https://antintern.com)
- UI components: [Radix UI](https://www.radix-ui.com/)
- Icons: [Lucide React](https://lucide.dev/)
- Deployment: [Vercel](https://vercel.com) & [Render](https://render.com)

---

** Star this repo if you find it helpful!**

*Last Updated: February 10, 2026*
