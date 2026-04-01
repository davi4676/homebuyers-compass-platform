# Reminders, Push, and Experiments Setup

## Required environment variables

- `CRON_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `APP_URL` (for worker script if different from public URL)
- `RESEND_API_KEY`
- `RESEND_FROM`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (example: `mailto:support@example.com`)
- Optional: `ADMIN_EMAILS` (comma-separated allowlist for admin routes)

## Optional app-level variable

- `SESSION_SECRET` (required for auth/session features in the app, but not specific to reminder delivery)

## Quick setup

Copy template values into your local env file:

```bash
cp .env.example .env.local
```

PowerShell equivalent:

```powershell
Copy-Item .env.example .env.local
```

## Reminder orchestration

- API trigger: `POST /api/user/reminders/run`
- Auth:
  - `Authorization: Bearer <CRON_SECRET>`, or
  - Vercel cron header in production

### Local/manual run

```bash
npm run worker:reminders
```

The worker calls `${APP_URL || NEXT_PUBLIC_APP_URL}/api/user/reminders/run`.

## Vercel cron

`vercel.json` schedules reminder orchestration once daily:

- `0 14 * * *` -> `POST /api/user/reminders/run`

Adjust schedule based on your expected timezone strategy.

## Web push flow

1. User enables browser push in Inbox.
2. Client registers `public/sw.js`.
3. Client subscribes with VAPID public key.
4. Subscription is posted to `POST /api/push/subscribe`.
5. Reminder orchestrator sends push via web-push.
6. Invalid subscriptions (404/410) are automatically deactivated.

