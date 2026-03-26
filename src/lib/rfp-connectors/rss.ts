/**
 * Generic RSS / Atom feed connector.
 * Works with any public procurement portal that publishes a feed URL.
 * Uses rss-parser (MIT licence, bundled types).
 */
import Parser from "rss-parser";
import { RfpListingRaw, SourceFilters, toIsoDate } from "./types";

const parser = new Parser({
  customFields: {
    item: [
      ["description", "description"],
      ["content:encoded", "contentEncoded"],
      ["dc:date", "dcDate"],
    ],
  },
});

function matchesFilters(text: string, keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k.toLowerCase()));
}

export async function syncRss(
  feedUrl: string,
  filters: SourceFilters
): Promise<RfpListingRaw[]> {
  let feed: Awaited<ReturnType<typeof parser.parseURL>>;

  try {
    feed = await parser.parseURL(feedUrl);
  } catch (err) {
    throw new Error(`RSS fetch failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  return (feed.items ?? [])
    .filter((item) => {
      const text = [item.title, item.contentSnippet, item.content].join(" ");
      return matchesFilters(text, filters.keywords);
    })
    .map((item): RfpListingRaw => {
      // Stable external ID: GUID > link > title hash
      const externalId = item.guid ?? item.link ?? item.title ?? String(Math.random());

      return {
        externalId,
        title:       item.title ?? "Untitled",
        description: item.contentSnippet ?? item.content ?? null,
        agency:      feed.title ?? null,
        naicsCode:   null,
        setAside:    null,
        postedDate:  toIsoDate(item.pubDate ?? item.dcDate as string),
        dueDate:     null,
        valueMin:    null,
        valueMax:    null,
        url:         item.link ?? null,
        rawData:     JSON.stringify(item),
      };
    });
}
