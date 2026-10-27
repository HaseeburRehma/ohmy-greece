"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Page-wide motion layer:
 * - Lenis smooth scrolling (incl. in-page #anchor links)
 * - reveals every [data-reveal] element once it reaches (or has passed) the viewport
 * Parallax for [data-parallax] is pure CSS (scroll-driven animation in globals.css).
 * Everything is skipped when the visitor prefers reduced motion.
 */
export default function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (reduced) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    // Reveal anything whose top has entered the lower ~12% of the viewport *or is
    // already above it*. A scroll check (not IntersectionObserver) so elements
    // skipped by a jump (anchor link, End key, fast fling) still appear, and so
    // the last elements on the page reveal even when they can't scroll higher.
    let pending = [...targets];
    let frame = 0;
    const check = () => {
      frame = 0;
      const vh = window.innerHeight;
      const atBottom = window.scrollY + vh >= document.documentElement.scrollHeight - 4;
      pending = pending.filter((el) => {
        const top = el.getBoundingClientRect().top;
        if (top > (atBottom ? vh : vh * 0.88)) return true;
        el.classList.add("is-visible");
        return false;
      });
      if (!pending.length) window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    check();

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.95,
      anchors: { offset: -16, duration: 1.4 },
      autoRaf: true,
    });

    root.classList.add("lenis-active");
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
      lenis.destroy();
      root.classList.remove("lenis-active");
    };
  }, []);

  return null;
}
