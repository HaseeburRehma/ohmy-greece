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

## Applications: email + Google Sheet

Every application (`POST /api/bewerbung`) goes two ways at once:

1. **Email** to the team (`MAIL_TO`, default `info@tylotech.de`) plus a
   confirmation to the applicant, via Resend (`RESEND_API_KEY`) or SMTP
   (`SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`). The domain in `EMAIL_FROM` must be
   verified with the provider.
2. **Google Sheet**: one row per application in the "Bewerbungen" tab, through a
   small Apps Script (`LEADS_SHEET_URL`, `LEADS_SHEET_SECRET`). Setup steps are
   at the top of [`scripts/google-sheet-leads.gs`](scripts/google-sheet-leads.gs);
   no Google credentials live on the server.

An application counts as received if either channel works. With neither
configured, production answers `503` and the form shows its fallback with the
contact address. All variables: [.env.example](.env.example). On Vercel,
links and the logo inside emails point at the project's production domain
unless `SITE_URL` is set.

Preview both email templates at **/email-preview** while running `pnpm dev`
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
| `pnpm test` | Unit + integration tests (validation, templates, rate limiter, sheet client, API route) |
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
- The form follows the Figma "OMG Franchise Bewerbung" frames (desktop + mobile):
  five steps with their own photo each, plus the "Danke" screen. Answers on the
  choice steps auto-advance; step 1 continues on Enter or when the field is left.
  FAQ answers 2–8 are drafts to be confirmed by Oh My Greece.
- `Motion.tsx` must stay inside `page.tsx` (not the root layout) so it runs only
  after the page content has hydrated.
