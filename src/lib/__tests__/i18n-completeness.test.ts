/**
 * i18n completeness test
 *
 * Ensures every key present in en.json (the source of truth) exists in every
 * other locale file. Missing keys cause runtime MISSING_MESSAGE errors from
 * next-intl, so this test catches them before they reach the browser.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Helpers ──────────────────────────────────────────────────────────────────

const MESSAGES_DIR = resolve(__dirname, "../../../messages");
const LOCALES = ["es", "fr", "zh"] as const;

type NestedRecord = { [key: string]: string | NestedRecord };

function loadLocale(locale: string): NestedRecord {
  const file = resolve(MESSAGES_DIR, `${locale}.json`);
  return JSON.parse(readFileSync(file, "utf-8")) as NestedRecord;
}

/** Recursively collect all dot-notation keys from a nested object. */
function collectKeys(obj: NestedRecord, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return typeof v === "object" ? collectKeys(v as NestedRecord, path) : [path];
  });
}

/** Resolve a dot-notation key in a nested object. Returns undefined if missing. */
function getKey(obj: NestedRecord, dotPath: string): string | undefined {
  return dotPath.split(".").reduce<NestedRecord | string | undefined>((cur, seg) => {
    if (cur === undefined || typeof cur === "string") return undefined;
    return (cur as NestedRecord)[seg];
  }, obj) as string | undefined;
}

// ── Tests ────────────────────────────────────────────────────────────────────

const en = loadLocale("en");
const enKeys = collectKeys(en);

describe("i18n — all locales have every key from en.json", () => {
  for (const locale of LOCALES) {
    describe(`locale: ${locale}`, () => {
      const messages = loadLocale(locale);

      it("has no missing keys", () => {
        const missing = enKeys.filter((key) => getKey(messages, key) === undefined);
        expect(
          missing,
          `Missing keys in ${locale}.json:\n${missing.map((k) => `  - ${k}`).join("\n")}`
        ).toEqual([]);
      });

      it("has no empty string values", () => {
        const empty = enKeys.filter((key) => getKey(messages, key) === "");
        expect(
          empty,
          `Empty values in ${locale}.json:\n${empty.map((k) => `  - ${k}`).join("\n")}`
        ).toEqual([]);
      });
    });
  }
});

describe("i18n — en.json has all required nav keys", () => {
  const REQUIRED_NAV_KEYS = [
    "nav.runDemo",
    "nav.buildWorkshop",
    "nav.draftRfp",
    "nav.assets",
    "nav.intelligence",
    "nav.moreTools",
    "nav.backHome",
    "nav.appearance",
    "nav.language",
    "nav.light",
    "nav.dark",
  ];

  const REQUIRED_HOME_KEYS = [
    "home.actions.demo.label",
    "home.actions.demo.description",
    "home.actions.demo.cta",
    "home.actions.workshop.label",
    "home.actions.workshop.description",
    "home.actions.workshop.cta",
    "home.actions.rfp.label",
    "home.actions.rfp.description",
    "home.actions.rfp.cta",
    "home.actions.assets.label",
    "home.actions.assets.description",
    "home.actions.assets.cta",
    "home.actions.intelligence.label",
    "home.actions.intelligence.description",
    "home.actions.intelligence.cta",
    "home.tools.pipeline",
    "home.tools.accounts",
    "home.tools.playbooks",
    "home.tools.workflows",
    "home.tools.pilots",
    "home.tools.pricing",
    "home.tools.import",
  ];

  it("has all required nav keys", () => {
    const missing = REQUIRED_NAV_KEYS.filter((k) => getKey(en, k) === undefined);
    expect(missing, `Missing from en.json: ${missing.join(", ")}`).toEqual([]);
  });

  it("has all required home keys", () => {
    const missing = REQUIRED_HOME_KEYS.filter((k) => getKey(en, k) === undefined);
    expect(missing, `Missing from en.json: ${missing.join(", ")}`).toEqual([]);
  });
});
