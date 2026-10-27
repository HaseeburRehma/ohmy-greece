import { expect, test, type Page } from "@playwright/test";

// Every test gets its own client IP so the API rate limit doesn't leak between runs.
test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250) + 1}` });
});

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" || /hydrat/i.test(m.text())) errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test("loads without console errors or hydration warnings, top to bottom", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Werde Teil der Oh My Greece");
  // Walk the page so every reveal/count-up/lazy image runs.
  for (let y = 0; y < 12_000; y += 700) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(800);
  expect(errors).toEqual([]);
  // Everything marked for reveal has been revealed.
  const hidden = await page.locator("[data-reveal]:not(.is-visible)").count();
  expect(hidden).toBe(0);
  // No broken images among those rendered at this size (display:none lazy images never load).
  const shown = () => [...document.images].filter((i) => i.getClientRects().length > 0);
  await page.waitForFunction(`(${shown})().every((i) => i.complete)`);
  const broken = await page.evaluate(`(${shown})().filter((i) => !i.naturalWidth).map((i) => i.src)`);
  expect(broken).toEqual([]);
});

for (const width of [320, 375, 768, 1024, 1280, 1440]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(width);
  });
}

test("security headers are sent and the framework is not advertised", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'self'");
  expect(h["content-security-policy"]).toContain("object-src 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-frame-options"]).toBe("SAMEORIGIN");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["x-powered-by"]).toBeUndefined();
});

test("mobile menu opens, closes with Escape and on outside tap", async ({ page, isMobile }) => {
  test.skip(!isMobile, "hamburger menu only exists on small screens");
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Menü öffnen" });
  await toggle.click();
  const menu = page.locator("#mobile-nav");
  await expect(menu.getByRole("link", { name: "Über uns" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Menü öffnen" })).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("button", { name: "Menü öffnen" })).toBeFocused();

  await page.getByRole("button", { name: "Menü öffnen" }).click();
  await page.mouse.click(10, 600);
  await expect(page.getByRole("button", { name: "Menü öffnen" })).toHaveAttribute("aria-expanded", "false");
});

test("desktop navigation is visible and the burger is hidden", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop only");
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Hauptnavigation" }).getByRole("link", { name: "Menü" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Menü öffnen" })).toBeHidden();
});

test("FAQ accordion opens one answer at a time", async ({ page }) => {
  await page.goto("/");
  const first = page.getByRole("button", { name: /Wie hoch ist die Investition/ });
  const third = page.getByRole("button", { name: /Wie lange dauert es bis zur Eröffnung/ });
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await third.scrollIntoViewIfNeeded();
  await third.click();
  await expect(third).toHaveAttribute("aria-expanded", "true");
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#faq-2")).toContainText("Standort und vom Ladenbau");
  await expect.poll(async () => (await page.locator("#faq-2").boundingBox())?.height ?? 0).toBeGreaterThan(30);
  await expect.poll(async () => (await page.locator("#faq-0").boundingBox())?.height ?? 99).toBeLessThan(2);
});

test("in-page CTA scrolls smoothly to the form", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Kostenlos mehr erfahren/ }).first().click();
  await expect.poll(() => page.evaluate(() => Math.round(document.querySelector("#bewerbung")!.getBoundingClientRect().top))).toBeLessThan(80);
});

const visiblePhoto = (page: Page) =>
  page.locator("#bewerbung [aria-hidden='false'] img").getAttribute("src").then((src) => decodeURIComponent(src ?? ""));

test("application form: auto-advance, step photos, validation, submit, success", async ({ page, isMobile }) => {
  const errors = collectErrors(page);
  await page.goto("/#bewerbung");
  const form = page.locator("#bewerbung");
  const step = (n: number) => expect(form.getByText(`Schritt ${n} von 5`)).toBeVisible();

  await form.getByRole("button", { name: "Weiter" }).click();
  await expect(form.getByText("Bitte gib eine Stadt oder PLZ an.")).toBeVisible();
  if (!isMobile) expect(await visiblePhoto(page)).toContain("form-step-1");

  // Step 1 continues on its own once the city is entered and the field is left.
  await form.getByLabel("Stadt / PLZ").fill("Düsseldorf");
  await form.getByRole("heading", { level: 2 }).click();
  await step(2);
  await expect(form.getByText("Welches Eigenkapital kannst du für den Start einbringen?")).toBeVisible();
  if (!isMobile) await expect.poll(() => visiblePhoto(page)).toContain("form-step-2");

  // Picking an answer advances without pressing Weiter.
  await form.getByRole("radio", { name: "25.000 – 50.000 €" }).click();
  await step(3);
  await expect(form.getByText("Hast du bereits Erfahrung in der Gastronomie?")).toBeVisible();
  if (!isMobile) await expect.poll(() => visiblePhoto(page)).toContain("form-step-3");

  // Arrow keys only move the selection; Enter confirms and advances.
  await form.getByRole("radio", { name: "Ja, mehrere Jahre" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(form.getByRole("radio", { name: "Etwas Erfahrung" })).toHaveAttribute("aria-checked", "true");
  await page.waitForTimeout(600);
  await step(3);
  await page.keyboard.press("Enter");
  await step(4);

  await form.getByRole("radio", { name: "In den nächsten 3–6 Monaten" }).click();
  await step(5);
  if (!isMobile) await expect.poll(() => visiblePhoto(page)).toContain("form-step-5");

  // Back keeps the answer, and choosing it again moves on.
  await form.getByRole("button", { name: "Zurück" }).click();
  await step(4);
  await expect(form.getByRole("radio", { name: "In den nächsten 3–6 Monaten" })).toHaveAttribute("aria-checked", "true");
  await form.getByRole("radio", { name: "In den nächsten 3–6 Monaten" }).click();
  await step(5);

  const cta = form.getByRole("button", { name: "Kostenlos mehr erfahren – jetzt eintragen" });
  await form.getByLabel("Vorname *").fill("Test");
  await form.getByLabel("E-Mail *").fill("not-an-email");
  await form.getByLabel("Telefon / WhatsApp *").fill("+49 170 0000000");
  await cta.click();
  await expect(form.getByText("Bitte gib deinen Nachnamen an.")).toBeVisible();
  await expect(form.getByText("Bitte gib eine gültige E-Mail-Adresse an.")).toBeVisible();
  await expect(form.getByText("Bitte stimme der Kontaktaufnahme zu.")).toBeVisible();
  await step(5); // the last step never submits by itself

  await form.getByLabel("Nachname *").fill("Person");
  await form.getByLabel("E-Mail *").fill(`e2e+${Date.now()}@example.com`);
  await form.getByRole("checkbox").check();
  // the API rejects forms "completed" in under 3 s as bots
  await page.waitForTimeout(3000);
  const response = page.waitForResponse("**/api/bewerbung");
  await cta.click();
  const res = await response;
  expect(res.status()).toBe(200);
  expect(res.request().postDataJSON()).toMatchObject({
    city: "Düsseldorf",
    capital: "25.000 – 50.000 €",
    experience: "Etwas Erfahrung",
    start: "In den nächsten 3–6 Monaten",
    firstName: "Test",
    lastName: "Person",
  });
  await expect(form.getByRole("status")).toContainText("Danke!");
  await expect(form.getByRole("status")).toContainText("Prüf schon mal dein Postfach.");
  if (!isMobile) await expect.poll(() => visiblePhoto(page)).toContain("form-done");
  else await expect(form.getByRole("img", { name: /Griechische Platte/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test("Zurück cancels a pending auto-advance", async ({ page }) => {
  await page.goto("/#bewerbung");
  const form = page.locator("#bewerbung");
  await form.getByLabel("Stadt / PLZ").fill("Köln");
  await page.keyboard.press("Enter");
  await form.getByRole("radio", { name: "Unter 25.000 €" }).click();
  await form.getByRole("radio", { name: "Ja, mehrere Jahre" }).click();
  // go back within the advance delay; the timer from step 3 must not push us forward again
  await form.getByRole("button", { name: "Zurück" }).click();
  await page.waitForTimeout(800);
  await expect(form.getByText("Schritt 2 von 5")).toBeVisible();
});

test("form shows a fallback message when the server fails", async ({ page }) => {
  await page.route("**/api/bewerbung", (r) => r.fulfill({ status: 502, body: '{"error":"send_failed"}' }));
  await page.goto("/#bewerbung");
  const form = page.locator("#bewerbung");
  await form.getByLabel("Stadt / PLZ").fill("Köln");
  await page.keyboard.press("Enter");
  await form.getByRole("radio", { name: "Über 100.000 €" }).click();
  await form.getByRole("radio", { name: "Ja, mehrere Jahre" }).click();
  await form.getByRole("radio", { name: "So schnell wie möglich" }).click();
  await form.getByLabel("Vorname *").fill("Test");
  await form.getByLabel("Nachname *").fill("Person");
  await form.getByLabel("E-Mail *").fill("t@example.com");
  await form.getByLabel("Telefon / WhatsApp *").fill("0221 123456");
  await form.getByRole("checkbox").check();
  const cta = form.getByRole("button", { name: /jetzt eintragen/ });
  await cta.click();
  await expect(form.getByRole("alert")).toContainText("info@ohmygreece.de");
  await expect(cta).toBeEnabled();
});

test("email preview gallery renders both templates (dev only)", async ({ page }) => {
  const res = await page.goto("/email-preview?t=applicant");
  test.skip(res?.status() === 404, "preview is disabled in production");
  await expect(page.getByText("Danke, Nikos!")).toBeVisible();
  await page.goto("/email-preview?t=team");
  await expect(page.getByText("Neue Franchise‑Anfrage")).toBeVisible();
});
