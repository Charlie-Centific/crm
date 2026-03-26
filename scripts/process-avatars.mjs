/**
 * Converts raw team photos to web-optimised WebP at multiple sizes.
 * Output: public/avatars/{slug}-{size}.webp
 *
 * Run: node scripts/process-avatars.mjs
 */

import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT    = path.join(__dirname, "..");
const RAW_DIR = path.join(ROOT, "data", "raw");
const OUT_DIR = path.join(ROOT, "public", "avatars");

fs.mkdirSync(OUT_DIR, { recursive: true });

// Source file → URL slug (must match team name slug used in the app)
const SOURCES = [
  { file: "Charlie.jpg",  slug: "charlie-gonzalez" },
  { file: "Cynthia.jpg",  slug: "cynthia-colbert" },
  { file: "Jordan.jpg",   slug: "jordan-ripoll" },
  { file: "Michael.jpg",  slug: "michael-underwood" },
];

// Sizes to generate
const SIZES = [
  { name: "32",  px: 32,  quality: 85 },   // pipeline card badges
  { name: "64",  px: 64,  quality: 85 },   // table rows / nav avatars
  { name: "128", px: 128, quality: 82 },   // account detail header
  { name: "256", px: 256, quality: 80 },   // profile / full-size view
];

for (const { file, slug } of SOURCES) {
  const srcPath = path.join(RAW_DIR, file);
  if (!fs.existsSync(srcPath)) {
    console.warn(`  ⚠ Skipping ${file} — not found`);
    continue;
  }

  console.log(`\nProcessing ${file} → ${slug}`);

  for (const { name, px, quality } of SIZES) {
    const outPath = path.join(OUT_DIR, `${slug}-${name}.webp`);

    await sharp(srcPath)
      .resize(px, px, {
        fit: "cover",        // crop to square, centred on face
        position: "top",     // bias upward — better for headshots
      })
      .webp({ quality })
      .toFile(outPath);

    const { size } = fs.statSync(outPath);
    console.log(`  ✓ ${slug}-${name}.webp  ${(size / 1024).toFixed(1)} KB`);
  }
}

console.log(`\n✓ All avatars written to public/avatars/\n`);
