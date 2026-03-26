# Import System

The import system brings data from **Dynamics 365** into the local SQLite database. It handles CSV or Excel exports and maps Dynamics field naming variants to the app's schema.

All imports are **idempotent**: re-importing the same file updates changed fields without creating duplicates. This is achieved by upserting on the `dynamics_id` field.

---

## Files

| File | Purpose |
|---|---|
| [src/lib/importer/parse.ts](../src/lib/importer/parse.ts) | Parses raw CSV content using PapaParse |
| [src/lib/importer/columns.ts](../src/lib/importer/columns.ts) | Maps Dynamics column names + infers vertical/stage/source |
| [src/lib/importer/import-accounts.ts](../src/lib/importer/import-accounts.ts) | Account upsert logic |
| [src/lib/importer/import-contacts.ts](../src/lib/importer/import-contacts.ts) | Contact upsert logic |
| [src/lib/importer/import-opportunities.ts](../src/lib/importer/import-opportunities.ts) | Opportunity upsert logic |
| [src/app/api/import/route.ts](../src/app/api/import/route.ts) | API endpoint: POST /api/import |
| [src/app/(app)/import/page.tsx](../src/app/(app)/import/page.tsx) | Upload UI |
| [scripts/seed-from-excel.mjs](../scripts/seed-from-excel.mjs) | CLI seeding from Excel file |

---

## How It Works

### 1. Ingestion

**Via UI** (`/import`):
- User drags and drops a CSV or Excel file
- Selects entity type (account, contact, or opportunity)
- File is sent as `multipart/form-data` to `POST /api/import`

**Via CLI** (seed script):
```bash
node scripts/seed-from-excel.mjs --file "data/raw/export.xlsx" --owner "Jordan Ripoll"
```
This reads Excel directly and runs the same import logic, bypassing the HTTP layer.

---

### 2. Parsing

**File:** [src/lib/importer/parse.ts](../src/lib/importer/parse.ts)

For CSV files: uses **PapaParse** with `header: true` to produce an array of raw row objects.
For Excel files: uses **xlsx** (SheetJS) to convert the first sheet to JSON rows.

Output: `Record<string, string>[]` — raw column name → raw string value.

---

### 3. Column Mapping

**File:** [src/lib/importer/columns.ts](../src/lib/importer/columns.ts)

Dynamics 365 exports use inconsistent column names depending on the org's configuration. The mapper normalizes these into the app's schema fields.

**Example variants for "Account Name":**
```
"Account Name"
"name"
"Company Name"
"Organization Name"
```

The mapper tries each known variant in order and returns the first match found in the row.

**Inference functions:**

#### `inferVertical(rawValue: string): Vertical`
Matches keywords in account name or explicit vertical field:
- `transit`, `bus`, `metro`, `rail`, `mta` → `transit`
- `city of`, `municipality`, `county`, `smart` → `smart_city`
- `emergency`, `fire`, `police`, `911`, `dispatch` → `emergency`
- `utility`, `water`, `electric`, `gas`, `power` → `utilities`
- Default: `smart_city`

#### `inferStage(rawValue: string): Stage`
Maps Dynamics stage labels (which vary by org) to the app's 8-stage enum.

#### `inferLeadSource(rawValue: string): LeadSource`
Maps Dynamics source values to `conference`, `partner`, `direct`, or `inbound`.

---

### 4. Entity Importers

Each importer follows the same pattern:

```ts
// Pseudocode for import-accounts.ts
for (const row of parsedRows) {
  const mapped = mapAccountRow(row)           // columns.ts
  const existing = db.query by dynamics_id    // check for duplicate

  if (existing) {
    db.update(accounts).set(mapped)           // update changed fields
    skipped++
  } else {
    db.insert(accounts).values({ id: uuid(), ...mapped })
    imported++
  }
}
```

**Account importer** ([import-accounts.ts](../src/lib/importer/import-accounts.ts)):
- Infers vertical from name if not mapped
- Auto-assigns owner if `--owner` flag provided (CLI) or selected in UI
- Writes to `accounts` table

**Contact importer** ([import-contacts.ts](../src/lib/importer/import-contacts.ts)):
- Must be run after accounts (requires `account_id`)
- Matches account by `dynamics_account_id`
- Sets `is_primary: 1` for the first contact per account if not specified

**Opportunity importer** ([import-opportunities.ts](../src/lib/importer/import-opportunities.ts)):
- Must be run after accounts (requires `account_id`)
- Infers stage + lead source
- Sets `stage_changed_at` to import timestamp if not in source data

---

### 5. Import Log

Every import run writes a record to the `import_log` table:

```json
{
  "entity_type": "account",
  "records_found": 25,
  "imported": 12,
  "skipped": 11,
  "errors": 2,
  "source_file": "dynamics-export-2025-03.csv",
  "imported_at": "2025-03-15T09:00:00Z"
}
```

The import UI at `/import` displays this history.

---

## Import Order

When importing for the first time, always import in this order:

1. **Accounts** — must exist before contacts or opportunities can reference them
2. **Contacts** — references `account_id`
3. **Opportunities** — references `account_id` and optionally `owner_id`

Re-imports can be run in any order since all records already exist.

---

## Typical Workflow

```bash
# 1. Export accounts from Dynamics 365 as CSV
# 2. Export contacts as CSV
# 3. Export opportunities as CSV

# Via UI:
# → Navigate to /import
# → Upload accounts.csv (type: account)
# → Upload contacts.csv (type: contact)
# → Upload opportunities.csv (type: opportunity)

# Via CLI (for initial seeding from Excel):
node scripts/seed-from-excel.mjs \
  --file "data/raw/centific-pipeline.xlsx" \
  --owner "Charlie Gonzalez"
```

---

## Field Mapping Reference

### Account Fields

| App Field | Dynamics Variants |
|---|---|
| `dynamics_id` | `Account ID`, `AccountId`, `id` |
| `name` | `Account Name`, `name`, `Company Name` |
| `vertical` | Inferred from name keywords |
| `city` | `City`, `Address 1: City` |
| `state` | `State/Province`, `Address 1: State/Province` |
| `employee_count` | `Number of Employees`, `Employees` |
| `website` | `Website`, `URL` |

### Contact Fields

| App Field | Dynamics Variants |
|---|---|
| `dynamics_id` | `Contact ID`, `ContactId` |
| `first_name` | `First Name`, `FirstName` |
| `last_name` | `Last Name`, `LastName` |
| `role` | `Job Title`, `Title` |
| `email` | `Email`, `Email Address` |
| `phone` | `Business Phone`, `Phone` |

### Opportunity Fields

| App Field | Dynamics Variants |
|---|---|
| `dynamics_id` | `Opportunity ID`, `OpportunityId` |
| `name` | `Opportunity Name`, `Topic`, `Name` |
| `stage` | `Sales Stage`, `Stage` — inferred via `inferStage()` |
| `value` | `Est. Revenue`, `Revenue`, `Amount` |
| `close_date` | `Est. Close Date`, `Close Date` |
| `lead_source` | `Lead Source` — inferred via `inferLeadSource()` |

---

## Error Handling

Import errors are collected per-row and returned in the API response. A single bad row does not stop the import. Common causes:

| Error | Cause |
|---|---|
| `missing required field: name` | Account name column not found — check column mapping |
| `invalid stage value: "Proposal"` | Stage string not matched by `inferStage()` — add variant to columns.ts |
| `account not found for contact` | Contact imported before account — import accounts first |
| `duplicate dynamics_id` | This is handled gracefully as an update, not an error |
