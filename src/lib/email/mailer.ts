/**
 * Outgoing mail. The provider is not decided yet, so this supports both
 * common options and picks whichever is configured:
 *
 *   RESEND_API_KEY   Resend (domain in EMAIL_FROM must be verified there)
 *   SMTP_HOST, SMTP_PORT (587 default, or 465), SMTP_USER, SMTP_PASS
 *   EMAIL_FROM       sender, e.g. "Oh My Greece <franchise@ohmygreece.de>"
 *   MAIL_TO          team inbox for new applications
 *
 * With nothing configured, development logs the email instead of sending;
 * production reports "not configured" so the form can show its fallback.
 */

export type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

/** Strips quotes people paste around env values in hosting dashboards. */
const env = (k: string) => process.env[k]?.trim().replace(/^["']|["']$/g, "") || undefined;

export function mailTransport(): "resend" | "smtp" | "log" | null {
  if (env("RESEND_API_KEY")) return "resend";
  if (env("SMTP_HOST") && env("SMTP_USER") && env("SMTP_PASS")) return "smtp";
  return process.env.NODE_ENV === "production" ? null : "log";
}

export const teamInbox = () => env("MAIL_TO") || "info@tylotech.de";

const sender = () => env("EMAIL_FROM") || "Oh My Greece <onboarding@resend.dev>";

/** Address header with a display name; quotes and strips anything that could break the header. */
export const address = (name: string, email: string) =>
  `"${name.replace(/["\\\r\n<>]/g, "").slice(0, 100)}" <${email.replace(/[\r\n<>"]/g, "")}>`;

/** Sends one email; throws with a short, non-secret reason on failure. */
export async function sendMail(mail: Mail): Promise<void> {
  const via = mailTransport();
  if (via === "resend") return sendWithResend(mail);
  if (via === "smtp") return sendWithSmtp(mail);
  if (via === "log") {
    console.info(`[mail:dev] would send "${mail.subject}" to ${mail.to}\n${mail.text}\n`);
    return;
  }
  throw new Error("mail not configured");
}

async function sendWithResend(mail: Mail) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: sender(),
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { name?: string } | null;
    throw new Error(`resend ${res.status} ${body?.name ?? ""}`);
  }
}

async function sendWithSmtp(mail: Mail) {
  // Loaded lazily so the dependency is only needed once SMTP is chosen.
  const nodemailer = await import("nodemailer").catch(() => {
    throw new Error("smtp selected but nodemailer is not installed (pnpm add nodemailer)");
  });
  const port = Number(env("SMTP_PORT")) || 587;
  const transport = nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: { user: env("SMTP_USER"), pass: env("SMTP_PASS") },
    connectionTimeout: 15_000,
  });
  await transport.sendMail({ from: sender(), ...mail });
}
