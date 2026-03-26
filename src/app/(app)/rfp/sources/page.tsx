export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { rfpSources } from "@/db/schema";
import { desc } from "drizzle-orm";
import { SourcesClient } from "./sources-client";

export default async function SourcesPage() {
  const sources = await db
    .select()
    .from(rfpSources)
    .orderBy(desc(rfpSources.createdAt));

  return <SourcesClient initialSources={sources} />;
}
