# Oh My Greece – Franchise

Franchise landing page for Oh My Greece, built from the Figma design
(TyloTech Design File, frame "Franchise Page — Oh My Greece"). Responsive from
320 px to 1440 px+, with scroll animations and a 5-step application form that
sends a team notification and an applicant confirmation email.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · Tailwind CSS 4 ·
Lenis smooth scrolling · Vitest · Playwright

## Getting started

```bash
pnpm install
cp .env.example .env.local   # optional in development
pnpm dev
```

Open http://localhost:3000. In development, application emails are printed to
the server log instead of being sent.

## Email

The form posts to `POST /api/bewerbung`, which emails the team (`MAIL_TO`) and
sends the applicant a confirmation. Choose a provider by setting **either**
`RESEND_API_KEY` **or** `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` (see
[.env.example](.env.example)). Without one, production answers `503` and the form
shows a fallback with the contact address.

Preview both templates at **/email-preview** while running `pnpm dev`
(desktop and phone width side by side). The route is a 404 in production.

Templates: `src/lib/email/` · Validation shared by form and API: `src/lib/application.ts`

## Security

- Security headers incl. CSP, frame/clickjacking protection, HSTS (`next.config.ts`)
- API: same-origin check, JSON only, 8 KB body cap (also for chunked uploads),
  strict validation, honeypot + minimum fill time, CRLF-safe mail headers,
  HTML-escaped templates
- Rate limits: 5 / IP / 10 min, 2 confirmations / recipient / day
  (anti email-bombing), 120 applications / hour overall

Limits are kept in memory per server instance and the client IP comes from the
proxy's `X-Forwarded-For` entry, so deploy behind a proxy/CDN (e.g. Vercel). For
multiple instances, move the limiter to Redis/Upstash.

## Tests

| Command | What it runs |
| --- | --- |
| `pnpm test` | Unit + integration tests (validation, templates, rate limiter, API route) |
| `pnpm test:e2e` | Playwright on desktop + mobile against `pnpm dev --port 3250` (uses the installed Chrome) |
| `pnpm test:security [url]` | Attack probe against a running `next start` (default `http://localhost:3260`) |
| `pnpm test:load [url] [concurrency] [requests]` | Many-users load test against a running server |

## Design notes

- The design's display font **Fineday Style Two** is a commercial font and isn't
  bundled; **Kaushan Script** is used as the fallback. Add the licensed font
  files with an `@font-face` for `"Fineday"` and it takes over automatically
  (`--font-script` in `src/app/globals.css`).
- Header and footer in the Figma file are screenshots of the live site; the logo
  and footer wordmark were extracted from them. Replace with the original vector
  files when available.
- Figma shows step 1 of the form and the first FAQ answer only; the other form
  steps and FAQ answers are drafts to be confirmed by Oh My Greece.
- `Motion.tsx` must stay inside `page.tsx` (not the root layout) so it runs only
  after the page content has hydrated.
