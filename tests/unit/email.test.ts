import { describe, expect, it } from "vitest";
import { esc } from "@/lib/email/layout";
import { address } from "@/lib/email/mailer";
import { applicantEmail, applicantText, SAMPLE_APPLICATION, teamEmail, teamText } from "@/lib/email/templates";

describe("esc", () => {
  it("escapes every HTML-significant character", () => {
    expect(esc(`<a href="x" onclick='y'>&</a>`)).toBe("&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
  });
});

describe("address", () => {
  it("cannot be used for header injection", () => {
    const a = address('Eve"\r\nBcc: victim@example.com', "eve@example.com\r\nBcc: x@y.z");
    expect(a).not.toMatch(/[\r\n]/);
    expect(a.match(/</g)).toHaveLength(1);
    expect(a.startsWith('"Eve')).toBe(true);
  });
});

describe("templates", () => {
  // Bypass validation on purpose: templates must stay safe even if it regresses.
  const hostile = {
    ...SAMPLE_APPLICATION,
    firstName: "<script>alert(1)</script>",
    lastName: "Eve<b>",
    city: '"><img src=x onerror=alert(1)>',
  };

  it("never emits raw user markup", () => {
    for (const html of [teamEmail(hostile), applicantEmail(hostile)]) {
      expect(html).not.toContain("<script>alert(1)</script>");
      expect(html).not.toContain("<img src=x");
      expect(html).toContain("&lt;script&gt;");
    }
  });

  it("renders the applicant's data and a valid document", () => {
    const team = teamEmail(SAMPLE_APPLICATION, { site: "https://example.test" });
    expect(team).toContain("Nikos Papadopoulos");
    expect(team).toContain("mailto:nikos@example.com");
    expect(team).toContain('href="tel:+491701234567"');
    expect(team).toContain("https://example.test/images/logo-oh-my-greece.png");
    expect(team.startsWith("<!doctype html>")).toBe(true);

    const mail = applicantEmail(SAMPLE_APPLICATION);
    expect(mail).toContain("Danke, Nikos!");
    expect(mail).toContain("Düsseldorf");
  });

  it("has plain-text parts with every field", () => {
    const t = teamText(SAMPLE_APPLICATION);
    for (const v of ["Nikos Papadopoulos", "nikos@example.com", "+49 170 1234567", "Düsseldorf", "Etwas Erfahrung", "In den nächsten 3–6 Monaten", "25.000 – 50.000 €"])
      expect(t).toContain(v);
    expect(applicantText(SAMPLE_APPLICATION)).toContain("Danke, Nikos!");
  });
});
