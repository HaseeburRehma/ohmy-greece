import Image from "next/image";
import CountUp from "./CountUp";
import { Container, Eyebrow, delay } from "./ui";

const POINTS = [
  { title: "100 % Halal-Fleisch", text: "Unser gesamtes Fleisch ist 100 % Halal.", bullet: "bg-teal" },
  { title: "Täglich frisch gebackenes Pita", text: "Jeden Morgen frisch aus dem Ofen, in jedem Store.", bullet: "bg-sun" },
  {
    title: "Ohne künstliche Zusätze",
    text: "Traditionelle griechische Rezepte, ehrlich und ohne künstliche Zusätze.",
    bullet: "bg-teal",
  },
];

export default function Quality() {
  return (
    <section className="bg-cream py-20 sm:py-[120px]">
      <Container className="flex flex-col items-center gap-14 lg:flex-row lg:gap-16 xl:gap-20">
        {/* 560×560 photo collage */}
        <div className="relative aspect-square w-full max-w-[560px] shrink-0 lg:w-[460px] xl:w-[560px]">
          <div data-reveal="photo" className="absolute left-0 top-[10.71%] h-[78.57%] w-[64.29%] overflow-hidden rounded-[20px] sm:rounded-[28px]">
            <Image
              src="/images/quality-big.jpg"
              alt="Frisch zubereiteter Gyros-Teller"
              fill
              sizes="(min-width: 1280px) 360px, 60vw"
              className="object-cover"
            />
          </div>
          <div data-reveal="photo" style={delay(180)} className="absolute left-[60.71%] top-0 h-[42.86%] w-[39.29%] overflow-hidden rounded-[14px] sm:rounded-[20px]">
            <Image src="/images/quality-small-1.jpg" alt="Griechische Zutaten" fill sizes="(min-width: 1280px) 220px, 40vw" className="object-cover" />
          </div>
          <div data-reveal="photo" style={delay(320)} className="absolute left-[60.71%] top-[46.43%] h-[42.86%] w-[39.29%] overflow-hidden rounded-[14px] sm:rounded-[20px]">
            <Image src="/images/quality-small-2.jpg" alt="Frisch gebackenes Pita" fill sizes="(min-width: 1280px) 220px, 40vw" className="object-cover" />
          </div>
          <div data-reveal="pop" style={delay(700)} className="absolute left-[5.36%] top-[82.14%] flex animate-float flex-col gap-0.5 rounded-[16px] bg-sun px-4 py-3 text-burgundy shadow-[0_10px_28px_-2px_rgba(59,0,27,0.16)] sm:rounded-[20px] sm:px-[22px] sm:py-[18px]">
            <p className="font-display text-[22px] font-bold leading-tight sm:text-[28px]">
              <CountUp to={100} suffix="%" />
            </p>
            <p className="text-[11px] font-semibold sm:text-xs">Halal-Fleisch</p>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col items-start gap-6 sm:gap-7">
          <Eyebrow>QUALITÄT &amp; FRISCHE</Eyebrow>
          <h2 data-reveal="blur" style={delay(100)} className="font-script text-[34px] leading-[1.08] tracking-[-0.02em] text-burgundy sm:text-[44px] xl:text-[41px]">
            Echte Zutaten. <br className="sm:hidden" />
            Echtes Handwerk. <br className="sm:hidden" />
            Echtes <br className="hidden xl:inline" />
            Griechenland.
          </h2>
          <p data-reveal="up" style={delay(200)} className="text-base leading-[1.65] text-muted">
            Guter griechischer Genuss fängt bei den Zutaten an. Deshalb kochen wir nach traditionellen griechischen
            Rezepten, backen unser Pita jeden Tag frisch und verzichten komplett auf künstliche Zusätze.
          </p>
          <ul className="flex w-full flex-col gap-4">
            {POINTS.map((p, i) => (
              <li key={p.title} data-reveal="left" style={delay(300 + i * 120)} className="flex items-start gap-3.5">
                <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${p.bullet}`} />
                <div className="flex flex-col gap-1">
                  <p className="font-display text-[17px] font-bold text-burgundy">{p.title}</p>
                  <p className="text-sm leading-[1.55] text-muted">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
