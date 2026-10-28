// Source of the Framer code component "OMGFranchise" (bundled by scripts/build-framer.mjs).
// It renders the same sections as the Vercel page, with every text, list and photo editable
// in Framer's properties panel. Framer keeps its own nav and footer around it.
import { ControlType, RenderTarget } from "framer";
import { useEffect, useRef, type ReactNode } from "react";
import { ApplicationSection } from "@/components/ApplicationForm";
import Benefits, { BENEFITS } from "@/components/Benefits";
import DreamStatement from "@/components/DreamStatement";
import FamilyPartnership from "@/components/FamilyPartnership";
import Faq, { FAQS } from "@/components/Faq";
import Hero, { STATS } from "@/components/Hero";
import Process, { STEPS } from "@/components/Process";
import Quality, { POINTS } from "@/components/Quality";
import { ASSET_BASE } from "./config";
// Tailwind output for these components, scoped to .omg (scripts/build-framer.mjs).
import CSS from "./omg-css.generated";

const DEFAULTS = {
  hero: {
    eyebrow: "FRANCHISE PROGRAMM",
    title: "Werde Teil der\nOh My Greece Familie.",
    text: "Verwirkliche deinen Traum vom eigenen Restaurant, mit einem starken Partner an deiner Seite. Wir bringen griechischen Genuss in deine Stadt und du wirst Teil einer Marke, die Menschen lieben.",
    secondaryLabel: "Konzept entdecken",
    stats: STATS.map((s) => ({ value: s.value, suffix: s.suffix, label: s.label.join("\n") })),
  },
  dream: {
    eyebrow: "DEIN TRAUM, UNSER KONZEPT",
    title: "Träumst du davon,\ndein eigener Chef zu sein?",
    text: "Mach den Schritt in die Selbstständigkeit, ohne die üblichen Hürden. Mit Oh My Greece startest du nicht bei null, sondern mit einem fertigen Konzept, einer geliebten Marke und einem Team, das dich von Tag eins begleitet. Griechischer Genuss, deutsche Verlässlichkeit.",
    tagline: "Make Gyros Great Again.",
  },
  benefits: {
    eyebrow: "WAS UNS BESONDERS MACHT",
    title: "Sechs gute Gründe für\nOh My Greece als Partner.",
    text: "Wir geben dir alles, was du für den erfolgreichen Start brauchst: vom ersten Konzeptgespräch bis zur Eröffnung deines Stores.",
    items: BENEFITS,
  },
  quality: {
    eyebrow: "QUALITÄT & FRISCHE",
    title: "Echte Zutaten. Echtes Handwerk. Echtes Griechenland.",
    text: "Guter griechischer Genuss fängt bei den Zutaten an. Deshalb kochen wir nach traditionellen griechischen Rezepten, backen unser Pita jeden Tag frisch und verzichten komplett auf künstliche Zusätze.",
    points: POINTS.map(({ title, text }) => ({ title, text })),
    badgeLabel: "Halal-Fleisch",
  },
  family: {
    eyebrow: "MEHR ALS EIN PARTNER",
    title: "Bei uns wirst du Teil der Oh My Greece Familie.",
    text: "Wir verstehen Franchise anders. Du bekommst keinen Vertrag und wirst dann allein gelassen. Wir sind in der Eröffnungsphase vor Ort, helfen beim Recruiting deines Teams und teilen alles, was wir gelernt haben. Dein Erfolg ist unser Erfolg.",
    note: "Unverbindlich, Antwort innerhalb von 24 Stunden",
  },
  process: {
    eyebrow: "DER WEG ZU DEINEM STORE",
    title: "In vier Schritten zur Eröffnung.",
    text: "Von der ersten Idee bis zum Tag der Eröffnung: So begleiten wir dich auf dem Weg zu deinem eigenen Oh My Greece Store.",
    steps: STEPS,
  },
  faq: {
    eyebrow: "HÄUFIG GESTELLTE FRAGEN",
    title: "Du hast Fragen? Wir haben Antworten.",
    items: FAQS,
    ctaTitle: "Noch Fragen offen?",
    ctaText: "Schreib uns, wir antworten innerhalb von 24 Stunden.",
  },
};

type Dict = Record<string, unknown>;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Values still equal to the design copy are dropped, so the section renders its hand-tuned
 * responsive line breaks; only text someone changed in Framer is passed through.
 */
function edited<T extends Dict>(values: Dict | undefined, defaults: Dict): Partial<T> {
  const out: Dict = {};
  for (const [key, value] of Object.entries(values ?? {})) {
    if (value === undefined || value === "" || same(value, defaults[key])) continue;
    out[key] = value;
  }
  return out as Partial<T>;
}

const imageUrl = (img: unknown) => (img && typeof img === "object" && "src" in img ? String((img as { src: string }).src) : undefined);
const fileUrl = (file: unknown) => (typeof file === "string" && file ? file : undefined);

/** Scroll reveal + scoped styles. Reveals are skipped on the Framer canvas so editors see everything. */
function Shell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || RenderTarget.current() === RenderTarget.canvas) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pending = [...root.querySelectorAll<HTMLElement>("[data-reveal]")];
    let frame = 0;
    const check = () => {
      frame = 0;
      const vh = innerHeight;
      const atBottom = scrollY + vh >= document.documentElement.scrollHeight - 4;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top > (atBottom ? vh : vh * 0.88)) return true;
        el.classList.add("is-visible");
        return false;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    // Hide and reveal in the same frame: what is already on screen never flickers.
    root.classList.add("reveal-ready");
    check();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="omg">
      <style>{CSS}</style>
      {children}
    </div>
  );
}

type Props = {
  hero?: Dict;
  dream?: Dict;
  benefits?: Dict;
  quality?: Dict;
  family?: Dict;
  process?: Dict;
  faq?: Dict;
  media?: Dict;
};

// The default export, its layout annotations and addPropertyControls are appended by the build
// script: Framer reads them from the final file, and bundling would drop the comments.
export function OMGFranchise({ hero, dream, benefits, quality, family, process, faq, media }: Props) {
  const m = media ?? {};
  return (
    <Shell>
      <Hero
        {...edited(hero, DEFAULTS.hero)}
        video={{
          mobile: fileUrl(m.videoMobile) ?? `${ASSET_BASE}/videos/franchise-video-720.mp4`,
          desktop: fileUrl(m.videoDesktop) ?? `${ASSET_BASE}/videos/franchise-video-1080.mp4`,
          poster: imageUrl(m.videoPoster) ?? `${ASSET_BASE}/videos/franchise-video-poster.jpg`,
        }}
      />
      <DreamStatement {...edited(dream, DEFAULTS.dream)} badge={imageUrl(m.badge)} />
      <Benefits {...edited(benefits, DEFAULTS.benefits)} />
      <Quality
        {...edited(quality, DEFAULTS.quality)}
        images={{ big: imageUrl(m.qualityBig), small1: imageUrl(m.qualitySmall1), small2: imageUrl(m.qualitySmall2) }}
      />
      <FamilyPartnership {...edited(family, DEFAULTS.family)} image={imageUrl(m.familyPhoto)} />
      <Process {...edited(process, DEFAULTS.process)} />
      <ApplicationSection endpoint={`${ASSET_BASE}/api/bewerbung`} />
      <Faq {...edited(faq, DEFAULTS.faq)} />
    </Shell>
  );
}

const text = (title: string, defaultValue: string, long = false) => ({
  type: ControlType.String,
  title,
  defaultValue,
  displayTextArea: long || defaultValue.includes("\n"),
});

const cards = (title: string, defaultValue: { title: string; text: string }[], item = "Karte") => ({
  type: ControlType.Array,
  title,
  defaultValue,
  control: {
    type: ControlType.Object,
    title: item,
    controls: { title: text("Titel", ""), text: text("Text", "", true) },
  },
});

export const CONTROLS = {
  hero: {
    type: ControlType.Object,
    title: "Hero",
    controls: {
      eyebrow: text("Label", DEFAULTS.hero.eyebrow),
      title: text("Überschrift", DEFAULTS.hero.title),
      text: text("Text", DEFAULTS.hero.text, true),
      secondaryLabel: text("Zweiter Button", DEFAULTS.hero.secondaryLabel),
      stats: {
        type: ControlType.Array,
        title: "Zahlen",
        defaultValue: DEFAULTS.hero.stats,
        maxCount: 4,
        control: {
          type: ControlType.Object,
          controls: {
            value: { type: ControlType.Number, title: "Zahl", defaultValue: 0, min: 0, max: 100000 },
            suffix: text("Zusatz", ""),
            label: text("Beschriftung", "", true),
          },
        },
      },
    },
  },
  dream: {
    type: ControlType.Object,
    title: "Traum",
    controls: {
      eyebrow: text("Label", DEFAULTS.dream.eyebrow),
      title: text("Überschrift", DEFAULTS.dream.title),
      text: text("Text", DEFAULTS.dream.text, true),
      tagline: text("Slogan", DEFAULTS.dream.tagline),
    },
  },
  benefits: {
    type: ControlType.Object,
    title: "Vorteile",
    controls: {
      eyebrow: text("Label", DEFAULTS.benefits.eyebrow),
      title: text("Überschrift", DEFAULTS.benefits.title),
      text: text("Text", DEFAULTS.benefits.text, true),
      items: cards("Karten", DEFAULTS.benefits.items),
    },
  },
  quality: {
    type: ControlType.Object,
    title: "Qualität",
    controls: {
      eyebrow: text("Label", DEFAULTS.quality.eyebrow),
      title: text("Überschrift", DEFAULTS.quality.title),
      text: text("Text", DEFAULTS.quality.text, true),
      points: cards("Punkte", DEFAULTS.quality.points, "Punkt"),
      badgeLabel: text("Badge", DEFAULTS.quality.badgeLabel),
    },
  },
  family: {
    type: ControlType.Object,
    title: "Familie",
    controls: {
      eyebrow: text("Label", DEFAULTS.family.eyebrow),
      title: text("Überschrift", DEFAULTS.family.title),
      text: text("Text", DEFAULTS.family.text, true),
      note: text("Hinweis", DEFAULTS.family.note),
    },
  },
  process: {
    type: ControlType.Object,
    title: "Ablauf",
    controls: {
      eyebrow: text("Label", DEFAULTS.process.eyebrow),
      title: text("Überschrift", DEFAULTS.process.title),
      text: text("Text", DEFAULTS.process.text, true),
      steps: cards("Schritte", DEFAULTS.process.steps, "Schritt"),
    },
  },
  faq: {
    type: ControlType.Object,
    title: "FAQ",
    controls: {
      eyebrow: text("Label", DEFAULTS.faq.eyebrow),
      title: text("Überschrift", DEFAULTS.faq.title),
      items: {
        type: ControlType.Array,
        title: "Fragen",
        defaultValue: DEFAULTS.faq.items,
        control: {
          type: ControlType.Object,
          title: "Frage",
          controls: { q: text("Frage", ""), a: text("Antwort", "", true) },
        },
      },
      ctaTitle: text("Box Titel", DEFAULTS.faq.ctaTitle),
      ctaText: text("Box Text", DEFAULTS.faq.ctaText),
    },
  },
  media: {
    type: ControlType.Object,
    title: "Bilder & Video",
    description: "Leer lassen = Bilder und Film der Franchise-Seite.",
    controls: {
      videoDesktop: { type: ControlType.File, title: "Film (Desktop)", allowedFileTypes: ["mp4"] },
      videoMobile: { type: ControlType.File, title: "Film (Handy)", allowedFileTypes: ["mp4"] },
      videoPoster: { type: ControlType.ResponsiveImage, title: "Film-Vorschaubild" },
      badge: { type: ControlType.ResponsiveImage, title: "Badge" },
      qualityBig: { type: ControlType.ResponsiveImage, title: "Qualität groß" },
      qualitySmall1: { type: ControlType.ResponsiveImage, title: "Qualität klein 1" },
      qualitySmall2: { type: ControlType.ResponsiveImage, title: "Qualität klein 2" },
      familyPhoto: { type: ControlType.ResponsiveImage, title: "Familie Foto" },
    },
  },
};
