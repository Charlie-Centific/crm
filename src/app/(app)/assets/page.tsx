export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { accounts } from "@/db/schema";
import { AssetsClient } from "./assets-client";

export default async function AssetsPage() {
  const allAccounts = await db.select({
    id: accounts.id,
    name: accounts.name,
    vertical: accounts.vertical,
    city: accounts.city,
    state: accounts.state,
    website: accounts.website,
  }).from(accounts).orderBy(accounts.name);

  return <AssetsClient accounts={allAccounts} />;
}
