import { applicantEmail, applicantText, SAMPLE_APPLICATION, teamEmail, teamText } from "@/lib/email/templates";

/**
 * Development-only email gallery: /email-preview shows both templates side by
 * side at desktop and phone width; ?t=team|applicant renders one email and
 * &format=text its plain-text part. Returns 404 in production unless
 * EMAIL_PREVIEW=1 is set.
 */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production" && process.env.EMAIL_PREVIEW !== "1")
    return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  const site = url.origin;
  const t = url.searchParams.get("t");
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

  if (t === "team" || t === "applicant") {
    const asText = url.searchParams.get("format") === "text";
    const receivedAt = new Date();
    const out = asText
      ? t === "team"
        ? teamText(SAMPLE_APPLICATION, { receivedAt })
        : applicantText(SAMPLE_APPLICATION, { site })
      : t === "team"
        ? teamEmail(SAMPLE_APPLICATION, { site, receivedAt })
        : applicantEmail(SAMPLE_APPLICATION, { site });
    return new Response(out, {
      headers: { ...headers, "Content-Type": `${asText ? "text/plain" : "text/html"}; charset=utf-8` },
    });
  }

  const frame = (src: string, w: number) =>
    `<iframe src="${src}" title="${src}" style="width:${w}px;height:1150px;border:1px solid #e8e3db;border-radius:16px;background:#fff"></iframe>`;
  const row = (label: string, key: string) => `
    <section>
      <h2>${label} <a href="?t=${key}" target="_blank">HTML öffnen</a> · <a href="?t=${key}&format=text" target="_blank">Text-Version</a></h2>
      <div class="row">${frame(`?t=${key}`, 680)}${frame(`?t=${key}`, 380)}</div>
    </section>`;

  return new Response(
    `<!doctype html><html lang="de"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>E-Mail-Vorschau – Oh My Greece</title>
<style>
  body{margin:0;padding:32px;background:#fefae7;font:15px/1.5 system-ui,sans-serif;color:#3b001b}
  h1{font-size:26px;margin:0 0 4px} p{margin:0 0 28px;color:#6b5c63}
  h2{font-size:17px;margin:32px 0 12px} h2 a{font-size:13px;font-weight:500;color:#1565c0}
  .row{display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start}
</style></head><body>
<h1>E-Mail-Vorschau</h1>
<p>Beispieldaten · Desktop (680 px) und Handy (380 px). Nur in der Entwicklung sichtbar.</p>
${row("1 · Benachrichtigung an das Team", "team")}
${row("2 · Bestätigung an die Bewerber:in", "applicant")}
</body></html>`,
    { headers: { ...headers, "Content-Type": "text/html; charset=utf-8" } },
  );
}
