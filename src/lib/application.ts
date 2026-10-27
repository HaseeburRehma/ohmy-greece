/**
 * Franchise application: the answer options and the validation rules, shared
 * by the form (client) and /api/bewerbung (server) so both agree exactly.
 */

// Wording as in the Figma form (OMG Franchise Bewerbung).
export const CAPITAL_OPTIONS = [
  "Unter 25.000 €",
  "25.000 – 50.000 €",
  "50.000 – 100.000 €",
  "Über 100.000 €",
  "Noch unklar / möchte ich besprechen",
] as const;

export const EXPERIENCE_OPTIONS = ["Ja, mehrere Jahre", "Etwas Erfahrung", "Keine – aber hohe Motivation (Quereinsteiger)"] as const;

export const START_OPTIONS = [
  "So schnell wie möglich",
  "In den nächsten 3–6 Monaten",
  "In 6–12 Monaten",
  "Erstmal nur informieren",
] as const;

export const LIMITS = { city: 80, firstName: 60, lastName: 60, email: 254, phone: 30 } as const;

export type Application = {
  city: string;
  capital: string;
  experience: string;
  start: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  consent: boolean;
};

export const fullName = (a: Pick<Application, "firstName" | "lastName">) => `${a.firstName} ${a.lastName}`.trim();

export type ApplicationErrors = Partial<Record<keyof Application, string>>;

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
// Letters (incl. umlauts/accents), digits, spaces and common name/place punctuation.
const TEXT_RE = /^[\p{L}\p{M}\d .,'’()/&-]+$/u;
const PHONE_RE = /^\+?[\d\s()/.-]{6,30}$/;

/** Collapses whitespace and removes control characters (incl. CR/LF used for header injection). */
export const clean = (v: unknown, max: number) =>
  String(v ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

export function validateStep(step: number, a: Application): ApplicationErrors {
  const e: ApplicationErrors = {};
  if (step === 1) {
    if (a.city.trim().length < 2) e.city = "Bitte gib eine Stadt oder PLZ an.";
    else if (!TEXT_RE.test(a.city.trim())) e.city = "Bitte nur Buchstaben, Zahlen und Leerzeichen verwenden.";
  }
  if (step === 2 && !(CAPITAL_OPTIONS as readonly string[]).includes(a.capital)) e.capital = "Bitte wähle eine Option.";
  if (step === 3 && !(EXPERIENCE_OPTIONS as readonly string[]).includes(a.experience)) e.experience = "Bitte wähle eine Option.";
  if (step === 4 && !(START_OPTIONS as readonly string[]).includes(a.start)) e.start = "Bitte wähle eine Option.";
  if (step === 5) {
    if (a.firstName.trim().length < 1) e.firstName = "Bitte gib deinen Vornamen an.";
    else if (!TEXT_RE.test(a.firstName.trim())) e.firstName = "Bitte gib einen gültigen Vornamen an.";
    if (a.lastName.trim().length < 1) e.lastName = "Bitte gib deinen Nachnamen an.";
    else if (!TEXT_RE.test(a.lastName.trim())) e.lastName = "Bitte gib einen gültigen Nachnamen an.";
    if (!EMAIL_RE.test(a.email.trim())) e.email = "Bitte gib eine gültige E-Mail-Adresse an.";
    if (!PHONE_RE.test(a.phone.trim()) || a.phone.replace(/\D/g, "").length < 6)
      e.phone = "Bitte gib eine gültige Telefonnummer an.";
    if (a.consent !== true) e.consent = "Bitte stimme der Kontaktaufnahme zu.";
  }
  return e;
}

export const TOTAL_STEPS = 5;

/** Server-side: normalise untrusted input and validate every step at once. */
export function parseApplication(raw: Record<string, unknown>):
  | { ok: true; data: Application }
  | { ok: false; errors: ApplicationErrors } {
  const data: Application = {
    city: clean(raw.city, LIMITS.city),
    capital: clean(raw.capital, 60),
    experience: clean(raw.experience, 60),
    start: clean(raw.start, 60),
    firstName: clean(raw.firstName, LIMITS.firstName),
    lastName: clean(raw.lastName, LIMITS.lastName),
    email: clean(raw.email, LIMITS.email).toLowerCase(),
    phone: clean(raw.phone, LIMITS.phone),
    consent: raw.consent === true,
  };
  const errors: ApplicationErrors = {};
  for (let s = 1; s <= TOTAL_STEPS; s++) Object.assign(errors, validateStep(s, data));
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
