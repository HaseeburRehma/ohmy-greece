// Pre-builds the responsive WebP files that src/lib/image-loader.ts points at, so photos are
// plain static files on the CDN instead of going through Vercel's metered image optimizer.
// Run after adding or replacing a photo in public/images: `pnpm images`.
import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { IMAGE_WIDTHS } from "../src/lib/image-widths.mjs";

const SRC = "public/images";
const OUT = path.join(SRC, "_w");

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f));
for (const file of files) {
  const base = file.replace(/\.(jpe?g|png)$/i, "");
  const { width: original = 0 } = await sharp(path.join(SRC, file)).metadata();
  for (const w of IMAGE_WIDTHS) {
    // Never upscale: wider requests get the original size under the requested name.
    await sharp(path.join(SRC, file))
      .resize({ width: Math.min(w, original), withoutEnlargement: true })
      .webp({ quality: 78, effort: 6, alphaQuality: 90 })
      .toFile(path.join(OUT, `${base}-${w}.webp`));
  }
  console.log(`${file}: ${IMAGE_WIDTHS.length} sizes`);
}
