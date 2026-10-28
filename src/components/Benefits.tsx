import Image from "next/image";
import { Container, Eyebrow, delay } from "./ui";

const BENEFITS = [
  {
    title: "Etabliertes Konzept",
    text: "Deutschlands beliebtester Grieche mit klarer Positionierung. Du startest nicht bei null, sondern mit einem fertigen Konzept.",
  },
  {
    title: "Komplettes Setup",
    text: "Von Ladenbau über Equipment bis zum Kassensystem: wir begleiten jeden Schritt der Eröffnung.",
  },
  {
    title: "100 % Halal-Qualität",
    text: "100 % Halal-Fleisch, täglich frisch gebackenes Pita und griechische Rezepte ohne künstliche Zusätze.",
  },
  {
    title: "Marketing & PR",
    text: "Wir kümmern uns um Kampagnen, Social Media und Eröffnungs-Hype, damit dein Store von Tag eins läuft.",
  },
  {
    title: "Standort-Scouting",
    text: "Wir helfen dir, den passenden Standort in deiner Stadt zu finden, und prüfen ihn gemeinsam mit dir.",
  },
  {
    title: "Familie statt Franchise",
    text: "Du bist nicht nur Lizenznehmer, sondern Teil unserer Familie. Wir sind nur einen Anruf entfernt.",
  },
];

export default function Benefits() {
  return (
    <section className="bg-ivory py-20 sm:py-[120px]">
      <Container className="flex flex-col items-center gap-12 sm:gap-16">
        <div className="flex flex-col items-center gap-5 text-center">
          <Eyebrow>WAS UNS BESONDERS MACHT</Eyebrow>
          <h2 data-reveal="blur" style={delay(100)} className="font-script text-[36px] leading-[1.08] tracking-[-0.02em] text-burgundy sm:text-5xl">
            Sechs gute Gründe für
            <br />
            Oh My Greece als Partner.
          </h2>
          <p data-reveal="up" style={delay(200)} className="max-w-[700px] text-base leading-[1.55] text-muted sm:text-[17px]">
            Wir geben dir alles, was du für den erfolgreichen Start brauchst: vom ersten Konzeptgespräch bis zur Eröffnung
            deines Stores.
          </p>
        </div>

        <ul className="grid w-full grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <li
              key={b.title}
              data-reveal="up"
              style={delay((i % 3) * 110)}
              className="group flex flex-col items-start gap-4 rounded-[24px] border border-line bg-white p-6 sm:gap-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(59,0,27,0.25)] sm:p-8"
            >
              <span className={`flex rounded-[16px] px-3.5 py-3 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${i % 2 === 0 ? "bg-teal" : "bg-sun"}`}>
                <Image src={`/images/icons/benefit-${i + 1}.svg`} alt="" width={26} height={26} />
              </span>
              <h3 className="font-display text-[22px] font-bold leading-[1.2] tracking-[-0.01em] text-burgundy">{b.title}</h3>
              <p className="text-sm leading-[1.6] text-muted">{b.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
