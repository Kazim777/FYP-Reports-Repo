# AI Powered FYP Repository & Research Intelligence System

SZABIST Karachi — Final Year Project
Team: Syed Kazim Hussain (2312219), Muneeb Ur Rehman (2312207) · Supervisor: Dr. Adeel Ansari

## Tech stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** Node.js, Express 5, Prisma ORM, Zod validation, JWT auth, Multer + pdf-parse for PDF reports
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

Demo logins after seeding (password `demo1234`): `admin@demo.com`, `faculty@demo.com`, `student@demo.com`

### Accounts and roles

| Role | How the account is created | Lands on |
|---|---|---|
| Student | Public sign-up at `/register` (picks skills during sign-up) | `/dashboard/student` |
| Faculty | Created by an admin from **Add Faculty** (temporary password) | `/dashboard/faculty` |
| Admin | Terminal only: `npm run create-admin -- --name "Full Name" --email admin@example.com` | `/dashboard/admin` |

Everyone uses the same `/login` page. Accounts created with a temporary password must choose a new one at `/change-password` before they can use the app.

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

## Deployment (Vercel)

The repo deploys as **one Vercel project with two services** (see `vercel.json`):

| Service | Folder | Public path |
|---|---|---|
| `frontend` | `frontend/` (Next.js) | `/` |
| `backend` | `backend/` (Express, entry `src/app.js`) | `/api/*` |

PDF reports are stored in a **private Vercel Blob store**. The browser uploads directly to Blob with a short-lived signed URL, and reports are opened with a 10-minute signed link, so files never pass through the 4.5 MB function limit and are never public.

Environment variables (Project → Settings → Environment Variables):

| Name | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string (host contains `-pooler`) |
| `DIRECT_URL` | Neon **direct** connection string (used for migrations) |
| `JWT_SECRET` | Random string, 32+ characters |
| `CLIENT_URL` | The deployed URL, e.g. `https://fyp-hub.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | Added automatically when a Blob store is connected to the project |

Database migrations are not run during the build. After changing the schema, run `npm run db:deploy` in `backend/` against the production database.

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
| GET | `/api/projects/:id/pdf` (returns a 10-minute signed link) | Logged in |
| POST | `/api/projects/:id/pdf/upload-url` (signed upload URL, max 15 MB) | Faculty, Admin |
| POST | `/api/projects/:id/pdf` (`{ pathname, fileName }` after uploading) | Faculty, Admin |
| DELETE | `/api/projects/:id/pdf` | Faculty, Admin |
| GET / PUT | `/api/profiles/me` | Student |
| PATCH | `/api/auth/me` (name, avatar) | Logged in |
| POST | `/api/auth/change-password` | Logged in |
| GET | `/api/admin/stats` | Admin |
| GET | `/api/admin/users?q=&role=` | Admin |
| POST | `/api/admin/users/faculty` | Admin |
| POST | `/api/admin/users/:id/reset-password` | Admin |
| DELETE | `/api/admin/users/:id` | Admin |

Project create / edit / delete and PDF upload are allowed for both Faculty and Admin.

Errors always come back as `{ "message": "..." }` with a matching HTTP status.
