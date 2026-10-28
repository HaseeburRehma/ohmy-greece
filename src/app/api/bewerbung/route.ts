import { fullName, parseApplication } from "@/lib/application";
import { address, mailTransport, sendMail, teamInbox } from "@/lib/email/mailer";
import { applicantEmail, applicantText, teamEmail, teamText } from "@/lib/email/templates";
import { appendLead, sheetConfigured } from "@/lib/lead-sheet";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

/**
 * Franchise application endpoint (POST JSON from the form).
 *
 * Defences: same-origin check, JSON-only, 8 KB body cap, per-IP rate limit,
 * honeypot + minimum fill time for bots, strict server-side validation of
 * every field (options must match the form), header-safe addresses and
 * HTML-escaped emails.
 *
 * Every application goes two ways at once: a team email (src/lib/email/mailer.ts)
 * and a row in the Google Sheet (src/lib/lead-sheet.ts). It counts as received
 * if either works, so one outage never loses a lead. The applicant gets a
 * confirmation email when mail is configured.
 */

const MAX_BODY = 8 * 1024;
const MIN_FILL_MS = 3000;
const perIp = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });
// The confirmation goes to whatever address was typed in; cap it so the form
// can't be used to flood a stranger's inbox, even from rotating IPs.
const perRecipient = createRateLimiter({ limit: 2, windowMs: 24 * 60 * 60_000 });
// Backstop against distributed floods: total applications per hour.
const overall = createRateLimiter({ limit: 120, windowMs: 60 * 60_000, maxKeys: 1 });

/**
 * Other sites allowed to post the form: the Framer site on ohmygreece.de and Framer's
 * editor/preview hosts. ALLOWED_ORIGINS (comma-separated) replaces the domain list.
 */
const PARTNER_ORIGINS = (process.env.ALLOWED_ORIGINS || "https://www.ohmygreece.de,https://ohmygreece.de")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const FRAMER_ORIGIN = /^https:\/\/[a-z0-9-]+\.(framer\.app|framer\.website|framercanvas\.com)$/;

function partnerOrigin(origin: string | null) {
  return !!origin && (PARTNER_ORIGINS.includes(origin) || FRAMER_ORIGIN.test(origin));
}

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  if (!partnerOrigin(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin!,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

/** Reads the body as text but gives up past `max` bytes, even without a Content-Length (chunked uploads). */
async function readCapped(req: Request, max: number): Promise<string | null> {
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return req.headers.get("sec-fetch-site") !== "cross-site";
  try {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    return new URL(origin).host === host || partnerOrigin(origin);
  } catch {
    return false;
  }
}

/** CORS preflight for the form on the Framer site. */
export function OPTIONS(req: Request) {
  const headers = corsHeaders(req);
  return new Response(null, { status: headers["Access-Control-Allow-Origin"] ? 204 : 403, headers });
}

export async function POST(req: Request) {
  const cors = corsHeaders(req);
  const reply = (data: unknown, status = 200, headers: Record<string, string> = {}) => json(data, status, { ...cors, ...headers });
  if (!sameOrigin(req)) return reply({ error: "forbidden" }, 403);
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    return reply({ error: "unsupported_media_type" }, 415);
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY) return reply({ error: "too_large" }, 413);

  const limit = perIp(clientIp(req));
  if (!limit.ok) return reply({ error: "rate_limited" }, 429, { "Retry-After": String(limit.retryAfter) });

  const raw = await readCapped(req, MAX_BODY);
  if (raw === null) return reply({ error: "too_large" }, 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return reply({ error: "invalid_body" }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return reply({ error: "invalid_body" }, 400);
  const data = body as Record<string, unknown>;

  // Bots: filled the hidden field or "completed" five steps in under 3 s.
  // Answer like a success so they don't learn what tripped them.
  const elapsed = Number(data.elapsedMs);
  if (String(data.website ?? "").trim() || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return reply({ ok: true });

  const parsed = parseApplication(data);
  if (!parsed.ok) return reply({ error: "invalid_fields", fields: Object.keys(parsed.errors) }, 422);
  const app = parsed.data;

  if (!overall("all").ok) return reply({ error: "rate_limited" }, 429, { "Retry-After": "600" });
  const sendConfirmation = perRecipient(app.email).ok;

  const mail = mailTransport();
  if (!mail && !sheetConfigured()) {
    console.error("[bewerbung] neither mail nor sheet is configured; application from", app.city);
    return reply({ error: "not_configured" }, 503);
  }

  const receivedAt = new Date();
  const name = fullName(app);
  const [mailed, sheet] = await Promise.all([
    mail
      ? sendMail({
          to: teamInbox(),
          replyTo: address(name, app.email),
          subject: `Neue Franchise-Anfrage – ${name} (${app.city})`,
          html: teamEmail(app, { receivedAt }),
          text: teamText(app, { receivedAt }),
        }).then(
          () => true,
          (err: Error) => {
            console.error("[bewerbung] team email failed:", err.message);
            return false;
          },
        )
      : false,
    appendLead("Bewerbungen", {
      Vorname: app.firstName,
      Nachname: app.lastName,
      "E-Mail": app.email,
      "Telefon / WhatsApp": app.phone,
      "Stadt / Region": app.city,
      Eigenkapital: app.capital,
      "Gastro-Erfahrung": app.experience,
      Start: app.start,
      Einwilligung: "Ja",
    }),
  ]);

  if (!mailed && sheet !== "saved") return reply({ error: "send_failed" }, 502);

  if (mail && sendConfirmation) {
    try {
      await sendMail({
        to: address(name, app.email),
        replyTo: teamInbox(),
        subject: "Deine Oh My Greece Franchise-Anfrage ist da",
        html: applicantEmail(app),
        text: applicantText(app),
      });
    } catch (err) {
      // The team already has the lead; a bounced confirmation shouldn't fail it.
      console.error("[bewerbung] applicant confirmation failed:", (err as Error).message);
    }
  }

  return reply({ ok: true });
}
