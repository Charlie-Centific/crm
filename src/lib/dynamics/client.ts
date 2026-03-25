/**
 * Thin wrapper around the Dynamics 365 Web API (OData v4).
 * Handles auth, pagination, and rate-limit retries automatically.
 */

import { getDynamicsToken } from "./auth";

const BASE_URL = () => {
  const orgUrl = process.env.DYNAMICS_ORG_URL?.replace(/\/$/, "");
  return `${orgUrl}/api/data/v9.2`;
};

interface FetchOptions {
  select?: string[];
  filter?: string;
  orderby?: string;
  top?: number;
  expand?: string;
}

async function dynamicsFetch<T>(
  entity: string,
  options: FetchOptions = {},
  retries = 3
): Promise<T[]> {
  const token = await getDynamicsToken();

  const params = new URLSearchParams();
  if (options.select?.length) params.set("$select", options.select.join(","));
  if (options.filter) params.set("$filter", options.filter);
  if (options.orderby) params.set("$orderby", options.orderby);
  if (options.top) params.set("$top", String(options.top));
  if (options.expand) params.set("$expand", options.expand);

  const url = `${BASE_URL()}/${entity}?${params.toString()}`;

  let allRecords: T[] = [];
  let nextLink: string | null = url;

  while (nextLink) {
    const currentUrl = nextLink;
    const res: Response = await fetch(currentUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        Accept: "application/json",
        Prefer: "odata.maxpagesize=1000",
      },
    });

    if (res.status === 429 && retries > 0) {
      const retryAfter = parseInt(res.headers.get("Retry-After") ?? "10", 10);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return dynamicsFetch(entity, options, retries - 1);
    }

    if (res.status === 401) {
      const { clearTokenCache } = await import("./auth");
      clearTokenCache();
      if (retries > 0) return dynamicsFetch(entity, options, retries - 1);
      throw new Error("Dynamics 401: authentication failed after token refresh");
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Dynamics API error (${res.status}): ${text}`);
    }

    const json = await res.json();
    allRecords = allRecords.concat(json.value ?? []);
    nextLink = json["@odata.nextLink"] ?? null;
  }

  return allRecords;
}

// ─── Entity fetchers ──────────────────────────────────────────────────────────

export async function fetchAccounts(modifiedSince?: Date) {
  const filter = modifiedSince
    ? `modifiedon gt ${modifiedSince.toISOString()}`
    : undefined;

  return dynamicsFetch<Record<string, unknown>>("accounts", {
    select: [
      "accountid",
      "name",
      "websiteurl",
      "address1_city",
      "address1_stateorprovince",
      "address1_country",
      "numberofemployees",
      "description",
      "modifiedon",
      "createdon",
    ],
    filter,
    orderby: "modifiedon desc",
  });
}

export async function fetchContacts(modifiedSince?: Date) {
  const filter = modifiedSince
    ? `modifiedon gt ${modifiedSince.toISOString()}`
    : undefined;

  return dynamicsFetch<Record<string, unknown>>("contacts", {
    select: [
      "contactid",
      "firstname",
      "lastname",
      "jobtitle",
      "emailaddress1",
      "telephone1",
      "_parentcustomerid_value",
      "modifiedon",
    ],
    filter,
  });
}

export async function fetchOpportunities(modifiedSince?: Date) {
  const filter = modifiedSince
    ? `modifiedon gt ${modifiedSince.toISOString()}`
    : undefined;

  return dynamicsFetch<Record<string, unknown>>("opportunities", {
    select: [
      "opportunityid",
      "name",
      "estimatedvalue",
      "estimatedclosedate",
      "stepname",
      "leadsourcecode",
      "description",
      "_parentaccountid_value",
      "_ownerid_value",
      "modifiedon",
      "createdon",
      "actualclosedate",
    ],
    filter,
    expand: "ownerid($select=fullname,internalemailaddress)",
  });
}

export async function fetchActivities(
  accountId: string,
  modifiedSince?: Date
) {
  const filter = [
    `_regardingobjectid_value eq ${accountId}`,
    modifiedSince
      ? `modifiedon gt ${modifiedSince.toISOString()}`
      : undefined,
  ]
    .filter(Boolean)
    .join(" and ");

  return dynamicsFetch<Record<string, unknown>>("activitypointers", {
    select: [
      "activityid",
      "activitytypecode",
      "subject",
      "description",
      "modifiedon",
      "scheduledstart",
    ],
    filter,
    orderby: "modifiedon desc",
    top: 100,
  });
}
