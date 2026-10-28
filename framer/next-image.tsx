import type { CSSProperties, ImgHTMLAttributes } from "react";
import imageLoader from "@/lib/image-loader";
import { IMAGE_WIDTHS } from "@/lib/image-widths.mjs";
import { ASSET_BASE } from "./config";

/**
 * Stand-in for next/image inside the Framer bundle: a plain <img> whose srcset points at the
 * pre-built WebP sizes on the Vercel deployment. Absolute URLs (images picked in Framer) pass through.
 */
type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  preload?: boolean;
  priority?: boolean;
  quality?: number;
};

const local = (src: string) => src.startsWith("/");
const raster = (src: string) => /\.(jpe?g|png)$/i.test(src);
const url = (src: string, width: number) => `${ASSET_BASE}${imageLoader({ src, width })}`;

export default function Image({ src, alt, width, height, fill, sizes, preload, priority, quality, style, ...rest }: Props) {
  void quality;
  let href = src;
  let srcSet: string | undefined;
  if (local(src) && raster(src)) {
    if (fill) {
      srcSet = IMAGE_WIDTHS.filter((w) => w >= 256).map((w) => `${url(src, w)} ${w}w`).join(", ");
      href = url(src, 1080);
    } else {
      const w = width ?? 256;
      srcSet = `${url(src, w)} 1x, ${url(src, w * 2)} 2x`;
      href = url(src, w);
    }
  } else if (local(src)) {
    href = `${ASSET_BASE}${src}`;
  }

  const fillStyle: CSSProperties = fill ? { position: "absolute", inset: 0, width: "100%", height: "100%" } : {};
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Framer has no next/image
    <img
      {...rest}
      src={href}
      srcSet={srcSet}
      sizes={srcSet && fill ? (sizes ?? "100vw") : undefined}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={preload || priority ? "eager" : "lazy"}
      decoding="async"
      style={{ ...fillStyle, ...style }}
    />
  );
}
