import { IMAGE_WIDTHS } from "./image-widths.mjs";

type LoaderProps = { src: string; width: number; quality?: number };

/**
 * next/image loader for the pre-built WebP sizes in public/images/_w (see scripts/optimize-images.mjs).
 * SVGs and anything outside /images are served as they are.
 */
export default function imageLoader({ src, width }: LoaderProps) {
  const match = /^\/images\/([^/]+)\.(?:jpe?g|png)$/i.exec(src);
  if (!match) return src;
  const w = IMAGE_WIDTHS.find((x) => x >= width) ?? IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];
  return `/images/_w/${match[1]}-${w}.webp`;
}
