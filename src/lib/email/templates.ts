/**
 * Franchise application emails: a notification to the team and a
 * confirmation to the applicant. Layout and building blocks live in ./layout.
 */
import type { Application } from "@/lib/application";
import { SITE, button, details, emailShell, esc, eyebrow, heading, paragraph, signoff, steps } from "./layout";

/** "Nikos Papadopoulos" → "Nikos", for the greeting. */
const firstName = (name: string) => name.split(/\s+/)[0] || name;

const NEXT_STEPS = [
  "Wir schauen uns deine Angaben in Ruhe an.",
  "Innerhalb von 24 Stunden melden wir uns telefonisch oder per E-Mail bei dir.",
  "Wir lernen uns kennen – persönlich in Köln oder per Video – und stellen dir das Konzept im Detail vor.",
];

type Opts = { site?: string; receivedAt?: Date };

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" }).format(d);

/** Notification to the Oh My Greece team. */
export function teamEmail(d: Application, { site = SITE, receivedAt = new Date() }: Opts = {}) {
  const tel = d.phone.replace(/[^\d+]/g, "");
  const body = `
    ${eyebrow("Neue Bewerbung")}
    ${heading("Neue Franchise&#8209;Anfrage")}
    ${paragraph(`<strong>${esc(d.name)}</strong> möchte einen Oh My Greece Store in <strong>${esc(d.city)}</strong> eröffnen.`)}
    ${details("Kontakt", [
      ["Name", d.name],
      ["E-Mail", d.email, `mailto:${d.email}`],
      ["Telefon", d.phone, `tel:${tel}`],
    ])}
    ${details("Angaben", [
      ["Stadt / Region", d.city],
      ["Gastro-Erfahrung", d.experience],
      ["Start", d.start],
      ["Eingegangen", formatDate(receivedAt)],
    ])}
    ${button(`${firstName(d.name)} antworten`, `mailto:${d.email}?subject=${encodeURIComponent("Dein Oh My Greece Store")}`)}
    ${paragraph("Antworten auf diese E-Mail gehen direkt an die Bewerberin oder den Bewerber. Versprochen auf der Website: Rückmeldung innerhalb von 24 Stunden.", { muted: true, size: 13 })}`;
  return emailShell({
    title: "Neue Franchise-Anfrage",
    preheader: `${d.name} · ${d.city} · ${d.start}`,
    body,
    audience: "team",
    site,
  });
}

/** Confirmation to the applicant. */
export function applicantEmail(d: Application, { site = SITE }: Opts = {}) {
  const body = `
    ${eyebrow("Anfrage erhalten")}
    ${heading(`Danke, ${esc(firstName(d.name))}!`)}
    ${paragraph(`Schön, dass du Teil der Oh My Greece Familie werden möchtest. Wir haben deine Anfrage für <strong>${esc(d.city)}</strong> erhalten und melden uns innerhalb von 24 Stunden bei dir.`)}
    ${steps("So geht es weiter", NEXT_STEPS)}
    ${details("Deine Angaben", [
      ["Stadt / Region", d.city],
      ["Gastro-Erfahrung", d.experience],
      ["Start", d.start],
      ["Telefon", d.phone],
    ])}
    ${button("Konzept nochmal ansehen", `${site}/#konzept`, "burgundy")}
    ${paragraph("Fragen? Antworte einfach auf diese E-Mail.", { muted: true, size: 14 })}
    ${signoff()}`;
  return emailShell({
    title: "Danke für deine Franchise-Anfrage",
    preheader: "Wir melden uns innerhalb von 24 Stunden bei dir. Make Gyros Great Again!",
    body,
    site,
  });
}

export function teamText(d: Application, { receivedAt = new Date() }: Opts = {}) {
  return `Neue Franchise-Anfrage

${d.name} möchte einen Oh My Greece Store in ${d.city} eröffnen.

Name: ${d.name}
E-Mail: ${d.email}
Telefon: ${d.phone}
Stadt / Region: ${d.city}
Gastro-Erfahrung: ${d.experience}
Start: ${d.start}
Eingegangen: ${formatDate(receivedAt)}`;
}

export function applicantText(d: Application, { site = SITE }: Opts = {}) {
  return `Danke, ${firstName(d.name)}!

Wir haben deine Anfrage für ${d.city} erhalten und melden uns innerhalb von 24 Stunden bei dir.

So geht es weiter:
${NEXT_STEPS.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Deine Angaben
Stadt / Region: ${d.city}
Gastro-Erfahrung: ${d.experience}
Start: ${d.start}
Telefon: ${d.phone}

Fragen? Antworte einfach auf diese E-Mail.

Bis bald,
deine Oh My Greece Familie
${site}`;
}

/** Sample data for the dev preview and tests. */
export const SAMPLE_APPLICATION: Application = {
  city: "Düsseldorf",
  experience: "Ja, ein wenig",
  start: "In 3–6 Monaten",
  name: "Nikos Papadopoulos",
  email: "nikos@example.com",
  phone: "+49 170 1234567",
  consent: true,
};
