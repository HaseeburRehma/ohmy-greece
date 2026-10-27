import Image from "next/image";
import { Container, Eyebrow, delay } from "./ui";

export default function DreamStatement() {
  return (
    <section id="konzept" className="scroll-mt-6 bg-sun py-20 sm:py-[120px]">
      <Container className="flex flex-col items-center gap-6 text-center sm:gap-7">
        <Image
          data-reveal="pop"
          src="/images/make-gyros-badge.png"
          alt="Make Gyros Great Again"
          width={160}
          height={160}
          className="size-[120px] transition-transform duration-700 hover:rotate-[20deg] sm:size-[160px]"
        />
        <Eyebrow tone="teal" d={120}>DEIN TRAUM, UNSER KONZEPT</Eyebrow>
        <h2 data-reveal="blur" style={delay(220)} className="font-script text-[38px] leading-[1.05] tracking-[-0.03em] text-burgundy sm:text-5xl lg:text-[60px]">
          Träumst du davon,
          <br />
          dein eigener Chef zu sein?
        </h2>
        <p data-reveal="up" style={delay(340)} className="max-w-[840px] text-base leading-[1.65] text-burgundy/50 sm:text-[19px]">
          Mach den Schritt in die Selbstständigkeit, ohne die üblichen Hürden. Mit Oh My Greece startest du nicht bei
          null, sondern mit einem fertigen Konzept, einer geliebten Marke und einem Team, das dich von Tag eins begleitet.
          Griechischer Genuss, deutsche Verlässlichkeit.
        </p>
        <p data-reveal="up" style={delay(460)} className="flex items-center gap-3.5 pt-4 font-display text-lg font-semibold tracking-[-0.01em] text-teal">
          <span className="size-2 rounded-full bg-teal" />
          Make Gyros Great Again.
          <span className="size-2 rounded-full bg-teal" />
        </p>
      </Container>
    </section>
  );
}
