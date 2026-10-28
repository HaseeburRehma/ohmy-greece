import { beforeEach, describe, expect, it, vi } from "vitest";

const sent: { to: string; subject: string; replyTo?: string; html: string }[] = [];
const rows: { sheet: string; row: Record<string, string> }[] = [];
let failTeamMail = false;
let mailOn = true;
let sheet: "saved" | "not_configured" | "failed" = "not_configured";

vi.mock("@/lib/email/mailer", async (orig) => {
  const real = await orig<typeof import("@/lib/email/mailer")>();
  return {
    ...real,
    mailTransport: () => (mailOn ? "log" : null),
    sendMail: vi.fn(async (m: (typeof sent)[number]) => {
      if (failTeamMail && m.subject.startsWith("Neue")) throw new Error("smtp down");
      sent.push(m);
    }),
  };
});

vi.mock("@/lib/lead-sheet", () => ({
  sheetConfigured: () => sheet !== "not_configured",
  appendLead: vi.fn(async (name: string, row: Record<string, string>) => {
    if (sheet === "saved") rows.push({ sheet: name, row });
    return sheet;
  }),
}));

const { POST, OPTIONS } = await import("@/app/api/bewerbung/route");

let ipCounter = 0;
const freshIp = () => `203.0.113.${++ipCounter}`;

const valid = {
  city: "Düsseldorf",
  capital: "25.000 – 50.000 €",
  experience: "Etwas Erfahrung",
  start: "In den nächsten 3–6 Monaten",
  firstName: "Nikos",
  lastName: "Papadopoulos",
  email: "nikos@example.com",
  phone: "+49 170 1234567",
  consent: true,
  website: "",
  elapsedMs: 25_000,
};

function post(body: unknown, { headers = {}, ip = freshIp(), raw }: { headers?: Record<string, string>; ip?: string; raw?: string } = {}) {
  return POST(
    new Request("http://localhost:3250/api/bewerbung", {
      method: "POST",
      headers: {
        host: "localhost:3250",
        origin: "http://localhost:3250",
        "content-type": "application/json",
        "x-forwarded-for": ip,
        ...headers,
      },
      body: raw ?? JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  sent.length = 0;
  rows.length = 0;
  failTeamMail = false;
  mailOn = true;
  sheet = "not_configured";
});

describe("POST /api/bewerbung", () => {
  it("accepts a valid application and sends team + applicant emails", async () => {
    const res = await post({ ...valid, email: "ok1@example.com" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(sent.map((m) => m.subject)).toEqual([
      "Neue Franchise-Anfrage – Nikos Papadopoulos (Düsseldorf)",
      "Deine Oh My Greece Franchise-Anfrage ist da",
    ]);
    expect(sent[0].replyTo).toBe('"Nikos Papadopoulos" <ok1@example.com>');
  });

  it("rejects cross-origin posts (CSRF)", async () => {
    const res = await post(valid, { headers: { origin: "https://evil.example" } });
    expect(res.status).toBe(403);
    expect(sent).toHaveLength(0);
  });

  it("rejects non-JSON content types", async () => {
    const res = await post(valid, { headers: { "content-type": "application/x-www-form-urlencoded" } });
    expect(res.status).toBe(415);
  });

  it("rejects oversized bodies", async () => {
    const res = await post({ ...valid, padding: "x".repeat(20_000) });
    expect(res.status).toBe(413);
  });

  it("stops reading a chunked body without Content-Length past 8 KB", async () => {
    let pulled = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(c) {
        pulled++;
        c.enqueue(new TextEncoder().encode("x".repeat(4096)));
        if (pulled > 10_000) c.close();
      },
    });
    const res = await POST(
      new Request("http://localhost:3250/api/bewerbung", {
        method: "POST",
        headers: { host: "localhost:3250", origin: "http://localhost:3250", "content-type": "application/json", "x-forwarded-for": freshIp() },
        body: stream,
        // @ts-expect-error -- required by undici for streaming request bodies
        duplex: "half",
      }),
    );
    expect(res.status).toBe(413);
    expect(pulled).toBeLessThan(10);
  });

  it("rejects malformed JSON, arrays and primitives", async () => {
    expect((await post(null, { raw: "{not json" })).status).toBe(400);
    expect((await post([valid])).status).toBe(400);
    expect((await post("hello")).status).toBe(400);
  });

  it("silently drops honeypot and too-fast submissions without sending", async () => {
    expect((await post({ ...valid, website: "http://spam.example" })).status).toBe(200);
    expect((await post({ ...valid, elapsedMs: 500 })).status).toBe(200);
    expect((await post({ ...valid, elapsedMs: "NaN" })).status).toBe(200);
    expect(sent).toHaveLength(0);
  });

  it("returns 422 with the failing fields for invalid data", async () => {
    const res = await post({ ...valid, email: "bad", capital: "alles", city: "<script>" });
    expect(res.status).toBe(422);
    expect((await res.json()).fields.sort()).toEqual(["capital", "city", "email"]);
    expect(sent).toHaveLength(0);
  });

  it("neutralises CRLF header-injection attempts", async () => {
    const res = await post({ ...valid, lastName: "Eve\r\nBcc: victim@example.com", email: "eve2@example.com" });
    // the name contains a ':' after cleaning, which the name rule rejects
    expect(res.status).toBe(422);
    expect(sent).toHaveLength(0);
  });

  it("rate-limits one IP to 5 requests per 10 minutes", async () => {
    const ip = freshIp();
    const codes = [];
    for (let i = 0; i < 7; i++) codes.push((await post({ ...valid, email: `rl${i}@example.com` }, { ip })).status);
    expect(codes).toEqual([200, 200, 200, 200, 200, 429, 429]);
  });

  it("can't be dodged by forging extra X-Forwarded-For entries", async () => {
    const codes = [];
    for (let i = 0; i < 6; i++)
      codes.push((await post({ ...valid, email: `xff${i}@example.com` }, { ip: `10.0.0.${i}, 198.51.100.77` })).status);
    expect(codes.at(-1)).toBe(429);
  });

  it("sends at most 2 confirmations per recipient per day (anti email-bombing)", async () => {
    for (let i = 0; i < 4; i++) await post({ ...valid, email: "victim@example.com" });
    const confirmations = sent.filter((m) => m.to.includes("victim@example.com"));
    expect(confirmations).toHaveLength(2);
    // the team still gets every lead
    expect(sent.filter((m) => m.subject.startsWith("Neue"))).toHaveLength(4);
  });

  it("returns 502 when the team email fails, so the form can show its fallback", async () => {
    failTeamMail = true;
    const res = await post({ ...valid, email: "fail@example.com" });
    expect(res.status).toBe(502);
  });

  it("writes every answer to the Google Sheet as well", async () => {
    sheet = "saved";
    const res = await post({ ...valid, email: "sheet1@example.com" });
    expect(res.status).toBe(200);
    expect(rows).toEqual([
      {
        sheet: "Bewerbungen",
        row: {
          Vorname: "Nikos",
          Nachname: "Papadopoulos",
          "E-Mail": "sheet1@example.com",
          "Telefon / WhatsApp": "+49 170 1234567",
          "Stadt / Region": "Düsseldorf",
          Eigenkapital: "25.000 – 50.000 €",
          "Gastro-Erfahrung": "Etwas Erfahrung",
          Start: "In den nächsten 3–6 Monaten",
          Einwilligung: "Ja",
        },
      },
    ]);
    expect(sent).toHaveLength(2);
  });

  it("still accepts the lead when the email fails but the sheet saved it", async () => {
    sheet = "saved";
    failTeamMail = true;
    const res = await post({ ...valid, email: "sheet2@example.com" });
    expect(res.status).toBe(200);
    expect(rows).toHaveLength(1);
  });

  it("accepts the lead with only the sheet configured (no confirmation email)", async () => {
    sheet = "saved";
    mailOn = false;
    const res = await post({ ...valid, email: "sheet3@example.com" });
    expect(res.status).toBe(200);
    expect(sent).toHaveLength(0);
    expect(rows).toHaveLength(1);
  });

  it("returns 502 when both the email and the sheet fail", async () => {
    sheet = "failed";
    failTeamMail = true;
    expect((await post({ ...valid, email: "both@example.com" })).status).toBe(502);
  });

  it("returns 503 when neither mail nor sheet is configured", async () => {
    mailOn = false;
    expect((await post({ ...valid, email: "none@example.com" })).status).toBe(503);
  });
});

describe("cross-origin posts from the Framer site", () => {
  const preflight = (origin: string) =>
    OPTIONS(new Request("http://localhost:3250/api/bewerbung", { method: "OPTIONS", headers: { origin, host: "localhost:3250" } }));

  it("answers the preflight for ohmygreece.de and Framer previews only", async () => {
    for (const origin of ["https://www.ohmygreece.de", "https://ohmygreece.de", "https://omg-preview.framer.app"]) {
      const res = await preflight(origin);
      expect(res.status, origin).toBe(204);
      expect(res.headers.get("access-control-allow-origin")).toBe(origin);
      expect(res.headers.get("access-control-allow-headers")).toBe("Content-Type");
    }
    for (const origin of ["https://evil.example", "https://www.ohmygreece.de.evil.example", "http://www.ohmygreece.de", "https://framer.app.evil.example"]) {
      const res = await preflight(origin);
      expect(res.status, origin).toBe(403);
      expect(res.headers.get("access-control-allow-origin")).toBeNull();
    }
  });

  it("accepts an application from www.ohmygreece.de and returns CORS headers", async () => {
    const res = await post({ ...valid, email: "framer@example.com" }, { headers: { origin: "https://www.ohmygreece.de" } });
    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe("https://www.ohmygreece.de");
    expect(res.headers.get("vary")).toBe("Origin");
  });

  it("still rejects other sites, without CORS headers", async () => {
    const res = await post(valid, { headers: { origin: "https://evil.example" } });
    expect(res.status).toBe(403);
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("keeps CORS headers on error answers so the form can show them", async () => {
    const res = await post({ ...valid, email: "nope" }, { headers: { origin: "https://www.ohmygreece.de" } });
    expect(res.status).toBe(422);
    expect(res.headers.get("access-control-allow-origin")).toBe("https://www.ohmygreece.de");
  });
});
