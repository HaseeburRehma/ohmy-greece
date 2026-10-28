"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent } from "react";
import {
  CAPITAL_OPTIONS,
  EXPERIENCE_OPTIONS,
  LIMITS,
  START_OPTIONS,
  TOTAL_STEPS,
  validateStep,
  type Application,
} from "@/lib/application";
import { OpaBadge, delay } from "./ui";

type Answers = Application;
type SendState = "idle" | "sending" | "error" | "rate_limited";

const TRUST = [
  { icon: "map-pin", label: "2 Filialen in Köln" },
  { icon: "badge-check", label: "100 % Halal" },
  { icon: "wheat", label: "Täglich frisches Pita" },
  { icon: "leaf", label: "Griechische Rezepte ohne Zusätze" },
];

/** One photo per step, plus the thank-you screen (index 0 = step 1, last = done). */
const SCENES = [
  { src: "/images/form-step-1.jpg", alt: "Oh My Greece Store mit Gyros-Theke" },
  { src: "/images/form-step-2.jpg", alt: "Gyros-Bowl mit Pommes, Salat und Tzatziki" },
  { src: "/images/form-step-3.jpg", alt: "Gyros wird frisch vom Spieß geschnitten" },
  { src: "/images/form-step-4.jpg", alt: "Frisches Pita-Brot wird mit Olivenöl bestrichen" },
  { src: "/images/form-step-5.jpg", alt: "Gyros-Pita in der Hand" },
  { src: "/images/form-done.jpg", alt: "Griechische Platte mit Gyros, Pita, Oliven und Feta" },
];

/** Pause after a choice so the selected state is seen before the next question slides in. */
const ADVANCE_DELAY = 380;

function ArrowRight({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={`size-5 shrink-0 ${back ? "rotate-180" : ""}`}>
      <path d="M4.2 10h11.6M10.8 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Trust() {
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {TRUST.map((t) => (
        <li
          key={t.label}
          className="flex items-center gap-2 rounded-full border border-line bg-white py-2 pl-3 pr-3.5 text-[13px] font-semibold text-burgundy"
        >
          <Image src={`/images/icons/${t.icon}.svg`} alt="" width={16} height={16} />
          {t.label}
        </li>
      ))}
    </ul>
  );
}

function BrandMark() {
  return (
    <span className="flex size-[88px] shrink-0 items-center justify-center rounded-full bg-white shadow-[0_12px_32px_0_rgba(59,0,27,0.18)] sm:size-[104px]">
      <Image src="/images/form-logo.png" alt="Make Gyros Great Again" width={88} height={88} className="size-[74px] sm:size-[88px]" />
    </span>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onCommit?: (e: FocusEvent<HTMLInputElement>) => void;
  placeholder: string;
  helper?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
  maxLength: number;
  error?: string;
};

function Field({ label, value, onChange, onCommit, placeholder, helper, type = "text", autoComplete, inputMode, maxLength, error }: FieldProps) {
  const id = useId();
  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-burgundy">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={helper || error ? `${id}-help` : undefined}
        className={`h-[58px] w-full rounded-[14px] border-[1.5px] bg-white px-[18px] text-base text-burgundy outline-none transition placeholder:text-placeholder focus:border-greek-blue focus:ring-4 focus:ring-greek-blue/15 ${error ? "border-[#c62828]" : "border-line"}`}
      />
      {(error || helper) && (
        <p id={`${id}-help`} className={`text-[13px] leading-normal ${error ? "text-[#c62828]" : "text-muted"}`}>
          {error ?? helper}
        </p>
      )}
    </div>
  );
}

type ChoicesProps = {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  /** Called when an option is picked deliberately (click, tap, Enter, Space), not when arrowing through. */
  onPick: (v: string) => void;
  labelledBy: string;
  invalid: boolean;
};

/** Single-choice list with radio semantics: arrow keys move, only the selected option is tabbable. */
function Choices({ options, value, onChange, onPick, labelledBy, invalid }: ChoicesProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = Math.max(0, options.indexOf(value));
  const move = (to: number) => {
    const i = (to + options.length) % options.length;
    onChange(options[i]);
    refs.current[i]?.focus();
  };
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} aria-invalid={invalid} className="grid w-full gap-3">
      {options.map((o, i) => {
        const active = value === o;
        return (
          <button
            key={o}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={i === current ? 0 : -1}
            onClick={() => onPick(o)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onPick(o);
                return;
              }
              const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
              if (!step) return;
              e.preventDefault();
              move(i + step);
            }}
            className={`flex min-h-16 items-center gap-3.5 rounded-[16px] p-[18px] text-left text-base font-semibold leading-[1.4] text-burgundy transition sm:p-5 sm:text-[17px] ${active ? "border-2 border-greek-blue bg-[#eaf2fc]" : "border-[1.5px] border-line bg-white hover:border-burgundy/30"}`}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full transition ${active ? "bg-greek-blue text-white" : "border-2 border-[#cfc6b8] bg-white"}`}
            >
              {active && <Check className="size-3.5" />}
            </span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function BackButton({ onClick, disabled, compact = false }: { onClick: () => void; disabled: boolean; compact?: boolean }) {
  if (compact)
    return (
      <button
        type="button"
        aria-label="Zurück"
        disabled={disabled}
        onClick={onClick}
        className="flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-burgundy text-burgundy transition hover:bg-burgundy hover:text-white sm:hidden"
      >
        <ArrowRight back />
      </button>
    );
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="hidden items-center justify-center gap-2 rounded-full border-[1.5px] border-burgundy py-[16.5px] pl-[22px] pr-[26px] font-semibold text-burgundy transition hover:bg-burgundy hover:text-white sm:flex"
    >
      <ArrowRight back />
      Zurück
    </button>
  );
}

export default function ApplicationForm({ onScene }: { onScene?: (scene: number) => void }) {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [sendState, setSendState] = useState<SendState>("idle");
  const [honeypot, setHoneypot] = useState("");
  const [a, setA] = useState<Answers>({
    city: "",
    capital: "",
    experience: "",
    start: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    consent: false,
  });
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((prev) => ({ ...prev, [k]: v }));
  const startedAt = useRef(0);
  const questionId = useId();
  const headingRef = useRef<HTMLParagraphElement>(null);
  const firstRender = useRef(true);
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    startedAt.current = Date.now();
    return () => clearTimeout(advanceTimer.current);
  }, []);

  useEffect(() => {
    onScene?.(done ? SCENES.length - 1 : step - 1);
  }, [step, done, onScene]);

  // Move focus to the new question so keyboard and screen-reader users follow the step change.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const errors = validateStep(step, a);
  const valid = Object.keys(errors).length === 0;
  const err = (k: keyof Answers) => (showErrors ? errors[k] : undefined);

  function goTo(to: number) {
    clearTimeout(advanceTimer.current);
    setShowErrors(false);
    setSendState("idle");
    setStep(to);
  }

  /** Auto-advance: picking an answer moves on by itself, unless the user went elsewhere meanwhile. */
  function pick<K extends "capital" | "experience" | "start">(k: K, v: string) {
    set(k, v);
    setShowErrors(false);
    clearTimeout(advanceTimer.current);
    const from = step;
    advanceTimer.current = setTimeout(() => setStep((s) => (s === from ? s + 1 : s)), ADVANCE_DELAY);
  }

  /** Step 1: once a valid city is entered and the field is left, continue. Clicking a form button handles itself. */
  function commitCity(e: FocusEvent<HTMLInputElement>) {
    // Switching tabs/apps also blurs the field; that is not "done typing".
    if (!document.hasFocus()) return;
    const target = e.relatedTarget as HTMLElement | null;
    if (target?.closest("button") && e.currentTarget.form?.contains(target)) return;
    if (Object.keys(validateStep(1, a)).length === 0) goTo(2);
  }

  async function submit() {
    setSendState("sending");
    try {
      const res = await fetch("/api/bewerbung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...a, website: honeypot, elapsedMs: Date.now() - startedAt.current }),
      });
      if (res.ok) {
        // Meta Pixel "Lead" per the brief; a no-op until the pixel (behind cookie consent) is on the page.
        (window as Window & { fbq?: (...args: unknown[]) => void }).fbq?.("track", "Lead", {
          content_name: "Franchise-Bewerbung",
        });
        return setDone(true);
      }
      setSendState(res.status === 429 ? "rate_limited" : "error");
    } catch {
      setSendState("error");
    }
  }

  function next(e: FormEvent) {
    e.preventDefault();
    if (sendState === "sending") return;
    if (!valid) return setShowErrors(true);
    if (step < TOTAL_STEPS) goTo(step + 1);
    else void submit();
  }

  const back = () => goTo(step - 1);

  const questions: Record<number, string> = {
    1: "In welcher Stadt / Region möchtest du eröffnen?",
    2: "Welches Eigenkapital kannst du für den Start einbringen?",
    3: "Hast du bereits Erfahrung in der Gastronomie?",
    4: "Wann möchtest du starten?",
    5: "Fast geschafft! Wohin dürfen wir dir die Infos schicken?",
  };

  const choiceError = (k: keyof Answers) =>
    err(k) && (
      <p role="alert" className="text-[13px] text-[#c62828]">
        {err(k)}
      </p>
    );

  const card =
    "flex w-full max-w-[616px] flex-col gap-7 rounded-[24px] border border-line bg-white px-5 pb-8 pt-7 shadow-[0_24px_64px_0_rgba(59,0,27,0.08)] sm:rounded-[32px] sm:px-12 sm:pb-12 sm:pt-11";

  if (done) {
    const photo = SCENES[SCENES.length - 1];
    return (
      <div className={card}>
        {/* The section photo is hidden on phones, so the thank-you card brings its own (Figma: Mobile / Danke). */}
        <div className="relative -mx-1 -mt-1 h-[200px] overflow-hidden rounded-[20px] sm:hidden">
          <Image src={photo.src} alt={photo.alt} fill sizes="100vw" className="object-cover" />
        </div>
        <div className="flex flex-col items-center gap-5 text-center sm:py-6" role="status">
          <BrandMark />
          <span className="flex size-[60px] items-center justify-center rounded-full bg-greek-blue text-white sm:size-[72px]">
            <Check className="size-[30px] sm:size-9" />
          </span>
          <p className="font-[family-name:var(--font-kaushan)] text-[52px] leading-[1.1] text-burgundy sm:text-[64px]">Danke!</p>
          <p className="text-base leading-[1.55] text-body sm:text-[19px]">
            Wir melden uns innerhalb von 24 Stunden bei dir. Prüf schon mal dein Postfach.
          </p>
          <Trust />
        </div>
      </div>
    );
  }

  return (
    <div data-reveal="up" style={delay(150)} className={card}>
      <div className="flex w-full items-center gap-3">
        {step > 1 && <BackButton compact onClick={back} disabled={sendState === "sending"} />}
        <div className="flex flex-1 flex-col gap-2.5">
          <p className="text-[13px] font-semibold text-burgundy">{`Schritt ${step} von ${TOTAL_STEPS}`}</p>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-track"
            role="progressbar"
            aria-label="Fortschritt"
            aria-valuemin={0}
            aria-valuemax={TOTAL_STEPS}
            aria-valuenow={step}
          >
            <div
              className="h-full rounded-full bg-greek-blue transition-[width] duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-4 text-center">
        <BrandMark />
        <h2 className="font-[family-name:var(--font-kaushan)] text-[32px] leading-[1.1] tracking-[-0.01em] text-burgundy sm:text-[44px]">
          Werde Teil von Deutschlands beliebtestem Griechen
        </h2>
        <p className="text-base leading-[1.55] text-body sm:text-[17px]">
          Eröffne deinen eigenen Oh My Greece – mit fertigem Konzept, 100 % Halal-Qualität und griechischen
          Original-Rezepten.
        </p>
        <Trust />
      </div>

      <div className="h-px w-full bg-line" />

      <form onSubmit={next} noValidate className="relative flex w-full flex-col gap-7">
        <div className="flex w-full flex-col gap-5">
          <p
            id={questionId}
            ref={headingRef}
            tabIndex={-1}
            aria-live="polite"
            className="font-display text-2xl font-bold leading-[1.2] tracking-[-0.01em] text-burgundy outline-none sm:text-[28px]"
          >
            {questions[step]}
          </p>

          {/* Honeypot: hidden from people and assistive tech, bots fill it in. */}
          <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </label>
          </div>

          {step === 1 && (
            <Field
              label="Stadt / PLZ"
              value={a.city}
              onChange={(v) => set("city", v)}
              onCommit={commitCity}
              placeholder="z. B. Düsseldorf oder 40210"
              helper="Wir eröffnen bevorzugt in Städten ohne bestehenden Standort."
              autoComplete="address-level2"
              maxLength={LIMITS.city}
              error={err("city")}
            />
          )}
          {step === 2 && (
            <>
              <Choices
                options={CAPITAL_OPTIONS}
                labelledBy={questionId}
                invalid={!!err("capital")}
                value={a.capital}
                onChange={(v) => set("capital", v)}
                onPick={(v) => pick("capital", v)}
              />
              {choiceError("capital")}
            </>
          )}
          {step === 3 && (
            <>
              <Choices
                options={EXPERIENCE_OPTIONS}
                labelledBy={questionId}
                invalid={!!err("experience")}
                value={a.experience}
                onChange={(v) => set("experience", v)}
                onPick={(v) => pick("experience", v)}
              />
              {choiceError("experience")}
            </>
          )}
          {step === 4 && (
            <>
              <Choices
                options={START_OPTIONS}
                labelledBy={questionId}
                invalid={!!err("start")}
                value={a.start}
                onChange={(v) => set("start", v)}
                onPick={(v) => pick("start", v)}
              />
              {choiceError("start")}
            </>
          )}
          {step === 5 && (
            <div className="flex w-full flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Vorname *"
                  value={a.firstName}
                  onChange={(v) => set("firstName", v)}
                  placeholder="Max"
                  autoComplete="given-name"
                  maxLength={LIMITS.firstName}
                  error={err("firstName")}
                />
                <Field
                  label="Nachname *"
                  value={a.lastName}
                  onChange={(v) => set("lastName", v)}
                  placeholder="Mustermann"
                  autoComplete="family-name"
                  maxLength={LIMITS.lastName}
                  error={err("lastName")}
                />
              </div>
              <Field
                label="E-Mail *"
                type="email"
                value={a.email}
                onChange={(v) => set("email", v)}
                placeholder="max@beispiel.de"
                autoComplete="email"
                inputMode="email"
                maxLength={LIMITS.email}
                error={err("email")}
              />
              <Field
                label="Telefon / WhatsApp *"
                type="tel"
                value={a.phone}
                onChange={(v) => set("phone", v)}
                placeholder="+49 170 1234567"
                autoComplete="tel"
                inputMode="tel"
                maxLength={LIMITS.phone}
                error={err("phone")}
              />
              <label className="flex cursor-pointer items-start gap-3 text-left text-sm leading-normal text-body">
                <input
                  type="checkbox"
                  checked={a.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                  aria-invalid={!!err("consent")}
                  aria-describedby={err("consent") ? "consent-error" : undefined}
                  className="mt-px size-[22px] shrink-0 cursor-pointer rounded-[6px] accent-greek-blue"
                />
                <span className={err("consent") ? "text-[#c62828]" : ""}>
                  Ich stimme zu, dass Oh My Greece mich zum Franchise kontaktiert.{" "}
                  <a
                    href="https://www.ohmygreece.de/datenschutz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-greek-blue underline"
                  >
                    Datenschutz
                  </a>
                </span>
              </label>
              {err("consent") && (
                <p id="consent-error" role="alert" className="-mt-2 pl-[34px] text-[13px] text-[#c62828]">
                  {err("consent")}
                </p>
              )}
            </div>
          )}
        </div>

        {(sendState === "error" || sendState === "rate_limited") && (
          <p role="alert" className="rounded-[14px] bg-[#fdecea] px-4 py-3 text-sm leading-normal text-[#8e1b1b]">
            {sendState === "rate_limited"
              ? "Zu viele Anfragen in kurzer Zeit. Bitte versuche es in ein paar Minuten erneut."
              : "Das hat leider nicht geklappt. Bitte versuche es erneut oder schreib uns direkt an "}
            {sendState === "error" && (
              <a href="mailto:info@ohmygreece.de" className="font-semibold underline">
                info@ohmygreece.de
              </a>
            )}
          </p>
        )}

        {/* Figma: steps 2–4 put Zurück beside Weiter; the last step stacks the CTA over a centred Zurück. */}
        <div className={`flex w-full items-center gap-3 ${step === TOTAL_STEPS ? "flex-col" : ""}`}>
          {step > 1 && step < TOTAL_STEPS && <BackButton onClick={back} disabled={sendState === "sending"} />}
          <button
            type="submit"
            disabled={sendState === "sending"}
            aria-busy={sendState === "sending"}
            className={`flex items-center justify-center gap-2.5 rounded-full bg-sun py-[18px] pl-[30px] pr-[26px] font-bold text-burgundy transition hover:bg-[#ffe100] hover:shadow-[0_10px_24px_-8px_rgba(59,0,27,0.35)] disabled:cursor-wait disabled:opacity-70 ${step === TOTAL_STEPS ? "w-full max-sm:px-5 max-sm:text-sm" : "flex-1"}`}
          >
            <span className="sm:whitespace-nowrap">
              {sendState === "sending"
                ? "Wird gesendet…"
                : step === TOTAL_STEPS
                  ? "Kostenlos mehr erfahren – jetzt eintragen"
                  : "Weiter"}
            </span>
            {sendState === "sending" ? (
              <span aria-hidden className="size-5 shrink-0 animate-spin rounded-full border-2 border-burgundy/30 border-t-burgundy" />
            ) : (
              <ArrowRight />
            )}
          </button>
          {step === TOTAL_STEPS && <BackButton onClick={back} disabled={sendState === "sending"} />}
        </div>
      </form>
    </div>
  );
}

export function ApplicationSection() {
  const [scene, setScene] = useState(0);
  return (
    <section id="bewerbung" className="scroll-mt-6 bg-ivory py-20 sm:py-[120px]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-14 px-5 sm:px-8 lg:flex-row lg:items-start lg:justify-center lg:gap-16 lg:px-12 xl:px-20">
        {/* 560×720 composition, hidden on phones so the form comes first */}
        <div className="relative hidden aspect-[560/720] w-full max-w-[560px] shrink-0 sm:block lg:w-[400px] xl:w-[560px]">
          <div data-reveal="zoom" data-parallax style={delay(0, -0.06)} className="absolute left-[3.57%] top-[20.83%] h-[72.22%] w-[92.86%] rounded-full bg-teal" />
          <div data-reveal="pop" data-parallax style={delay(450, -0.16)} className="absolute left-[78.57%] top-[2.78%] h-[15.28%] w-[19.64%] rounded-full bg-sun" />
          <div data-reveal="photo" style={delay(120)} className="absolute left-[8.93%] top-[5.56%] h-[88.89%] w-[82.14%] overflow-hidden rounded-[32px] shadow-[0_24px_48px_0_rgba(59,0,27,0.18)]">
            {/* All step photos are stacked and cross-fade, so switching steps never waits for a download. */}
            {SCENES.map((s, i) => (
              <div
                key={s.src}
                aria-hidden={i !== scene}
                className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out ${i === scene ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"}`}
              >
                <Image src={s.src} alt={i === scene ? s.alt : ""} fill sizes="(min-width: 1280px) 460px, 60vw" className="object-cover" />
              </div>
            ))}
          </div>
          <OpaBadge className="left-0 top-[83.33%]" d={650} />
        </div>
        <ApplicationForm onScene={setScene} />
      </div>
    </section>
  );
}
