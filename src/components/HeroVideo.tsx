"use client";

import { useEffect, useRef, useState } from "react";

const POSTER = "/videos/franchise-video-poster.jpg";

/** Muted preview until the visitor asks for sound, then the full film from the start. */
type Mode = "preview" | "sound" | "idle";

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5 shrink-0">
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.6 7.6 0 0 1 0 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
    </svg>
  );
}

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<Mode>("idle");

  // Autoplay starts here rather than with the autoPlay attribute, so visitors who asked for
  // reduced motion or to save data are respected (they get the poster and a play button).
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduced || saveData) return;

    video.muted = true;
    let visible = true;
    const start = () => {
      if (visible && video.muted) video.play().then(() => setMode((m) => (m === "idle" ? "preview" : m)), () => {});
    };
    start();

    // The silent preview only runs while it can be seen; it pauses offscreen to spare battery.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!video.muted) return;
      if (visible) start();
      else video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  const playWithSound = () => {
    const video = ref.current;
    if (!video) return;
    video.muted = false;
    video.loop = false;
    video.currentTime = 0;
    video.play().catch(() => {});
    setMode("sound");
    video.focus({ preventScroll: true });
  };

  return (
    <div className="group relative size-full overflow-hidden rounded-[20px] bg-burgundy shadow-[0_30px_60px_-20px_rgba(59,0,27,0.45)] sm:rounded-[28px]">
      <video
        ref={ref}
        className="size-full object-cover"
        poster={POSTER}
        loop={mode !== "sound"}
        playsInline
        muted
        preload="metadata"
        controls={mode === "sound"}
        aria-label="Video: Oh My Greece stellt das Franchise-Konzept vor"
      >
        <source src="/videos/franchise-video-720.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/videos/franchise-video-1080.mp4" type="video/mp4" />
      </video>

      {mode !== "sound" && (
        <>
          {/* Soft vignette keeps the button readable on the bright parts of the film. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-burgundy/55 via-transparent to-transparent" />
          {mode === "idle" ? (
            <button
              type="button"
              onClick={playWithSound}
              className="absolute inset-0 m-auto flex size-[72px] items-center justify-center rounded-full bg-sun text-burgundy shadow-[0_12px_30px_-6px_rgba(59,0,27,0.5)] transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:size-[88px]"
              aria-label="Video mit Ton abspielen"
            >
              <PlayIcon className="ml-1 size-8 sm:size-10" />
            </button>
          ) : (
            <button
              type="button"
              onClick={playWithSound}
              className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-sun py-2.5 pl-3.5 pr-4 text-[13px] font-bold text-burgundy shadow-[0_10px_24px_-8px_rgba(59,0,27,0.55)] transition hover:-translate-y-0.5 hover:bg-[#ffe100] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:bottom-5 sm:left-5 sm:py-3 sm:pl-4 sm:pr-5 sm:text-sm"
            >
              <span className="relative flex">
                <SpeakerIcon />
                <span aria-hidden className="absolute -right-0.5 -top-0.5 size-2 animate-ping rounded-full bg-burgundy/60" />
              </span>
              Mit Ton ansehen
            </button>
          )}
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-burgundy/70 px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-white backdrop-blur-sm sm:left-5 sm:top-5 sm:text-xs">
            3 Min. · Das Konzept
          </span>
        </>
      )}
    </div>
  );
}
