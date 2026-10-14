# Mid Evaluation Checklist — Development Only (target: Weeks 6–7)

> Current focus is coding only. Theory/documentation is out of scope for now.

## 1. Setup & Database
- [x] Next.js frontend + Express backend structure
- [x] PostgreSQL connected, schema applied (`npm run db:init`)
- [ ] Code pushed to GitHub, both members committing
- [ ] Seed script: sample student/faculty users + 5–10 past FYPs

## 2. Auth & Roles
- [x] Register / login API with hashed passwords + JWT
- [x] Role-protected routes (`requireAuth`, `requireRole`)
- [x] Login / register pages, role-based dashboard redirect, logout
- [ ] Input validation & clearer error messages

## 3. Student Profile
- [x] Profile API (`GET/PUT /api/profiles/me`)
- [ ] Profile page UI: skills, interests, technologies, domains

## 4. Faculty — FYP Reports CRUD
- [x] Projects API (create / read / update / delete)
- [ ] Add / edit project form
- [ ] Manage projects list with edit & delete
- [ ] PDF upload (multer)

## 5. Student Search
- [x] Keyword search API (`GET /api/projects?q=`)
- [ ] Search page with results list and project detail view
