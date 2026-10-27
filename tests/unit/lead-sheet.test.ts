import { afterEach, describe, expect, it, vi } from "vitest";
import { appendLead, sheetConfigured } from "@/lib/lead-sheet";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const configure = () => {
  vi.stubEnv("LEADS_SHEET_URL", "https://script.google.com/macros/s/test/exec");
  vi.stubEnv("LEADS_SHEET_SECRET", "s3cret");
};

describe("appendLead", () => {
  it("does nothing without URL and secret", async () => {
    vi.stubEnv("LEADS_SHEET_URL", "");
    vi.stubEnv("LEADS_SHEET_SECRET", "");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(sheetConfigured()).toBe(false);
    expect(await appendLead("Bewerbungen", { Vorname: "A" })).toBe("not_configured");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("posts the tab, row and secret to the Apps Script", async () => {
    configure();
    const fetch = vi.fn(async () => new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    expect(await appendLead("Bewerbungen", { Vorname: "Nikos" })).toBe("saved");
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://script.google.com/macros/s/test/exec");
    expect(JSON.parse(init.body as string)).toEqual({ secret: "s3cret", sheet: "Bewerbungen", row: { Vorname: "Nikos" } });
  });

  it("reports a rejected secret or a network error as failed instead of throwing", async () => {
    configure();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(async () => new Response('{"ok":false,"error":"unauthorized"}', { status: 200 })));
    expect(await appendLead("Bewerbungen", {})).toBe("failed");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>login</html>", { status: 200 })));
    expect(await appendLead("Bewerbungen", {})).toBe("failed");
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("ECONNRESET"))));
    expect(await appendLead("Bewerbungen", {})).toBe("failed");
  });
});
