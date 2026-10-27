import Image from "next/image";
import CountUp from "./CountUp";
import { Container, CtaText, OpaBadge, PillButton, delay } from "./ui";

const STATS = [
  { value: 2, suffix: "", label: ["Filialen", "in Köln"] },
  { value: 100, suffix: "%", label: ["Halal-", "Fleisch"] },
  { value: 0, suffix: "", label: ["künstliche", "Zusätze"] },
];

export default function Hero() {
  return (
    <section className="bg-cream pb-16 pt-[120px] sm:pt-[170px] lg:min-h-[880px] lg:pb-20 lg:pt-40">
      <Container className="flex flex-col items-center gap-14 lg:flex-row lg:gap-16">
        <div className="flex w-full flex-1 flex-col items-start gap-6 sm:gap-7">
          <span data-reveal="up" style={delay(150)} className="rounded-full bg-teal px-3.5 py-1.5 text-xs font-bold tracking-[0.08em] text-burgundy">
            FRANCHISE PROGRAMM
          </span>
          <h1 data-reveal="blur" style={delay(250)} className="font-script text-[44px] leading-none tracking-[-0.03em] text-burgundy sm:text-[54px] xl:text-[58px]">
            Werde Teil der Oh My Greece <br className="hidden sm:inline" />
            Familie.
          </h1>
          <p data-reveal="up" style={delay(400)} className="max-w-[656px] text-base leading-[1.55] text-body sm:text-lg">
            Verwirkliche deinen Traum vom eigenen Restaurant, mit einem starken Partner an deiner Seite. Wir bringen
            griechischen Genuss in deine Stadt und du wirst Teil einer Marke, die Menschen lieben.
          </p>
          <div data-reveal="up" style={delay(520)} className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row">
            <PillButton href="#bewerbung">
              <CtaText />
            </PillButton>
            <PillButton href="#konzept" variant="outline">
              Konzept entdecken
            </PillButton>
          </div>
          <dl className="flex gap-10 pt-6 sm:pt-8">
            {STATS.map((s, i) => (
              <div key={s.label[0]} data-reveal="up" style={delay(650 + i * 100)} className="flex flex-col-reverse gap-1">
                <dt className="text-[13px] font-medium leading-[1.35] text-grey">
                  {s.label[0]}
                  <br />
                  {s.label[1]}
                </dt>
                <dd className="font-display text-[32px] font-bold leading-tight tracking-[-0.02em] text-burgundy sm:text-[36px]">
                  <CountUp to={s.value} suffix={s.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* 560×640 composition from the design, positioned in percentages so it scales down */}
        <div className="relative aspect-[560/640] w-full max-w-[560px] shrink-0 lg:w-[440px] xl:w-[560px]">
          <div data-reveal="zoom" data-parallax style={delay(200, -0.06)} className="absolute left-[3.57%] top-[9.375%] h-[81.25%] w-[92.86%] rounded-full bg-teal" />
          <div data-reveal="pop" data-parallax style={delay(600, -0.18)} className="absolute left-[83.93%] top-0 h-[17.19%] w-[19.64%] rounded-full bg-sun max-sm:left-[78%]" />
          <div data-reveal="photo" style={delay(300)} className="absolute left-[10.71%] top-[6.25%] h-[87.5%] w-[78.57%] overflow-hidden rounded-[24px] sm:rounded-[32px]">
            <Image
              src="/images/hero-photo.jpg"
              alt="Oh My Greece Gyros-Bowl mit Pommes, Salat und Tzatziki"
              fill
              preload
              sizes="(min-width: 1280px) 440px, (min-width: 1024px) 345px, 80vw"
              className="object-cover"
            />
          </div>
          <OpaBadge className="left-0 top-[75%]" d={900} />
          <div data-reveal="pop" style={delay(1050)} className="absolute left-[64.8%] top-[83.9%] flex animate-float-slow flex-col gap-1.5 whitespace-nowrap rounded-[16px] bg-white px-3.5 py-2.5 shadow-[0_12px_32px_-4px_rgba(59,0,27,0.18)] max-sm:left-auto max-sm:right-[4%] sm:rounded-[20px] sm:px-[18px] sm:py-3.5">
            <p className="text-xs font-bold text-burgundy sm:text-[13px]">Täglich frisch</p>
            <p className="text-[10px] font-medium text-grey sm:text-[11px]">gebackenes Pita</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
