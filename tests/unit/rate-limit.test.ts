import { describe, expect, it } from "vitest";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  it("allows `limit` hits per window, then blocks with a retry hint", () => {
    const check = createRateLimiter({ limit: 3, windowMs: 1000 });
    expect([check("a", 0), check("a", 1), check("a", 2)].every((r) => r.ok)).toBe(true);
    const blocked = check("a", 3);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBe(1);
    expect(check("b", 3).ok).toBe(true); // other keys unaffected
  });

  it("frees capacity as the window slides", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(check("a", 0).ok).toBe(true);
    expect(check("a", 999).ok).toBe(false);
    expect(check("a", 1000).ok).toBe(true);
  });

  it("caps memory under a flood of distinct keys", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 100 });
    for (let i = 0; i < 10_000; i++) check(`ip-${i}`, i);
    // the oldest keys were evicted, so the very first IP is allowed again
    expect(check("ip-0", 10_001).ok).toBe(true);
    expect(check("ip-9999", 10_001).ok).toBe(false);
  });
});

describe("clientIp", () => {
  const req = (h: Record<string, string>) => new Request("http://x", { headers: h });

  it("uses the proxy-appended (rightmost) X-Forwarded-For entry", () => {
    expect(clientIp(req({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" }))).toBe("203.0.113.9");
  });
  it("falls back to x-real-ip, then a shared bucket", () => {
    expect(clientIp(req({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
    expect(clientIp(req({}))).toBe("unknown");
  });
});
