import Image from "next/image";
import { Container, CtaText, Eyebrow, Lines, PillButton, delay } from "./ui";

export type FamilyPartnershipProps = { eyebrow?: string; title?: string; text?: string; note?: string; image?: string };

export default function FamilyPartnership({ eyebrow, title, text, note, image }: FamilyPartnershipProps = {}) {
  return (
    <section className="bg-teal py-20 sm:py-[100px]">
      <Container className="flex flex-col items-center gap-14 lg:flex-row lg:gap-16">
        {/* 520×540 composition: yellow card behind offset photo + rotated badge */}
        <div className="relative aspect-[520/540] w-full max-w-[520px] shrink-0 lg:w-[440px] xl:w-[520px]">
          <div data-reveal="zoom" data-parallax style={delay(0, -0.05)} className="absolute left-[11.54%] top-[5.56%] h-[88.89%] w-[84.62%] rounded-[20px] bg-sun sm:rounded-[28px]" />
          <div data-reveal="photo" style={delay(150)} className="absolute left-[5.77%] top-[11.11%] h-[88.89%] w-[84.62%] overflow-hidden rounded-[20px] sm:rounded-[28px]">
            <Image
              src={image ?? "/images/family-photo.jpg"}
              alt="Das Oh My Greece Team"
              fill
              sizes="(min-width: 1280px) 440px, 80vw"
              className="object-cover"
            />
          </div>
          <div data-reveal="pop" style={delay(650)} className="absolute left-[60.87%] top-0 flex animate-sway rotate-6 flex-col items-center rounded-full bg-white px-4 py-2.5 font-bold leading-normal text-burgundy shadow-[0_10px_30px_-4px_rgba(59,0,27,0.18)] sm:px-[22px] sm:py-3.5">
            <span className="font-display text-sm tracking-[0.04em] sm:text-lg">ΦΙΛΟΣ</span>
            <span className="text-[9px] tracking-[0.02em] sm:text-[10px]">= Freund</span>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col items-start gap-6 sm:gap-7">
          <Eyebrow>{eyebrow ?? "MEHR ALS EIN PARTNER"}</Eyebrow>
          <h2 data-reveal="blur" style={delay(100)} className="font-script text-[36px] leading-[1.05] tracking-[-0.02em] text-burgundy sm:text-5xl xl:text-[47px]">
            {title ? (
              <Lines text={title} />
            ) : (
              <>
                Bei uns wirst du Teil der Oh My Greece <br className="hidden xl:inline" />
                Familie.
              </>
            )}
          </h2>
          <p data-reveal="up" style={delay(200)} className="text-base leading-[1.6] text-burgundy sm:text-lg">
            {text ??
              "Wir verstehen Franchise anders. Du bekommst keinen Vertrag und wirst dann allein gelassen. Wir sind in der Eröffnungsphase vor Ort, helfen beim Recruiting deines Teams und teilen alles, was wir gelernt haben. Dein Erfolg ist unser Erfolg."}
          </p>
          <div data-reveal="up" style={delay(300)} className="flex w-full flex-col items-start gap-4 pt-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center xl:flex-nowrap">
            <PillButton href="#bewerbung" variant="burgundy" className="w-full sm:w-auto">
              <CtaText />
            </PillButton>
            <p className="text-[13px] font-medium text-burgundy xl:whitespace-nowrap">{note ?? "Unverbindlich, Antwort innerhalb von 24 Stunden"}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
