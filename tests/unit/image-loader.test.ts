import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import imageLoader from "@/lib/image-loader";
import { IMAGE_WIDTHS } from "@/lib/image-widths.mjs";

describe("image loader", () => {
  it("maps photos to the next pre-built WebP width", () => {
    expect(imageLoader({ src: "/images/quality-big.jpg", width: 828 })).toBe("/images/_w/quality-big-828.webp");
    expect(imageLoader({ src: "/images/logo-oh-my-greece.png", width: 100 })).toBe("/images/_w/logo-oh-my-greece-128.webp");
    expect(imageLoader({ src: "/images/form-done.jpg", width: 4000 })).toBe("/images/_w/form-done-1920.webp");
  });

  it("leaves SVGs and other paths alone", () => {
    expect(imageLoader({ src: "/images/icons/leaf.svg", width: 16 })).toBe("/images/icons/leaf.svg");
    expect(imageLoader({ src: "/videos/franchise-video-poster.jpg", width: 640 })).toBe("/videos/franchise-video-poster.jpg");
  });

  it("has a built file for every photo at every width", () => {
    for (const photo of ["quality-big", "quality-small-1", "family-photo", "form-step-3", "make-gyros-badge"]) {
      for (const w of IMAGE_WIDTHS) expect(existsSync(`public/images/_w/${photo}-${w}.webp`), `${photo}-${w}`).toBe(true);
    }
  });
});
