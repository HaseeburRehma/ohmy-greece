/**
 * Small in-memory sliding-window rate limiter.
 *
 * Good enough for a single Node server or one serverless instance; with many
 * instances each keeps its own window, so swap in Upstash/Redis if abuse
 * ever becomes a real problem. The key map is capped so a flood of distinct
 * IPs cannot grow memory without bound.
 */
export function createRateLimiter({ limit, windowMs, maxKeys = 10_000 }: { limit: number; windowMs: number; maxKeys?: number }) {
  const hits = new Map<string, number[]>();

  return function check(key: string, now = Date.now()): { ok: boolean; retryAfter: number } {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
    }
    recent.push(now);
    hits.delete(key); // re-insert so Map order stays least-recently-used first
    hits.set(key, recent);
    while (hits.size > maxKeys) hits.delete(hits.keys().next().value as string);
    return { ok: true, retryAfter: 0 };
  };
}

/**
 * Client IP as seen by the nearest proxy (Vercel, Nginx). Uses the *rightmost*
 * X-Forwarded-For entry: that one is appended by the proxy itself, while
 * entries to its left come from the client and can be forged to dodge the
 * rate limit. Without any proxy in front, no header is trustworthy, so run
 * this behind one in production.
 */
export function clientIp(req: Request) {
  const h = req.headers;
  const forwarded = h.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean);
  return forwarded?.at(-1) || h.get("x-real-ip") || "unknown";
}
