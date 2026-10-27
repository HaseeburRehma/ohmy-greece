/**
 * Appends a lead as a row to a Google Sheet through a Google Apps Script web
 * app (scripts/google-sheet-leads.gs — setup steps are at the top of that file).
 *
 *   LEADS_SHEET_URL     the web app's /exec URL
 *   LEADS_SHEET_SECRET  shared secret, must match SECRET in the script
 *
 * No Google credentials live on the server: the script runs as the sheet's
 * owner and only accepts requests that carry the secret.
 */

export type SheetResult = "saved" | "not_configured" | "failed";

export function sheetConfigured() {
  return !!(process.env.LEADS_SHEET_URL && process.env.LEADS_SHEET_SECRET);
}

export async function appendLead(
  sheet: string,
  row: Record<string, string>,
): Promise<SheetResult> {
  const url = process.env.LEADS_SHEET_URL;
  const secret = process.env.LEADS_SHEET_SECRET;
  if (!url || !secret) return "not_configured";

  try {
    // Apps Script answers a POST with a 302 to the result; fetch follows it.
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret, sheet, row }),
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (res.ok && data?.ok) return "saved";
    console.error("[lead-sheet] rejected:", res.status, data?.error ?? "no json body");
    return "failed";
  } catch (err) {
    console.error("[lead-sheet] request failed:", err);
    return "failed";
  }
}
