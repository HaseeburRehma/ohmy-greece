import CountUp from "./CountUp";
import HeroVideo from "./HeroVideo";
import { Container, CtaText, Lines, PillButton, delay } from "./ui";
import type { VideoSources } from "./HeroVideo";

export const STATS = [
  { value: 2, suffix: "", label: ["Filialen", "in Köln"] },
  { value: 100, suffix: "%", label: ["Halal-", "Fleisch"] },
  { value: 0, suffix: "", label: ["künstliche", "Zusätze"] },
];

export type HeroProps = {
  eyebrow?: string;
  title?: string;
  text?: string;
  secondaryLabel?: string;
  stats?: { value: number; suffix: string; label: string }[];
  video?: VideoSources;
};

/** Every prop is optional; without them the page renders the design copy below. */
export default function Hero({ eyebrow, title, text, secondaryLabel, stats, video }: HeroProps = {}) {
  const statList = stats?.map((s) => ({ ...s, label: s.label.split("\n") })) ?? STATS;
  return (
    <section className="bg-cream pb-16 pt-[120px] sm:pt-[170px] lg:pb-20 lg:pt-40 xl:min-h-[880px] xl:pt-44">
      <Container className="flex flex-col items-center gap-12 xl:flex-row xl:gap-16">
        <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-6 sm:gap-7">
          <span data-reveal="up" style={delay(150)} className="rounded-full bg-teal px-3.5 py-1.5 text-xs font-bold tracking-[0.08em] text-burgundy">
            {eyebrow ?? "FRANCHISE PROGRAMM"}
          </span>
          <h1 data-reveal="blur" style={delay(250)} className="font-script text-[38px] leading-none tracking-[-0.03em] text-burgundy min-[400px]:text-[40px] sm:text-[54px] xl:text-[56px]">
            {title ? (
              <Lines text={title} />
            ) : (
              <>
                Werde Teil der <br className="hidden xl:inline" />
                Oh My Greece Familie.
              </>
            )}
          </h1>
          <p data-reveal="up" style={delay(400)} className="max-w-[656px] text-base leading-[1.55] text-body sm:text-lg">
            {text ??
              "Verwirkliche deinen Traum vom eigenen Restaurant, mit einem starken Partner an deiner Seite. Wir bringen griechischen Genuss in deine Stadt und du wirst Teil einer Marke, die Menschen lieben."}
          </p>
          <div data-reveal="up" style={delay(520)} className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <PillButton href="#bewerbung">
              <CtaText />
            </PillButton>
            <PillButton href="#konzept" variant="outline">
              {secondaryLabel ?? "Konzept entdecken"}
            </PillButton>
          </div>
          <dl className="flex gap-10 pt-6 sm:pt-8">
            {statList.map((s, i) => (
              <div key={s.label[0]} data-reveal="up" style={delay(650 + i * 100)} className="flex flex-col-reverse gap-1">
                <dt className="text-[13px] font-medium leading-[1.35] text-grey">
                  {s.label[0]}
                  <br />
                  {s.label[1] ?? ""}
                </dt>
                <dd className="font-display text-[32px] font-bold leading-tight tracking-[-0.02em] text-burgundy sm:text-[36px]">
                  <CountUp to={s.value} suffix={s.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Taller than 16:9 so the film carries the hero; the speaker stays centred in the crop. */}
        <div data-reveal="up" style={delay(300)} className="aspect-[4/3] w-full max-w-[760px] shrink-0 xl:w-[46%] xl:max-w-[600px]">
          <HeroVideo sources={video} />
        </div>
      </Container>
    </section>
  );
}
