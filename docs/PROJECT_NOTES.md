# FYP Hub: Project Notes

Everything decided and built so far, so work can continue in a new chat. Last updated 7 Nov 2026.

To continue in a new chat, say: "Read `docs/PROJECT_NOTES.md` and continue from there."

No passwords, connection strings or tokens belong in this file.

## 1. Project

- **Name:** AI Powered Final Year Project Repository and Research Intelligence System ("FYP Hub"), SZABIST Karachi
- **Team:** Syed Kazim Hussain (2312219), Muneeb Ur Rehman (2312207)
- **Supervisor:** Dr. Adeel Ansari
- **Repo:** https://github.com/Kazim777/FYP-Reports-Repo
- **Live site:** https://fyp-reports-repo.vercel.app

## 2. How we work

- **No comments in source code.**
- **Kazim commits, pushes, merges and deploys.** Claude does not, and works on a feature branch made from `main`.
- **Current focus is coding.** SRS and other documentation work is done by Kazim.
- **Do not mix the two FYP I evaluations.** Mid evaluation and final evaluation are separate.
- **Do not run `next build` or delete `.next` while a dev server is on port 3000.** Check ports 3000 and 5000 first.
- Keep code clean, scalable and easy to understand, following Next.js best practices.
- Answer short when Kazim asks for a short answer or a list.

## 3. Scope

| Stage | Includes | Status |
|---|---|---|
| FYP I mid evaluation | Requirements, design, database, auth, user profiles (SRS 4.1 to 4.4) | Coding finished and live |
| FYP I final evaluation | PDF upload and storage on Cloudflare R2, reports CRUD, search | Kazim will explain the R2 plan |
| FYP II | AI features: similarity check, partner matching and the rest | Not started |

PDF upload is **not** part of the mid evaluation, even though some of its code already exists.

## 4. Status and what is left

**Before the mid evaluation (Kazim):**
1. SRS edits, if not already done:
   - Remove LOG-4 (lockout) and LOG-7 (inactivity timeout).
   - TBD-9: sessions last 3 hours; login is rate-limited; no lockout.
   - TBD-7: emails are sent with Nodemailer through Gmail.
   - REG-5 and LOG-6: verification links last 24 hours, reset links 30 minutes, and each works once.
2. Rehearse the demo on the live site:
   - **Student:** sign up, verify the email, log in, fill the profile.
   - **Admin:** add faculty, view users, deactivate and reactivate an account.
   - **Faculty:** first login with the temporary password, set a new one, fill the profile.
3. Spam: in each demo inbox, click **Report not spam** and add the sender to contacts. Send one test email just before the demo.

**After the mid evaluation:**
- Replace Vercel Blob with Cloudflare R2. Kazim will say how. Project #13 has a local PDF that must move to storage.
- Move email to an own domain (section 9).

**Things to tidy:**
- `docs/MID_EVAL_CHECKLIST.md` is out of date and many finished items are still unticked. Use this file instead.
- The use case diagrams and ERD made earlier were expected in `docs/diagrams/`, but on 7 Nov that folder was not in the repo. Check whether they were saved elsewhere.
- `npm audit` still reports `zod` and `deepmerge-ts` in the backend. Fixing them needs breaking upgrades, so they were left alone.
- `README.md` still describes Vercel Blob. Update it when R2 replaces it.

## 5. Tech stack and structure

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind v4, lucide-react, clsx
- **Backend:** Express 5 (ESM), Prisma 6 with `@prisma/adapter-pg` and `pg`, Zod, bcryptjs, jsonwebtoken, cookie-parser, express-rate-limit, Nodemailer 10, pdf-parse
- **Database:** Neon Postgres. Local development uses the **same database as the live site**, so local saves change live data.
- **Tests:** Vitest and Supertest against the real database, using `@test.local` users that are deleted afterwards

```
frontend/src/
  app/          login, register, check-email, verify-email, forgot-password,
                reset-password, change-password, dashboard/{student,faculty,admin,account,projects}
  components/   AppShell, ui.tsx, PasswordChecklist, ResendVerificationButton, AccountStatusBadge...
  lib/          api.ts, session.ts, password.ts, pendingEmail.ts, options.ts
  middleware.ts Route protection and role redirects
backend/src/
  config/env.js, app.js, server.js
  lib/          prisma, ApiError, validation, password, mailer, emailTemplates, storage, pdf
  middleware/   auth, rateLimit, validate, errorHandler
  modules/      auth, profiles, projects, admin
```

Each backend module has `routes` → `controller` → `service`, plus `schema` for Zod rules.

**Vercel:** one project with two services (`vercel.json`). `/api/*` goes to the backend and everything else to the frontend.

## 6. What was built and why

### Login and sessions
- JWT in an httpOnly cookie, `fyp_session`, lasting **3 hours** (Kazim asked for 2 to 3). Secure in production, SameSite=Lax.
- `token_version` on the user ends all sessions on logout, password change, admin reset and deactivation. Every API request loads the user from the database.
- Next.js middleware handles redirects: guests go to `/login?next=`, each role to its own area, and accounts needing a new password to `/change-password`. It only reads the cookie for UX; the backend does the real checks.
- It sets `runtime: "nodejs"` because Vercel services do not support the Edge runtime.
- **Dropped on purpose:** the 5-failed-attempts lockout and the inactivity timeout.
- **Rate limits instead of lockout:**
  - Login: 10 per 15 min per email and network, 100 per 15 min per network
  - Register: 20 per hour per network
  - Resend and forgot password: 5 per 15 min per email and network, 30 per hour per network
  - Verify and reset token: 30 per 15 min per network
- Limits are counted in memory per running instance and are disabled in tests.

### Registration
- Required, unique Student ID: 3 to 20 letters, numbers or hyphens, stored in upper case.
- Password rule: 8+ characters with a letter and a number. Older passwords keep working until changed.
- Two-step form with avatar, skills, technologies and interests. A taken email or ID sends the user back to step 1.

### Account types
| Role | Created by | Notes |
|---|---|---|
| Student | Public sign-up | Must verify email |
| Faculty | Admin, with a temporary password | Must set a new password at first login |
| Admin | Terminal: `npm run create-admin` | Has no profile |

### Email (Nodemailer and Gmail)
- Verification uses a **link, not an OTP**. If the supervisor or SRS requires an OTP, it can be switched.
- Verification links last 24 hours and reset links 30 minutes. Each works once, and a new link cancels the old one. Only a SHA-256 hash of the token is stored, in `auth_tokens`.
- Forgot password and resend give the same answer whether or not the email exists.
- Resetting a password ends all sessions and also verifies an unverified account. Deactivated accounts cannot reset.
- Without Gmail settings, emails are printed in the backend terminal in development, and the API answers 503 in production. Tests collect emails in an in-memory `outbox`.
- Kazim confirmed real emails work on the live site, but they land in spam (section 9).

### Profiles
- **Student:** Student ID, department, bio, skills, technologies, interests, domains, "Looking for an FYP partner", "Show my email on my profile". Both toggles start off.
- **Faculty:** department, designation, research areas, at `/dashboard/faculty/profile`.
- Both use `GET/PUT /api/profiles/me`, which picks the profile by the logged-in role.
- The toggles are saved, but the **Find Partners page does not exist yet**, so nothing uses them so far.

### Admin
- Stats, user list and search, add faculty, reset password, delete user.
- View any user at `/dashboard/admin/users/:id`.
- Deactivate and reactivate, which logs the user out at once.

### Database
Current migrations:
`init`, `add_pdf_upload`, `add_user_avatar`, `add_admin_role`, `auth_sessions_and_profiles`, `remove_login_lockout`.

Main auth tables: `users` (with `status`: pending, active or deactivated), `student_profiles`, `faculty_profiles`, `auth_tokens`.

## 7. Deployment

Vercel environment variables:

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Neon pooled connection |
| `DIRECT_URL` | Neon direct connection, for migrations |
| `JWT_SECRET` | Random, 32+ characters |
| `CLIENT_URL` | `https://fyp-reports-repo.vercel.app`; email links are built from it |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob, until R2 replaces it |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Sends the emails |
| `MAIL_FROM_NAME` | Optional, defaults to `FYP Hub` |

- Local frontend: `BACKEND_URL=http://localhost:5000` in `frontend/.env.local`.
- New environment variables only apply after a **redeploy**.
- Migrations do not run during the build.
- If a migration removes columns, deploy the code first and apply the migration afterwards. The old Prisma client still selects those columns.

## 8. Problems already solved

| Problem | Cause | Fix |
|---|---|---|
| Avatars missing on the live site only | `/_next/image` returns 404 on our Vercel services setup (likely cause, not confirmed in Vercel's docs) | `images: { unoptimized: true }` in `next.config.ts` (PR #10). Live pages now load `/avatars/*.png` directly. |
| Vercel: "Edge Runtime is not supported in services" | Middleware defaulted to Edge | `runtime: "nodejs"` in the middleware config |
| `prisma migrate` fails with P1001 locally | Kazim's network has broken IPv6; Prisma's engine fails while Node `pg` works | Generate SQL with `prisma migrate diff`, apply it in a Node `pg` transaction, and insert the row into `_prisma_migrations` with a sha256 checksum |
| `prisma generate` fails with EPERM on Windows | The running backend locks the file | Stop the backend first, or use `npm install --ignore-scripts` while it runs |
| Duplicate `student_id` blocked the unique constraint | Demo account shared Kazim's real ID | Demo student now uses `DEMO-0001` |
| Stale `.next/types` errors | Layouts were deleted | Clear `.next`, only when port 3000 is free |
| Test timeout around 30 seconds | Slow first connection to Neon | Rerun; it passed |
| First page load seems stuck locally | Slow first compile in dev | Wait; nothing is wrong |

## 9. Emails going to spam

Likely reasons: a personal Gmail address with the name "FYP Hub", links on the shared `vercel.app` domain, a new sender, and short "verify" or "reset" emails that resemble phishing.

- **For the mid evaluation:** Report not spam and add to contacts, per inbox. This only helps inboxes where it is done.
- **For real users, around the FYP I final:**
  1. Buy a domain, roughly $10 a year. Check the GitHub Student Pack first.
  2. Use Resend or Brevo. Check current free limits.
  3. Add the SPF, DKIM and DMARC DNS records they give you.
  4. Send from something like `no-reply@yourdomain.com`, and ideally host the site on that domain too.

All sending goes through `backend/src/lib/mailer.js`, so the code change is small.

## 10. Other decisions

- **PDF text:** pdf-parse, not PyMuPDF.
- **Faculty accounts:** created by an admin, no self-registration.
- **Payment and premium subscription:** removed from the project and its diagrams.
- **Similarity search:** cosine similarity and pgvector were discussed for FYP II, with Hugging Face's free tier and paid alternatives considered. Nothing is built, and check the SRS for what was finally chosen.
- **Single repo** holding both frontend and backend.

## 11. Pull requests

| PR | Content |
|---|---|
| #5 | Cookie sessions |
| #6 | Middleware runs on Node.js |
| #7 | Rate limiting, lockout removed |
| #8 | Student ID and password rule |
| #9 | Profiles, email verification, forgot password, admin deactivate |
| #10 | Avatar image fix |

Other useful commands are in `README.md`. Backend tests: `cd backend && npm test` (39 tests at last run).
