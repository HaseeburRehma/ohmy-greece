import CountUp from "./CountUp";
import HeroVideo from "./HeroVideo";
import { Container, CtaText, OpaBadge, PillButton, delay } from "./ui";

const STATS = [
  { value: 2, suffix: "", label: ["Filialen", "in Köln"] },
  { value: 100, suffix: "%", label: ["Halal-", "Fleisch"] },
  { value: 0, suffix: "", label: ["künstliche", "Zusätze"] },
];

export default function Hero() {
  return (
    <section className="bg-cream pb-16 pt-[120px] sm:pt-[170px] lg:pb-20 lg:pt-40 xl:min-h-[880px] xl:pt-44">
      <Container className="flex flex-col items-center gap-12 xl:flex-row xl:gap-16">
        <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-6 sm:gap-7">
          <span data-reveal="up" style={delay(150)} className="rounded-full bg-teal px-3.5 py-1.5 text-xs font-bold tracking-[0.08em] text-burgundy">
            FRANCHISE PROGRAMM
          </span>
          <h1 data-reveal="blur" style={delay(250)} className="font-script text-[38px] leading-none tracking-[-0.03em] text-burgundy min-[400px]:text-[40px] sm:text-[54px] xl:text-[56px]">
            Werde Teil der <br className="hidden xl:inline" />
            Oh My Greece Familie.
          </h1>
          <p data-reveal="up" style={delay(400)} className="max-w-[656px] text-base leading-[1.55] text-body sm:text-lg">
            Verwirkliche deinen Traum vom eigenen Restaurant, mit einem starken Partner an deiner Seite. Wir bringen
            griechischen Genuss in deine Stadt und du wirst Teil einer Marke, die Menschen lieben.
          </p>
          <div data-reveal="up" style={delay(520)} className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row sm:flex-wrap">
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

        {/* The design's teal circle, sun dot and stickers, framed around the 16:9 film. */}
        <div className="relative aspect-[4/3] w-full max-w-[760px] shrink-0 xl:w-[44%] xl:max-w-[560px]">
          <div data-reveal="zoom" data-parallax style={delay(200, -0.06)} className="absolute left-[15%] top-[2.5%] aspect-square w-[70%] rounded-full bg-teal" />
          <div data-reveal="pop" data-parallax style={delay(600, -0.18)} className="absolute left-[4%] top-[1%] aspect-square w-[13%] rounded-full bg-sun" />
          <div data-reveal="up" style={delay(300)} className="absolute inset-x-0 top-[12.5%] aspect-video">
            <HeroVideo />
          </div>
          <OpaBadge className="-left-[2%] top-[86%] max-sm:left-[2%]" d={900} />
          <div data-reveal="pop" style={delay(1050)} className="absolute right-[1%] top-[-1%] flex animate-float-slow flex-col gap-1.5 whitespace-nowrap rounded-[16px] bg-white px-3.5 py-2.5 shadow-[0_12px_32px_-4px_rgba(59,0,27,0.18)] sm:rounded-[20px] sm:px-[18px] sm:py-3.5">
            <p className="text-xs font-bold text-burgundy sm:text-[13px]">Täglich frisch</p>
            <p className="text-[10px] font-medium text-grey sm:text-[11px]">gebackenes Pita</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
