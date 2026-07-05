# Phase 3 — GHL form leads → Google Sheets

**Owner:** Increase ROAS Google account  
**Time:** ~1–2 hours (mostly copy/paste setup)

---

## Step 1 — Create the Google Sheet

1. Log into Google Sheets with **Increase ROAS** account.
2. **Blank spreadsheet** → name: `Paradise Spas — Lead Sync`
3. Two tabs will be created automatically by the script:
   - `lead_log` — one row per contact
   - `daily_summary` — one row per day (for Looker scorecards)

---

## Step 2 — Install Apps Script

1. In the spreadsheet: **Extensions → Apps Script**
2. Delete any default `Code.gs` content.
3. Paste the full contents of [`ghl-lead-sync/Code.gs`](./ghl-lead-sync/Code.gs)
4. **Save** the project as `Paradise Spas GHL Sync`

---

## Step 3 — Add GHL API key (Script properties)

Do **not** paste the API key into the script file.

1. Apps Script → **Project Settings** (gear) → **Script properties**
2. **Add script property:**

| Property | Value |
|----------|--------|
| `GHL_API_KEY` | Your GHL Private Integration token (`pit-...`) |

Token must have **contacts.readonly** (or contacts) scope for location `NpZCArkZIoHhOIl8Qjd1`.

---

## Step 4 — Authorize and run

1. Select function **`syncGhlLeadsToSheet`** → **Run**
2. Approve Google permissions (external request to GHL API).
3. Return to the spreadsheet — `lead_log` and `daily_summary` should populate.

**Menu:** Refresh the sheet → **Paradise Spas Sync → Run sync now**

---

## Step 5 — Hourly automatic sync

1. **Paradise Spas Sync → Install hourly trigger**
2. Or: Apps Script → **Triggers** → Add → `syncGhlLeadsToSheet` → Time-driven → Hourly

---

## Step 6 — Connect Sheet to Looker Studio

1. Open Paradise Spas Looker report (Increase ROAS).
2. **Add data → Google Sheets** → select `Paradise Spas — Lead Sync`
3. Choose tab **`daily_summary`** for scorecards.
4. Name data source: `Paradise Spas — GHL`

### Scorecard — Form leads

- Metric: **SUM of `form_leads`**
- Dimension filter: `date` within report date range
- Title: **Form leads (GHL)**

### Table — Recent leads

- Data source: **`lead_log`** tab
- Columns: date, first_name, last_name, email, phone, source
- Sort: `created_at` descending
- Limit: 50 rows

---

## How leads are identified

The sync includes contacts where **source or tags** contain `website` or `form`, or match form name **WEBSITE FORM**.

If leads are missing, add a GHL workflow on **WEBSITE FORM** submit:

1. **Trigger:** Form submitted → form `iz3wpzwCI9GQhR3wlwbV`
2. **Action:** Add tag **`website-form`**

The sync script counts contacts tagged `website-form` or with source containing **WEBSITE FORM**.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Missing GHL_API_KEY` | Add Script property |
| `403 location` | Token needs access to location `NpZCArkZIoHhOIl8Qjd1` |
| Empty `lead_log` | Submit a test form; check GHL contact source/tags |
| Looker shows stale data | Sheet refresh → Looker **Data freshness** → Refresh |

---

## Done when

- [ ] `daily_summary` has rows with `form_leads` counts  
- [ ] Looker has `Paradise Spas — GHL` data source  
- [ ] Hourly trigger installed  

Next: [04-looker-layout-share.md](./04-looker-layout-share.md)
