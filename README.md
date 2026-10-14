# AI Powered FYP Repository & Research Intelligence System

SZABIST Karachi — Final Year Project
Team: Syed Kazim Hussain (2312219), Muneeb Ur Rehman (2312207) · Supervisor: Dr. Adeel Ansari

## Structure

```
FYP-Reports-Repo/
├── frontend/                 Next.js (App Router, TypeScript, Tailwind)
│   └── src/
│       ├── app/
│       │   ├── page.tsx              Landing page
│       │   ├── login/                Login
│       │   ├── register/             Register (student / faculty)
│       │   └── dashboard/
│       │       ├── student/          Student dashboard
│       │       └── faculty/          Faculty dashboard
│       ├── components/               Shared UI (DashboardShell = role guard + header)
│       └── lib/api.ts                Fetch helper + session (JWT in localStorage)
│
├── backend/                  Node.js + Express REST API
│   ├── db/schema.sql                 PostgreSQL schema
│   ├── uploads/                      Uploaded FYP PDFs (git-ignored)
│   └── src/
│       ├── server.js / app.js        Entry point, middleware, route mounting
│       ├── config/                   env + PostgreSQL pool
│       ├── middleware/               requireAuth, requireRole, errorHandler
│       ├── routes/                   auth, projects, profiles
│       ├── controllers/              Request handlers
│       ├── services/                 PDF extraction, embeddings, LLM (later)
│       └── utils/initDb.js           Applies schema.sql
│
└── docs/                     Development checklist
```

## Setup

### 1. Database
```bash
psql -U postgres -c "CREATE DATABASE fyp_repository;"
```

### 2. Backend
```bash
cd backend
npm install
# edit .env -> set your postgres password in DATABASE_URL and a JWT_SECRET
npm run db:init
npm run dev          # http://localhost:5000/api/health
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

## API (FYP I)

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Logged in |
| GET | `/api/projects?q=keyword` | Logged in |
| GET | `/api/projects/:id` | Logged in |
| POST / PUT / DELETE | `/api/projects/:id` | Faculty |
| GET / PUT | `/api/profiles/me` | Student |
