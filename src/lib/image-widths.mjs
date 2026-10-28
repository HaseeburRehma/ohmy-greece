/** Widths next/image may ask for; scripts/optimize-images.mjs builds one WebP per width. */
export const DEVICE_SIZES = [640, 828, 1080, 1200, 1920];
export const IMAGE_SIZES = [96, 128, 192, 256, 384];
export const IMAGE_WIDTHS = [...IMAGE_SIZES, ...DEVICE_SIZES];
