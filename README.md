# AI Powered FYP Repository & Research Intelligence System

SZABIST Karachi — Final Year Project
Team: Syed Kazim Hussain (2312219), Muneeb Ur Rehman (2312207) · Supervisor: Dr. Adeel Ansari

## Tech stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** Node.js, Express 5, Prisma ORM, Zod validation, JWT auth
- **Database:** PostgreSQL

## Structure

```
FYP-Reports-Repo/
├── frontend/
│   └── src/
│       ├── app/                      Pages (App Router)
│       │   ├── login/ · register/
│       │   └── dashboard/
│       │       ├── student/          Overview, search, profile
│       │       ├── faculty/          Overview, manage / add / edit projects
│       │       └── projects/[id]/    Project details (both roles)
│       ├── components/               AppShell (sidebar + role guard), ui.tsx (buttons, inputs, cards…)
│       └── lib/api.ts                API client, types, session helpers
│
└── backend/
    ├── prisma/
    │   ├── schema.prisma             Database models
    │   ├── migrations/               Generated SQL migrations (commit these)
    │   └── seed.js                   Demo data
    └── src/
        ├── server.js                 Starts the HTTP server
        ├── app.js                    Express setup and route mounting
        ├── config/env.js             Environment variables
        ├── lib/                      prisma client, ApiError, validation helpers
        ├── middleware/               requireAuth / requireRole, validate, errorHandler
        └── modules/                  One folder per feature
            ├── auth/                 *.routes → *.controller → *.service (+ *.schema for validation)
            ├── projects/
            └── profiles/
```

Each backend module follows the same flow:

- **routes** — URL, auth and validation middleware
- **controller** — reads the request, sends the response
- **service** — business logic and Prisma queries
- **schema** — Zod rules for the request body

## Setup

### Backend
```bash
cd backend
npm install
# set DATABASE_URL and JWT_SECRET in .env (see .env.example)
npm run db:deploy     # create the tables
npm run db:seed       # optional: demo data
npm run dev           # http://localhost:5000/api/health
```

Demo logins after seeding (password `demo1234`): `faculty@demo.com`, `student@demo.com`

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev           # http://localhost:3000
```

## Database workflow

| Task | Command (in `backend/`) |
|---|---|
| Change the schema | Edit `prisma/schema.prisma`, then `npm run db:migrate -- --name what_changed` |
| Apply migrations (teammate / fresh DB) | `npm run db:deploy` |
| Browse data in the browser | `npm run db:studio` |
| Reset demo data | `npm run db:seed` |

## API

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Logged in |
| GET | `/api/projects?q=keyword` | Logged in |
| GET | `/api/projects/:id` | Logged in |
| POST | `/api/projects` | Faculty |
| PUT / DELETE | `/api/projects/:id` | Faculty |
| GET / PUT | `/api/profiles/me` | Student |

Errors always come back as `{ "message": "..." }` with a matching HTTP status.
