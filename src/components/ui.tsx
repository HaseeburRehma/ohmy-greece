import type { CSSProperties, ReactNode } from "react";

/**
 * Inline style for motion: `ms` is the [data-reveal] delay, `parallax` the
 * scroll drift factor for [data-parallax] (negative = moves up faster).
 */
export const delay = (ms: number, parallax?: number) =>
  ({ "--d": `${ms}ms`, ...(parallax !== undefined && { "--p": parallax }) }) as CSSProperties;

export const CTA_LABEL = "Kostenlos mehr erfahren – jetzt eintragen";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-20 ${className}`}>{children}</div>;
}

type EyebrowProps = { children: ReactNode; tone?: "burgundy" | "teal"; className?: string; d?: number };

/** Short rule + uppercase label used above every section headline. */
export function Eyebrow({ children, tone = "burgundy", className = "", d = 0 }: EyebrowProps) {
  const color = tone === "teal" ? "text-teal" : "text-burgundy";
  const bar = tone === "teal" ? "bg-teal" : "bg-burgundy";
  return (
    <div data-reveal="up" style={delay(d)} className={`flex items-center gap-3 ${className}`}>
      <span className={`h-0.5 w-7 shrink-0 origin-left ${bar}`} />
      <p className={`text-xs font-bold tracking-[0.08em] ${color}`}>{children}</p>
    </div>
  );
}

type PillButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "sun" | "burgundy" | "outline";
  size?: "lg" | "md";
  className?: string;
};

export function PillButton({ href, children, variant = "sun", size = "lg", className = "" }: PillButtonProps) {
  const variants = {
    sun: "bg-sun text-burgundy font-bold hover:bg-[#ffe100] hover:shadow-[0_10px_24px_-8px_rgba(59,0,27,0.35)]",
    burgundy: "bg-burgundy text-white font-bold hover:bg-[#52002a] hover:shadow-[0_10px_24px_-8px_rgba(59,0,27,0.5)]",
    outline: "border-[1.5px] border-burgundy text-burgundy font-semibold hover:bg-burgundy hover:text-white",
  };
  const sizes = {
    lg: "px-4 py-4 text-[14px] tracking-[-0.01em] min-[400px]:px-5 sm:px-7 sm:py-[18px] sm:text-base sm:tracking-normal",
    md: "px-6 py-3.5 text-[15px]",
  };
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full text-center leading-tight sm:whitespace-nowrap transition duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </a>
  );
}

export function CtaText() {
  // Non-breaking space keeps the arrow glued to the last word when the label wraps on phones.
  return <span>{`${CTA_LABEL}  →`}</span>;
}

/** Yellow "OPA! / MAKE GYROS" sticker that overlaps the photo frames. */
export function OpaBadge({ className = "", d = 700 }: { className?: string; d?: number }) {
  return (
    <div
      data-reveal="pop"
      style={delay(d)}
      className={`absolute flex animate-float h-[52px] w-[106px] flex-col items-center justify-center rounded-full border-[3px] border-burgundy bg-sun font-bold leading-none text-burgundy sm:h-[71px] sm:w-[145px] sm:border-4 ${className}`}
    >
      <span className="font-display text-[19px] sm:text-[26px]">OPA!</span>
      <span className="mt-0.5 text-[6px] tracking-[0.06em] sm:mt-1 sm:text-[8px]">MAKE GYROS</span>
    </div>
  );
}

/** Text edited in Framer: each line break in the string becomes a <br>. */
export function Lines({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}
