"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const NAV = [
  { label: "Home", href: "#" },
  { label: "Menü", href: "#" },
  { label: "Store", href: "#" },
  { label: "Über uns", href: "#" },
];

function PlaneIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M2.2 3.4h19.6c.6 0 1 .7.7 1.2l-9.4 16c-.4.6-1.3.5-1.5-.2L9.4 12 2 4.7c-.5-.5-.2-1.3.3-1.3Zm7.9 7.2 1.4 6 6.3-10.8-7.7 4.8Z" />

    </svg>
  );
}

function Divider() {
  return <span aria-hidden className="block h-[82px] w-0 border-l-[3px] border-dashed border-white/30" />;
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const close = () => window.innerWidth >= 768 && setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  // While the mobile menu is open: Escape or a tap outside closes it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header data-reveal="down" className="absolute inset-x-0 top-3 z-50 sm:top-6">
      <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-8 lg:px-12 xl:px-20">
        <div ref={barRef} className="relative rounded-[20px] bg-teal-deep shadow-[0_10px_30px_-12px_rgba(59,0,27,0.25)]">
          <div className="flex h-[76px] items-center justify-between px-4 sm:h-[120px] sm:px-10">
            <a href="#" className="shrink-0" aria-label="Oh My Greece Startseite">
              <Image
                src="/images/logo-oh-my-greece.png"
                alt="Oh My Greece"
                width={94}
                height={94}
                loading="eager"
                className="size-[56px] drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)] sm:size-[94px]"
              />
            </a>

            <div className="ml-[62px] hidden md:block">
              <Divider />
            </div>

            <nav aria-label="Hauptnavigation" className="hidden flex-1 justify-center md:flex">
              <ul className="flex items-center gap-8 font-nav text-[17px] font-semibold text-white lg:gap-[52px] lg:text-[19px]">
                {NAV.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="transition-opacity hover:opacity-75">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mr-9 hidden md:block">
              <Divider />
            </div>

            <a
              href="#bewerbung"
              className="hidden items-center gap-2.5 rounded-full border-[1.5px] border-white px-[17px] py-[9px] font-nav text-base font-semibold text-white transition hover:bg-white hover:text-teal-deep md:inline-flex"
            >
              Kontakt
              <PlaneIcon className="size-[17px]" />
            </a>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Menü schließen" : "Menü öffnen"}
              className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-white text-white md:hidden"
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={`absolute left-0 h-0.5 w-5 rounded bg-current transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`}
                />
                <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
                <span
                  className={`absolute left-0 h-0.5 w-5 rounded bg-current transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`}
                />
              </span>
            </button>
          </div>

          <div
            id="mobile-nav"
            className={`grid overflow-hidden transition-[grid-template-rows] duration-300 md:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          >
            <div className="min-h-0" inert={!open}>
              <ul className="flex flex-col gap-1 border-t-[3px] border-dashed border-white/30 px-4 pb-5 pt-3 font-nav text-lg font-semibold text-white">
                {NAV.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} onClick={() => setOpen(false)} className="block rounded-xl px-2 py-2.5 hover:bg-white/10">
                      {item.label}
                    </a>
                  </li>
                ))}
                <li className="pt-2">
                  <a
                    href="#bewerbung"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-white px-5 py-2.5 text-base"
                  >
                    Kontakt
                    <PlaneIcon className="size-[17px]" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
