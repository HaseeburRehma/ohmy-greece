"use client";

import { useState } from "react";
import { Container, CtaText, Eyebrow, Lines, PillButton, delay } from "./ui";

// Only the first answer is in the Figma file; the others are placeholders to be confirmed by Oh My Greece.
export const FAQS = [
  {
    q: "Wie hoch ist die Investition für einen Oh My Greece Store?",
    a: "Die Höhe der Investition hängt von Größe und Lage deines Standorts ab. Deshalb besprechen wir sie persönlich im kostenlosen Erstgespräch und rechnen dein konkretes Szenario gemeinsam durch.",
  },
  {
    q: "Brauche ich Erfahrung in der Gastronomie?",
    a: "Erfahrung hilft, ist aber keine Voraussetzung. Viel wichtiger sind Leidenschaft, Unternehmergeist und Lust auf Gastgeber-Sein. Alles andere bringen wir dir in unserer Schulung bei.",
  },
  {
    q: "Wie lange dauert es bis zur Eröffnung?",
    a: "Das hängt vor allem vom Standort und vom Ladenbau ab. Einen realistischen Zeitplan erstellen wir gemeinsam mit dir, sobald der passende Standort gefunden ist.",
  },
  {
    q: "Welche laufenden Gebühren fallen an?",
    a: "Alle Konditionen legen wir transparent im persönlichen Gespräch offen, damit du von Anfang an weißt, womit du rechnen kannst.",
  },
  {
    q: "In welchen Städten kann ich einen Store eröffnen?",
    a: "Wir wachsen deutschlandweit und eröffnen bevorzugt in Städten, in denen es noch keinen Oh My Greece Standort gibt. Sag uns einfach, welche Stadt du im Kopf hast.",
  },
  {
    q: "Bekomme ich exklusiven Gebietsschutz?",
    a: "Gebietsschutz ist Teil unserer Partnerschaft. Wie groß dein Gebiet ist, besprechen wir abhängig von Stadt und Standort im Erstgespräch.",
  },
  {
    q: "Was unterscheidet euch von anderen Franchise-Konzepten?",
    a: "Bei uns bist du Teil der Familie: Wir sind in der Eröffnungsphase vor Ort, helfen beim Recruiting und teilen alles, was wir gelernt haben – und wir sind immer nur einen Anruf entfernt.",
  },
  {
    q: "Wie läuft die Bewerbung ab?",
    a: "Du füllst unser kurzes Online-Formular aus, wir melden uns innerhalb von 24 Stunden. Danach lernen wir uns persönlich in Köln oder per Video kennen.",
  },
];

export type FaqProps = {
  eyebrow?: string;
  title?: string;
  items?: { q: string; a: string }[];
  ctaTitle?: string;
  ctaText?: string;
};

export default function Faq({ eyebrow, title, items, ctaTitle, ctaText }: FaqProps = {}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-sun py-20 sm:py-[120px]">
      <Container className="flex flex-col items-center gap-12 sm:gap-14">
        <div className="flex flex-col items-center gap-5 text-center">
          <Eyebrow>{eyebrow ?? "HÄUFIG GESTELLTE FRAGEN"}</Eyebrow>
          <h2 data-reveal="blur" style={delay(100)} className="font-script text-[36px] leading-[1.08] tracking-[-0.02em] text-burgundy sm:text-5xl">
            <Lines text={title ?? "Du hast Fragen? Wir haben Antworten."} />
          </h2>
        </div>

        <ul className="w-full max-w-[960px] divide-y divide-burgundy/10">
          {(items ?? FAQS).map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={i} data-reveal="up" style={delay(Math.min(i, 4) * 70)} className="py-6">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="font-display text-[17px] font-bold leading-[1.35] tracking-[-0.01em] text-burgundy sm:text-[19px]">
                      {item.q}
                    </span>
                    <span
                      aria-hidden
                      className={`flex h-[50px] w-[34px] shrink-0 items-center justify-center rounded-full font-display text-xl font-bold text-burgundy transition duration-300 ${isOpen ? "rotate-180" : ""} ${isOpen ? "bg-sun" : "border border-[#ebe3d9] bg-white"}`}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-${i}`}
                  className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <p inert={!isOpen} className="min-h-0 overflow-hidden text-base leading-[1.65] text-burgundy/50">
                    <span className="block pt-4">{item.a}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <div data-reveal="zoom" className="flex w-full max-w-[960px] flex-col items-start gap-5 rounded-[24px] bg-teal-deep px-6 py-7 text-burgundy sm:px-10 sm:py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1.5">
            <p className="font-display text-[22px] font-bold">{ctaTitle ?? "Noch Fragen offen?"}</p>
            <p className="text-sm opacity-50">{ctaText ?? "Schreib uns, wir antworten innerhalb von 24 Stunden."}</p>
          </div>
          <PillButton href="#bewerbung" size="md" className="w-full md:w-auto">
            <CtaText />
          </PillButton>
        </div>
      </Container>
    </section>
  );
}
