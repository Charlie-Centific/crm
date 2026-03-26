# API Reference

All API routes live under `src/app/api/` and follow the Next.js App Router convention. Each route file exports named functions (`GET`, `POST`, `PATCH`, etc.) that receive a `Request` object and return a `Response`.

Routes interact with the database directly via Drizzle ORM — there is no intermediary service layer.

---

## Accounts

### `GET /api/accounts`

Returns a list of accounts. Supports optional search and vertical filter.

**Source:** [src/app/api/accounts/route.ts](../src/app/api/accounts/route.ts)

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `q` | string | Full-text search on account name and city |
| `vertical` | string | Filter by vertical: `smart_city`, `transit`, `emergency`, `utilities` |

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "City of Oakland",
    "vertical": "smart_city",
    "city": "Oakland",
    "state": "CA",
    "employee_count": 5000,
    "owner": {
      "id": "uuid",
      "name": "Charlie Gonzalez",
      "initials": "CG",
      "color": "blue",
      "avatar_slug": "charlie"
    }
  }
]
```

---

### `GET /api/accounts/[id]`

Returns full account detail including contacts, opportunities, activities, workshops, and briefs.

**Source:** [src/app/api/accounts/route.ts](../src/app/api/accounts/route.ts) (dynamic segment)

**Response:**

```json
{
  "id": "uuid",
  "name": "City of Oakland",
  "vertical": "smart_city",
  "contacts": [
    {
      "id": "uuid",
      "first_name": "Jane",
      "last_name": "Smith",
      "role": "CTO",
      "email": "jane@oakland.gov",
      "is_primary": 1
    }
  ],
  "opportunities": [
    {
      "id": "uuid",
      "stage": "workshop",
      "value": 450000,
      "close_date": "2025-06-30",
      "stage_changed_at": "2025-03-01T00:00:00Z"
    }
  ],
  "activities": [...],
  "workshops": [...],
  "pre_call_briefs": [...]
}
```

**Errors:**

| Status | Condition |
|---|---|
| 404 | Account not found |

---

## Pipeline

### `GET /api/pipeline`

Returns all active opportunities grouped by stage. Supports filters.

**Source:** [src/app/api/pipeline/route.ts](../src/app/api/pipeline/route.ts)

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `owner` | string | Team member initials: `CG`, `CC`, `MU`, `JR` |
| `vertical` | string | `smart_city`, `transit`, `emergency`, `utilities` |
| `source` | string | `conference`, `partner`, `direct`, `inbound` |

**Response:**

```json
{
  "lead": [...],
  "discovery": [...],
  "demo": [...],
  "workshop": [...],
  "pilot_start": [...],
  "pilot_close": [...],
  "closed_won": [...],
  "closed_lost": [...]
}
```

Each opportunity in the array includes the full account name and owner info for display on the card.

---

### `PATCH /api/pipeline`

Updates an opportunity's stage or next action.

**Source:** [src/app/api/pipeline/route.ts](../src/app/api/pipeline/route.ts)

**Request Body:**

```json
{
  "id": "opportunity-uuid",
  "stage": "demo",
  "next_action": "Send proposal by Friday"
}
```

All fields except `id` are optional. On stage change, `stage_changed_at` is automatically set to the current timestamp.

**Response:**

```json
{ "ok": true }
```

**Errors:**

| Status | Condition |
|---|---|
| 400 | Missing `id` |
| 404 | Opportunity not found |

---

## Import

### `POST /api/import`

Accepts a CSV or Excel file and imports records into the database. Imports are idempotent — re-uploading the same file updates changed records without creating duplicates (upsert on `dynamics_id`).

**Source:** [src/app/api/import/route.ts](../src/app/api/import/route.ts)

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | File | CSV or Excel file from Dynamics 365 export |
| `type` | string | `account`, `contact`, or `opportunity` |

**Processing Pipeline:**

1. File received → [parse.ts](../src/lib/importer/parse.ts) (PapaParse for CSV, xlsx for Excel)
2. Column mapping → [columns.ts](../src/lib/importer/columns.ts) (normalizes Dynamics field variants)
3. Value inference → `inferVertical()`, `inferStage()`, `inferLeadSource()` in columns.ts
4. Entity import → `import-{type}.ts` (upsert on `dynamics_id`)
5. Log written to `import_log` table

**Response:**

```json
{
  "entity_type": "account",
  "records_found": 25,
  "imported": 12,
  "skipped": 11,
  "errors": 2,
  "error_details": ["Row 14: missing name", "Row 22: invalid stage value"]
}
```

**Errors:**

| Status | Condition |
|---|---|
| 400 | Missing file or invalid type |
| 415 | Unsupported file format |
| 500 | Parse failure |

---

## Design Notes

### No Auth Headers
All API routes are unauthenticated. This is an internal tool for a small, trusted team. If auth is added in the future, add a middleware check in `src/middleware.ts`.

### Server Components Bypass the API
Most data fetching happens in server components (e.g., `pipeline/page.tsx`) via direct Drizzle calls — no HTTP round-trip. The API routes exist primarily for:
- Client-side mutations (PATCH pipeline stage)
- File uploads (POST import)
- Progressive enhancement if pages need to update without full reload

### Error Handling
Routes return JSON error objects on failure:

```json
{ "error": "Account not found" }
```

Client code should check the response status before parsing the body.
