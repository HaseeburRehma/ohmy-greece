import { describe, expect, it } from "vitest";
import { clean, parseApplication, validateStep, type Application } from "@/lib/application";

const valid: Application = {
  city: "Düsseldorf",
  capital: "25.000 – 50.000 €",
  experience: "Etwas Erfahrung",
  start: "In den nächsten 3–6 Monaten",
  firstName: "Nikos",
  lastName: "Papadopoulos",
  email: "nikos@example.com",
  phone: "+49 170 1234567",
  consent: true,
};

describe("validateStep", () => {
  it("accepts a complete application on every step", () => {
    for (let s = 1; s <= 5; s++) expect(validateStep(s, valid)).toEqual({});
  });

  it("accepts PLZ, umlauts, accents and hyphenated names", () => {
    expect(validateStep(1, { ...valid, city: "40210" })).toEqual({});
    expect(validateStep(1, { ...valid, city: "Frankfurt am Main" })).toEqual({});
    expect(validateStep(5, { ...valid, lastName: "Müller-Lüdenscheidt", firstName: "Zoë" })).toEqual({});
    expect(validateStep(5, { ...valid, lastName: "O'Neil" })).toEqual({});
  });

  it("rejects markup and script in free-text fields", () => {
    expect(validateStep(1, { ...valid, city: "<script>alert(1)</script>" }).city).toBeTruthy();
    expect(validateStep(5, { ...valid, firstName: '"><img src=x onerror=alert(1)>' }).firstName).toBeTruthy();
    expect(validateStep(5, { ...valid, lastName: "<b>x</b>" }).lastName).toBeTruthy();
  });

  it("rejects options that are not on the form", () => {
    expect(validateStep(2, { ...valid, capital: "1 Mio" }).capital).toBeTruthy();
    expect(validateStep(3, { ...valid, experience: "Ja" }).experience).toBeTruthy();
    expect(validateStep(4, { ...valid, start: "morgen" }).start).toBeTruthy();
  });

  it("validates contact details and consent", () => {
    expect(validateStep(5, { ...valid, email: "nope" }).email).toBeTruthy();
    expect(validateStep(5, { ...valid, email: "a@b.c" }).email).toBeTruthy();
    expect(validateStep(5, { ...valid, email: "x@evil.com>\r\nBcc: y@z.de" }).email).toBeTruthy();
    expect(validateStep(5, { ...valid, phone: "12" }).phone).toBeTruthy();
    expect(validateStep(5, { ...valid, phone: "call me maybe" }).phone).toBeTruthy();
    expect(validateStep(5, { ...valid, consent: false }).consent).toBeTruthy();
    expect(validateStep(5, { ...valid, firstName: " " }).firstName).toBeTruthy();
    expect(validateStep(5, { ...valid, lastName: "" }).lastName).toBeTruthy();
  });
});

describe("clean", () => {
  it("strips control characters (CR/LF header injection) and collapses whitespace", () => {
    expect(clean("Köln\r\nBcc: victim@example.com", 200)).toBe("Köln Bcc: victim@example.com");
    expect(clean("  a\t\tb  ", 10)).toBe("a b");
  });
  it("caps length and stringifies non-strings", () => {
    expect(clean("x".repeat(500), 80)).toHaveLength(80);
    expect(clean({ toString: () => "obj" }, 10)).toBe("obj");
    expect(clean(undefined, 10)).toBe("");
  });
});

describe("parseApplication", () => {
  it("normalises valid input", () => {
    const r = parseApplication({ ...valid, email: "  NIKOS@Example.COM ", city: " Düsseldorf  " });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.email).toBe("nikos@example.com");
      expect(r.data.city).toBe("Düsseldorf");
    }
  });

  it("requires consent to be the boolean true, not a truthy string", () => {
    const r = parseApplication({ ...valid, consent: "true" });
    expect(r.ok).toBe(false);
  });

  it("reports every invalid field at once", () => {
    const r = parseApplication({});
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["capital", "city", "consent", "email", "experience", "firstName", "lastName", "phone", "start"]);
  });

  it("ignores unknown and prototype-polluting keys", () => {
    const raw = JSON.parse(`{"__proto__":{"admin":true},"constructor":{"x":1},${JSON.stringify(valid).slice(1)}`);
    const r = parseApplication(raw);
    expect(r.ok).toBe(true);
    expect(({} as Record<string, unknown>).admin).toBeUndefined();
    if (r.ok) expect(Object.keys(r.data).sort()).toEqual(Object.keys(valid).sort());
  });

  it("rejects over-long values after trimming them to the limit", () => {
    const r = parseApplication({ ...valid, lastName: "A".repeat(10_000) });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.lastName.length).toBeLessThanOrEqual(60);
  });
});
