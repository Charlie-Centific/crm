/**
 * Converts the 6 HTML swimlane files to webp images via Playwright.
 * Output: public/diagrams/<WF-ID>.webp
 *
 * Run: node scripts/gen-swimlane-webp.mjs
 */

import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, "..");
const RAW_DIR   = path.join(ROOT, "data/raw/OneDrive_1_3-26-2026");
const OUT_DIR   = path.join(ROOT, "public/diagrams");

fs.mkdirSync(OUT_DIR, { recursive: true });

const JOBS = [
  { file: "shots_fired_swimlane.html",          wfId: "WF-04-GUNSHOT"  },
  { file: "access_control_breach_swimlane.html", wfId: "WF-05-ACSCTR"  },
  { file: "generic_911_swimlane.html",           wfId: "WF-09-DSPAGT"  },
  { file: "illegal_dumping_swimlane.html",       wfId: "WF-21-ILLDMP"  },
  { file: "crowd_management_swimlane.html",      wfId: "WF-22-CROWD"   },
  { file: "lpr_hotplate_swimlane.html",          wfId: "WF-24-STVEH"   },
];

(async () => {
  const browser = await chromium.launch();
  const page    = await browser.newPage();

  for (const { file, wfId } of JOBS) {
    const src = path.join(RAW_DIR, file);
    const out = path.join(OUT_DIR, `${wfId}.webp`);

    if (!fs.existsSync(src)) {
      console.warn(`  SKIP  ${file} — not found`);
      continue;
    }

    await page.goto(`file://${src}`, { waitUntil: "networkidle" });

    // Let the layout settle
    await page.waitForTimeout(300);

    // Size to the full content width + some padding
    await page.setViewportSize({ width: 1200, height: 800 });

    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewportSize({ width: 1200, height: bodyHeight + 40 });

    const pngOut = out.replace(".webp", ".png");
    await page.screenshot({
      path: pngOut,
      fullPage: true,
      type: "png",
    });

    // Convert PNG → webp using cwebp (homebrew)
    execSync(`cwebp -q 92 "${pngOut}" -o "${out}"`, { stdio: "pipe" });
    fs.unlinkSync(pngOut); // remove intermediate PNG

    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log(`  OK    ${wfId}.webp  (${kb} KB)`);
  }

  await browser.close();
  console.log("\nDone — images in public/diagrams/");
})();
