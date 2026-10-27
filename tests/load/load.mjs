// Many-users simulation: node tests/load/load.mjs [baseUrl] [concurrency] [requests]
// 1) page traffic, 2) a distributed flood of applications from many IPs.
const BASE = process.argv[2] || "http://localhost:3260";
const CONC = Number(process.argv[3] || 200);
const TOTAL = Number(process.argv[4] || 3000);

async function run(label, total, conc, fn) {
  const times = [];
  const codes = {};
  let next = 0;
  const t0 = performance.now();
  await Promise.all(
    Array.from({ length: conc }, async () => {
      while (next < total) {
        const i = next++;
        const s = performance.now();
        let code = "ERR";
        try {
          code = (await fn(i)).status;
        } catch (e) {
          code = `ERR:${e.cause?.code ?? e.name}`;
        }
        times.push(performance.now() - s);
        codes[code] = (codes[code] ?? 0) + 1;
      }
    }),
  );
  const secs = (performance.now() - t0) / 1000;
  times.sort((a, b) => a - b);
  const p = (q) => Math.round(times[Math.min(times.length - 1, Math.floor(times.length * q))]);
  console.log(
    `${label}: ${total} req, ${conc} concurrent, ${Math.round(total / secs)} req/s | p50 ${p(0.5)}ms p95 ${p(0.95)}ms p99 ${p(0.99)}ms | ${JSON.stringify(codes)}`,
  );
  return codes;
}

const pages = await run("GET /", TOTAL, CONC, () => fetch(BASE).then(async (r) => (await r.arrayBuffer(), r)));
const imgs = await run("GET /_next/image hero", 600, 60, () =>
  fetch(`${BASE}/_next/image?url=%2Fimages%2Fhero-photo.jpg&w=750&q=75`, { headers: { accept: "image/avif,image/webp" } }).then(async (r) => (await r.arrayBuffer(), r)),
);

const valid = {
  city: "Köln", capital: "Unter 25.000 €", experience: "Etwas Erfahrung", start: "In den nächsten 3–6 Monaten", firstName: "Load", lastName: "Test",
  phone: "+49 170 0000000", consent: true, website: "", elapsedMs: 20000,
};
const flood = await run("POST /api/bewerbung (1000 IPs)", 1000, 100, (i) =>
  fetch(`${BASE}/api/bewerbung`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE, "x-forwarded-for": `100.64.${i >> 8}.${i & 255}` },
    body: JSON.stringify({ ...valid, email: `load${i}@example.com` }),
  }),
);

const fiveXX = (c) => Object.entries(c).filter(([k]) => k.startsWith("5") && k !== "503" || k.startsWith("ERR")).reduce((n, [, v]) => n + v, 0);
const accepted = (flood["200"] ?? 0) + (flood["503"] ?? 0); // 503 = passed every check but no mail provider configured yet
console.log(`\napplications let through by the global cap: ${accepted} (cap 120/h; the dev run earlier may have used some)`);
const bad = fiveXX(pages) + fiveXX(imgs) + fiveXX(flood);
console.log(bad ? `${bad} server errors/timeouts` : "no server errors or dropped connections");
process.exit(bad || accepted > 120 ? 1 : 0);
