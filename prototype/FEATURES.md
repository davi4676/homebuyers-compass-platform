# Web App Features Added

Short list of features added to make this a complete web application, with brief explanations.

---

## Error handling

| Feature | What it does |
|--------|----------------|
| **Route error boundary** (`app/error.tsx`) | Catches runtime errors in the app and shows a “Something went wrong” screen with “Try again” and “Back to home” so users can recover without a blank page. |
| **Global error boundary** (`app/global-error.tsx`) | Catches errors that break the root layout (e.g. in `layout.tsx` or `ClientLayout`). Renders a minimal standalone page with its own `<html>`/`<body>` so something always shows. |

---

## Loading & 404

| Feature | What it does |
|--------|----------------|
| **Global loading UI** (`app/loading.tsx`) | Shows a spinner and “Loading...” while route segments are loading (e.g. navigation or slow data). Improves perceived performance. |
| **Not found page** (`app/not-found.tsx`) | Custom 404 page for unknown URLs. Shows “404” and a “Back to home” link instead of the default Next.js 404. |

---

## SEO & metadata

| Feature | What it does |
|--------|----------------|
| **Enhanced metadata** (`app/layout.tsx`) | Title template, description, keywords, authors, Open Graph and Twitter card tags, and robots so search and social previews look correct. |
| **Sitemap** (`app/sitemap.ts`) | Serves `/sitemap.xml` with main routes and `lastModified` / `changeFrequency` / `priority`. Uses `NEXT_PUBLIC_APP_URL` for base URL. |
| **Robots** (`app/robots.ts`) | Serves `/robots.txt`: allows crawlers on public pages, disallows `/api/`, `/saas/`, dev/test routes, and points to the sitemap. |
| **App icon** (`app/icon.tsx`) | Generates a 32×32 favicon (home emoji on cyan) so the tab has a recognizable icon. |

---

## Security

| Feature | What it does |
|--------|----------------|
| **Security headers** (`next.config.js`) | Adds `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, and `Referrer-Policy` on all responses to reduce XSS and clickjacking risk. |
| **Middleware** (`middleware.ts`) | Runs on each request (except static assets) and sets `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy` so headers apply even when not using the config. |

---

## Accessibility

| Feature | What it does |
|--------|----------------|
| **Skip to main content** (layout + `globals.css`) | Hidden link that becomes visible on keyboard focus; jumps to `#main-content` so keyboard and screen-reader users can skip repeated nav. |
| **Main content landmark** (`ClientLayout`) | Wraps the app in a div with `id="main-content"` and `tabIndex={-1}` so the skip link has a target and focus moves to main content. |

---

## Compliance & UX

| Feature | What it does |
|--------|----------------|
| **Cookie consent banner** (`components/CookieConsent.tsx`) | Bottom banner on first visit explaining cookie use with link to privacy; “Accept” stores consent in `localStorage` and hides the banner until consent is cleared. |
| **Privacy page** (`app/privacy/page.tsx`) | Placeholder `/privacy` page for your real policy; linked from the cookie banner so the flow is complete. |
| **Offline indicator** (`components/OfflineIndicator.tsx`) | Listens to `online`/`offline` and shows a top bar when the user is offline so they know why some features may not work. |

---

## Already in the project (unchanged)

- **Client-side error boundary** (`ClientLayout` + `ErrorBoundary`) for React errors inside the app.
- **Noscript fallback** in root layout for users without JavaScript.
- **Stripe** (checkout, webhook) for payments.
- **React Hook Form + Zod** for form validation.
- **Tailwind + Framer Motion** for styling and animation.
- **ESLint** and **Next.js** tooling.

---

## Optional next steps

- Replace `app/privacy/page.tsx` with your real privacy (and cookie) policy.
- Set `NEXT_PUBLIC_APP_URL` in production to your real domain for sitemap/robots.
- Replace `app/icon.tsx` with your brand favicon (or add `app/favicon.ico`).
- Add authentication (e.g. NextAuth.js) if you need login/sessions.
- Add analytics (e.g. in layout or a provider) and mention it in the cookie/privacy text.
