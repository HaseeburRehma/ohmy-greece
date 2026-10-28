import { Container, Eyebrow, Lines, delay } from "./ui";

export const STEPS = [
  {
    title: "Bewerbung",
    text: "Du füllst unser kurzes Online-Formular aus. Wir melden uns innerhalb von 24 Stunden bei dir.",
  },
  {
    title: "Kennenlernen",
    text: "Persönliches Gespräch in Köln oder via Video. Wir lernen dich kennen und stellen dir unser Konzept im Detail vor.",
  },
  {
    title: "Standort & Setup",
    text: "Wir scouten gemeinsam den passenden Standort, planen den Ladenbau und schulen dich und dein Team.",
  },
  {
    title: "Eröffnung",
    text: "Großes Opening mit Marketing-Boost, lokaler PR und unserem Team vor Ort in der Eröffnungsphase.",
  },
];

export type ProcessProps = { eyebrow?: string; title?: string; text?: string; steps?: { title: string; text: string }[] };

export default function Process({ eyebrow, title, text, steps }: ProcessProps = {}) {
  return (
    <section className="bg-ivory py-20 sm:py-[120px]">
      <Container className="flex flex-col items-center gap-12 sm:gap-16">
        <div className="flex flex-col items-center gap-5 text-center">
          <Eyebrow>{eyebrow ?? "DER WEG ZU DEINEM STORE"}</Eyebrow>
          <h2 data-reveal="blur" style={delay(100)} className="font-script text-[36px] leading-[1.08] tracking-[-0.02em] text-burgundy sm:text-5xl">
            <Lines text={title ?? "In vier Schritten zur Eröffnung."} />
          </h2>
          <p data-reveal="up" style={delay(200)} className="max-w-[640px] text-base leading-[1.55] text-muted sm:text-[17px]">
            {text ?? "Von der ersten Idee bis zum Tag der Eröffnung: So begleiten wir dich auf dem Weg zu deinem eigenen Oh My Greece Store."}
          </p>
        </div>

        <ol className="grid w-full grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {(steps ?? STEPS).map((s, i) => (
            <li
              key={i}
              data-reveal="up"
              style={delay(i * 130)}
              className="group flex flex-col items-start gap-5 rounded-[28px] border border-line-warm bg-white p-7 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(59,0,27,0.25)] sm:p-8"
            >
              <span
                className={`rounded-full px-4 py-2 transition-transform duration-300 group-hover:scale-110 font-display text-[22px] font-bold leading-normal text-burgundy ${i % 2 === 0 ? "bg-teal" : "bg-sun"}`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-2xl font-bold tracking-[-0.01em] text-burgundy">{s.title}</h3>
              <p className="text-sm leading-[1.6] text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
