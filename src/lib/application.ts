/**
 * Franchise application: the answer options and the validation rules, shared
 * by the form (client) and /api/bewerbung (server) so both agree exactly.
 */

export const EXPERIENCE_OPTIONS = ["Ja, mehrere Jahre", "Ja, ein wenig", "Nein, ich bin Quereinsteiger:in"] as const;

export const START_OPTIONS = [
  "So schnell wie möglich",
  "In 3–6 Monaten",
  "In 6–12 Monaten",
  "Ich informiere mich erst einmal",
] as const;

export const LIMITS = { city: 80, name: 100, email: 254, phone: 30 } as const;

export type Application = {
  city: string;
  experience: string;
  start: string;
  name: string;
  email: string;
  phone: string;
  consent: boolean;
};

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
  if (step === 2 && !(EXPERIENCE_OPTIONS as readonly string[]).includes(a.experience)) e.experience = "Bitte wähle eine Option.";
  if (step === 3 && !(START_OPTIONS as readonly string[]).includes(a.start)) e.start = "Bitte wähle eine Option.";
  if (step === 4) {
    if (a.name.trim().length < 2) e.name = "Bitte gib deinen Namen an.";
    else if (!TEXT_RE.test(a.name.trim())) e.name = "Bitte gib einen gültigen Namen an.";
  }
  if (step === 5) {
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
    experience: clean(raw.experience, 60),
    start: clean(raw.start, 60),
    name: clean(raw.name, LIMITS.name),
    email: clean(raw.email, LIMITS.email).toLowerCase(),
    phone: clean(raw.phone, LIMITS.phone),
    consent: raw.consent === true,
  };
  const errors: ApplicationErrors = {};
  for (let s = 1; s <= TOTAL_STEPS; s++) Object.assign(errors, validateStep(s, data));
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
