"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
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


function ArrowRight({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={`size-5 ${back ? "rotate-180" : ""}`}>
      <path d="M4.2 10h11.6M10.8 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  helper?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
  maxLength: number;
  error?: string;
};

function Field({ label, value, onChange, placeholder, helper, type = "text", autoComplete, inputMode, maxLength, error }: FieldProps) {
  const id = useId();
  return (
    <div className="flex w-full flex-col gap-2">
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

type ChoicesProps = { options: readonly string[]; value: string; onChange: (v: string) => void; labelledBy: string; invalid: boolean };

/** Single-choice list with radio semantics: arrow keys move, only the selected option is tabbable. */
function Choices({ options, value, onChange, labelledBy, invalid }: ChoicesProps) {
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
            onClick={() => onChange(o)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Select and continue, like Enter in the text steps (after React applied the choice).
                e.preventDefault();
                onChange(o);
                const form = e.currentTarget.form;
                setTimeout(() => form?.requestSubmit());
                return;
              }
              const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
              if (!step) return;
              e.preventDefault();
              move(i + step);
            }}
            className={`flex min-h-[58px] items-center gap-3 rounded-[14px] border-[1.5px] px-[18px] text-left text-base transition ${active ? "border-greek-blue bg-greek-blue/5 font-semibold text-burgundy ring-4 ring-greek-blue/15" : "border-line bg-white text-burgundy hover:border-burgundy/30"}`}
          >
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${active ? "border-greek-blue" : "border-line"}`}
            >
              {active && <span className="size-2.5 rounded-full bg-greek-blue" />}
            </span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

export default function ApplicationForm() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [sendState, setSendState] = useState<SendState>("idle");
  const [honeypot, setHoneypot] = useState("");
  const [a, setA] = useState<Answers>({ city: "", experience: "", start: "", name: "", email: "", phone: "", consent: false });
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((prev) => ({ ...prev, [k]: v }));
  const startedAt = useRef(0);
  const questionId = useId();
  const headingRef = useRef<HTMLParagraphElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

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

  async function submit() {
    setSendState("sending");
    try {
      const res = await fetch("/api/bewerbung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...a, website: honeypot, elapsedMs: Date.now() - startedAt.current }),
      });
      if (res.ok) return setDone(true);
      setSendState(res.status === 429 ? "rate_limited" : "error");
    } catch {
      setSendState("error");
    }
  }

  function next(e: FormEvent) {
    e.preventDefault();
    if (sendState === "sending") return;
    if (!valid) return setShowErrors(true);
    setShowErrors(false);
    if (step < TOTAL_STEPS) setStep(step + 1);
    else void submit();
  }

  const questions: Record<number, string> = {
    1: "In welcher Stadt / Region möchtest du eröffnen?",
    2: "Hast du bereits Erfahrung in der Gastronomie?",
    3: "Wann möchtest du starten?",
    4: "Wie heißt du?",
    5: "Wie können wir dich erreichen?",
  };

  return (
    <div data-reveal="up" style={delay(150)} className="flex w-full max-w-[616px] flex-col gap-7 rounded-[24px] border border-line bg-white px-5 pb-8 pt-7 shadow-[0_24px_64px_0_rgba(59,0,27,0.08)] sm:rounded-[32px] sm:px-12 sm:pb-12 sm:pt-11">
      <div className="flex w-full flex-col gap-2.5">
        <p className="text-[13px] font-semibold text-burgundy">
          {done ? "Fertig!" : `Schritt ${step} von ${TOTAL_STEPS}`}
        </p>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={done ? TOTAL_STEPS : step}
        >
          <div
            className="h-full rounded-full bg-greek-blue transition-[width] duration-500"
            style={{ width: `${((done ? TOTAL_STEPS : step) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-4 text-center">
        <span className="flex size-[88px] items-center justify-center rounded-full bg-white shadow-[0_12px_32px_0_rgba(59,0,27,0.18)] sm:size-[104px]">
          <Image src="/images/form-logo.png" alt="Make Gyros Great Again" width={88} height={88} className="size-[74px] sm:size-[88px]" />
        </span>
        <h2 className="font-[family-name:var(--font-kaushan)] text-[32px] leading-[1.1] tracking-[-0.01em] text-burgundy sm:text-[44px]">
          Werde Teil von Deutschlands beliebtestem Griechen
        </h2>
        <p className="text-base leading-[1.55] text-body sm:text-[17px]">
          Eröffne deinen eigenen Oh My Greece – mit fertigem Konzept, 100 % Halal-Qualität und griechischen
          Original-Rezepten.
        </p>
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
      </div>

      <div className="h-px w-full bg-line" />

      {done ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center" role="status">
          <p className="font-display text-[28px] font-bold leading-[1.2] text-burgundy">Danke, {a.name.split(" ")[0]}!</p>
          <p className="text-base leading-[1.55] text-body">
            Wir haben deine Anfrage für <strong>{a.city}</strong> erhalten und melden uns innerhalb von 24 Stunden bei dir.
          </p>
        </div>
      ) : (
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
                  options={EXPERIENCE_OPTIONS}
                  labelledBy={questionId}
                  invalid={!!err("experience")}
                  value={a.experience}
                  onChange={(v) => set("experience", v)}
                />
                {err("experience") && <p role="alert" className="text-[13px] text-[#c62828]">{err("experience")}</p>}
              </>
            )}
            {step === 3 && (
              <>
                <Choices
                  options={START_OPTIONS}
                  labelledBy={questionId}
                  invalid={!!err("start")}
                  value={a.start}
                  onChange={(v) => set("start", v)}
                />
                {err("start") && <p role="alert" className="text-[13px] text-[#c62828]">{err("start")}</p>}
              </>
            )}
            {step === 4 && (
              <Field
                label="Vor- und Nachname"
                value={a.name}
                onChange={(v) => set("name", v)}
                placeholder="z. B. Nikos Papadopoulos"
                autoComplete="name"
                maxLength={LIMITS.name}
                error={err("name")}
              />
            )}
            {step === 5 && (
              <>
                <Field
                  label="E-Mail"
                  type="email"
                  value={a.email}
                  onChange={(v) => set("email", v)}
                  placeholder="name@beispiel.de"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={LIMITS.email}
                  error={err("email")}
                />
                <Field
                  label="Telefon"
                  type="tel"
                  value={a.phone}
                  onChange={(v) => set("phone", v)}
                  placeholder="+49 …"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={LIMITS.phone}
                  error={err("phone")}
                />
                <label className="flex cursor-pointer items-start gap-3 text-left text-[13px] leading-normal text-muted">
                  <input
                    type="checkbox"
                    checked={a.consent}
                    onChange={(e) => set("consent", e.target.checked)}
                    aria-invalid={!!err("consent")}
                    aria-describedby={err("consent") ? "consent-error" : undefined}
                    className="mt-0.5 size-4 shrink-0 accent-greek-blue"
                  />
                  <span className={err("consent") ? "text-[#c62828]" : ""}>
                    Ich bin einverstanden, dass Oh My Greece mich zu meiner Franchise-Anfrage kontaktiert. Die Angaben
                    werden gemäß Datenschutzerklärung verarbeitet.
                  </span>
                </label>
                {err("consent") && (
                  <p id="consent-error" role="alert" className="-mt-2 pl-7 text-[13px] text-[#c62828]">
                    {err("consent")}
                  </p>
                )}
              </>
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

          <div className="flex w-full items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                aria-label="Zurück"
                disabled={sendState === "sending"}
                onClick={() => {
                  setShowErrors(false);
                  setSendState("idle");
                  setStep(step - 1);
                }}
                className="flex items-center justify-center gap-2.5 rounded-full border-[1.5px] border-burgundy py-[16.5px] pl-[22px] pr-[26px] font-bold text-burgundy transition hover:bg-burgundy hover:text-white"
              >
                <ArrowRight back />
                <span className="max-sm:sr-only">Zurück</span>
              </button>
            )}
            <button
              type="submit"
              disabled={sendState === "sending"}
              aria-busy={sendState === "sending"}
              className="flex flex-1 items-center justify-center gap-2.5 rounded-full bg-sun py-[18px] pl-[30px] pr-[26px] font-bold text-burgundy transition hover:bg-[#ffe100] hover:shadow-[0_10px_24px_-8px_rgba(59,0,27,0.35)] disabled:cursor-wait disabled:opacity-70"
            >
              <span className="whitespace-nowrap">{sendState === "sending" ? "Wird gesendet…" : step === TOTAL_STEPS ? "Jetzt eintragen" : "Weiter"}</span>
              {sendState === "sending" ? (
                <span aria-hidden className="size-5 animate-spin rounded-full border-2 border-burgundy/30 border-t-burgundy" />
              ) : (
                <ArrowRight />
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function ApplicationSection() {
  return (
    <section id="bewerbung" className="scroll-mt-6 bg-ivory py-20 sm:py-[120px]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-14 px-5 sm:px-8 lg:flex-row lg:items-start lg:justify-center lg:gap-16 lg:px-12 xl:px-20">
        {/* 560×720 composition, hidden on phones so the form comes first */}
        <div className="relative hidden aspect-[560/720] w-full max-w-[560px] shrink-0 sm:block lg:w-[400px] xl:w-[560px]">
          <div data-reveal="zoom" data-parallax style={delay(0, -0.06)} className="absolute left-[3.57%] top-[20.83%] h-[72.22%] w-[92.86%] rounded-full bg-teal" />
          <div data-reveal="pop" data-parallax style={delay(450, -0.16)} className="absolute left-[78.57%] top-[2.78%] h-[15.28%] w-[19.64%] rounded-full bg-sun" />
          <div data-reveal="photo" style={delay(120)} className="absolute left-[8.93%] top-[5.56%] h-[88.89%] w-[82.14%] overflow-hidden rounded-[32px] shadow-[0_24px_48px_0_rgba(59,0,27,0.18)]">
            <Image
              src="/images/form-photo.jpg"
              alt="Oh My Greece Store mit Gyros-Theke"
              fill
              sizes="(min-width: 1280px) 460px, 60vw"
              className="object-cover"
            />
          </div>
          <OpaBadge className="left-0 top-[83.33%]" d={650} />
        </div>
        <ApplicationForm />
      </div>
    </section>
  );
}
