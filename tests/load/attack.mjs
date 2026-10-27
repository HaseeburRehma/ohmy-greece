// Security probe against a running server: node tests/load/attack.mjs [baseUrl]
// Prints PASS/FAIL per check; exits 1 if anything fails.
const BASE = process.argv[2] || "http://localhost:3260";
let failed = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};
let ipN = 0;
const ip = () => `192.0.2.${(ipN++ % 250) + 1}`;
const valid = {
  city: "Köln", capital: "Unter 25.000 €", experience: "Etwas Erfahrung", start: "In den nächsten 3–6 Monaten", firstName: "Test", lastName: "Person",
  email: "attack@example.com", phone: "+49 170 0000000", consent: true, website: "", elapsedMs: 20000,
};
const api = (body, headers = {}, raw) =>
  fetch(`${BASE}/api/bewerbung`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE, "x-forwarded-for": ip(), ...headers },
    body: raw ?? JSON.stringify(body),
  });

// Headers
const home = await fetch(BASE);
const h = Object.fromEntries(home.headers);
check("home 200", home.status === 200);
check("CSP present", /default-src 'self'/.test(h["content-security-policy"] ?? ""));
check("CSP has no unsafe-eval in prod", !/unsafe-eval/.test(h["content-security-policy"] ?? ""));
check("HSTS in prod", /max-age=\d+/.test(h["strict-transport-security"] ?? ""));
check("no X-Powered-By", !h["x-powered-by"]);
check("clickjacking blocked", h["x-frame-options"] === "SAMEORIGIN");

// API abuse
check("GET on API → 405", (await fetch(`${BASE}/api/bewerbung`)).status === 405);
check("cross-origin POST → 403", (await api(valid, { origin: "https://evil.example" })).status === 403);
check("null origin POST → 403", (await api(valid, { origin: "null" })).status === 403);
check("form-encoded POST → 415", (await api(null, { "content-type": "application/x-www-form-urlencoded" }, "a=b")).status === 415);
check("text/plain CSRF-style POST → 415", (await api(null, { "content-type": "text/plain" }, JSON.stringify(valid))).status === 415);
check("1 MB body → 413", (await api(null, {}, JSON.stringify({ ...valid, x: "a".repeat(1_000_000) }))).status === 413);
check("broken JSON → 400", (await api(null, {}, "{")).status === 400);
check("deeply nested JSON → 4xx, no crash", [400, 413, 422].includes((await api(null, {}, "[".repeat(5000) + "]".repeat(5000))).status));
const xss = await api({ ...valid, firstName: "<script>alert(1)</script>", city: "javascript:alert(1)" });
check("XSS payloads rejected → 422", xss.status === 422);
const crlf = await api({ ...valid, email: "a@example.com\r\nBcc: victim@example.com" });
check("CRLF in email rejected → 422", crlf.status === 422);
check("consent:'true' string rejected → 422", (await api({ ...valid, consent: "true" })).status === 422);
check("unknown option rejected → 422", (await api({ ...valid, start: "jetzt" })).status === 422);
const bot = await api({ ...valid, website: "spam" });
check("honeypot → silent 200", bot.status === 200);

// Spoofed X-Forwarded-For can't dodge the per-IP limit
const spoof = [];
for (let i = 0; i < 7; i++) spoof.push((await api({ ...valid, email: `s${i}@example.com` }, { "x-forwarded-for": `10.9.9.${i}, 203.0.113.250` })).status);
check("forged XFF prefix still rate-limited", spoof.slice(5).every((s) => s === 429), spoof.join(","));

// Other surfaces
check("email preview hidden in prod → 404", (await fetch(`${BASE}/email-preview?t=team`)).status === 404);
check("image proxy refuses remote URLs", (await fetch(`${BASE}/_next/image?url=${encodeURIComponent("https://evil.example/x.png")}&w=640&q=75`)).status >= 400);
check("image proxy refuses path traversal", (await fetch(`${BASE}/_next/image?url=${encodeURIComponent("/../../etc/passwd")}&w=640&q=75`)).status >= 400);
check("image proxy refuses odd widths", (await fetch(`${BASE}/_next/image?url=%2Fimages%2Fhero-photo.jpg&w=13&q=75`)).status >= 400);
const nf = await fetch(`${BASE}/../../etc/passwd`);
check("path traversal → 404", nf.status === 404);
check("source maps not served", (await fetch(`${BASE}/_next/static/chunks/main.js.map`)).status === 404);

console.log(failed ? `\n${failed} check(s) FAILED` : "\nall checks passed");
process.exit(failed ? 1 : 0);
