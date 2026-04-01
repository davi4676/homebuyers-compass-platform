# Backend: APIs, Database & Authentication

This doc describes the backend tools, APIs, and data layer for the prototype.

---

## Authentication

- **Session:** HTTP-only cookie `session` (signed token, 7-day expiry). Set `SESSION_SECRET` or `AUTH_SECRET` in `.env.local` for production.
- **Password storage:** Scrypt-hashed in user store (no plaintext).
- **Endpoints:**
  - `POST /api/auth/signup` — Create account (username, email, password, firstName, lastName, phone). Returns user + sets cookie.
  - `POST /api/auth/login` — Log in (email, password). Returns user + sets cookie.
  - `POST /api/auth/logout` — Clear session cookie.
  - `GET /api/auth/session` — Return current user from cookie (or `{ user: null }`).

All `/api/user/*` routes require a valid session (401 if missing).

---

## Database (file-based)

Data lives under `.data/` (gitignored). Files:

| File | Purpose |
|------|--------|
| `users.json` | User accounts (id, username, email, passwordHash, profile, quizState). |
| `progress.json` | Gamification progress per user (level, XP, streak, badges, stats). |
| `activity.json` | Activity events per user for productivity tracker. |

- **Read/write:** Via `lib/db/store.ts`, `lib/db/progress.ts`, `lib/db/activity.ts`, and `lib/user-store.ts`.
- **Production:** Replace with PostgreSQL/MongoDB etc. by swapping these modules.

---

## User APIs (require auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/quiz-state` | Get saved transaction type + quiz answers. |
| POST | `/api/user/quiz-state` | Save transaction type + quiz answers (body: `transactionType`, `quizAnswers`). |
| GET | `/api/user/progress` | Get gamification progress (level, XP, streak, badges). Creates default if none. |
| POST | `/api/user/progress` | Update progress (body: full `UserProgress`). |
| GET | `/api/user/activity?summary=true` | Get activity summary (counts, last active). |
| GET | `/api/user/activity?limit=50` | Get recent activity events. |
| POST | `/api/user/activity` | Track event (body: `actionId`, optional `metadata`). |
| GET | `/api/user/productivity` | Dashboard: progress + activity summary in one response. |

**Activity actionIds:** `quiz_completed`, `results_viewed`, `journey_step_completed`, `tool_used`, `down_payment_calculator`, `refinance_calculator`, `affordability_viewed`, `profile_updated`, `first_login`.

---

## Other APIs

- **Stripe:** `POST /api/stripe/checkout`, `POST /api/stripe/webhook`
- **External/data:** `lib/api/*` or route handlers under `app/api/zillow/*`, `app/api/hmda/*`, `app/api/pmms/*`, `app/api/chatbots/*`, `app/api/knowledge/*`

---

## Productivity tracker (buildout)

- **Storage:** Activity events in `lib/db/activity.ts`; progress in `lib/db/progress.ts`.
- **Client:** `useProgress()` in `lib/hooks/useProgress.ts` — when authenticated, fetches progress and activity from the APIs above; when not, uses localStorage.
- **Tracking:** Call `trackActivity('quiz_completed')` (or other actionIds) from `lib/track-activity.ts` when the user does key actions (quiz complete, results view, etc.).
- **UI:** `ProductivityTracker` on `/profile` shows level, XP, streak, activity summary, badges.

Progress (XP, level, badges) is synced to the API when the user is authenticated: after `awardXpForAction`, call `syncProgressToApi(newProgress)` (see `lib/sync-progress.ts`).
