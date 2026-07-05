# GA4 API access for Paradise Spas

**Property:** Paradise Spas  
**Measurement ID:** `G-E5WGSEGZYP`  
**Numeric Property ID:** `543642271`  
**Account:** Increaseroas

Use this so Cursor (or scripts) can pull live page traffic and funnel events without screenshots.

---

## One-time setup (~15 min)

### 1. Enable the API

1. [Google Cloud Console](https://console.cloud.google.com) — same Google account as GA4
2. Select or create a project (e.g. `paradise-spas-analytics`)
3. **APIs & Services → Library** → search **Google Analytics Data API** → **Enable**

### 2. Create a service account

1. **IAM & Admin → Service accounts → Create service account**
2. Name: `paradise-ga4-reader`
3. Skip project roles → **Done**
4. Open the account → **Keys → Add key → Create new key → JSON**
5. Save the file outside git, e.g. `~/secrets/paradise-ga4.json`

### 3. Grant GA4 access

1. [analytics.google.com](https://analytics.google.com) → **Admin**
2. Property **Paradise Spas** → **Property access management**
3. **+** → add the service account email (`...@....iam.gserviceaccount.com`)
4. Role: **Viewer**

### 4. Run the funnel report

```bash
export GA4_CREDENTIALS_PATH=~/secrets/paradise-ga4.json
export GA4_PROPERTY_ID=543642271

node scripts/ga4-funnel-report.mjs --from 2026-06-29 --to 2026-07-02
```

All pages (top 200):

```bash
node scripts/ga4-funnel-report.mjs --all-pages --from 2026-06-29 --to 2026-07-02
```

---

## Give Cursor access

Tell the agent:

1. **Property ID:** `543642271` (done)
2. **Credentials path:** where you saved the JSON (e.g. `~/secrets/paradise-ga4.json`)

Do **not** commit the JSON to GitHub. It is gitignored via `*-ga4*.json` and `ga4-credentials.json`.

---

## What the script returns

| Section | Metrics |
|---------|---------|
| Fair funnel pages | Sessions, users, views per page path |
| Funnel events by page | `generate_lead`, `pricing_click`, `click_call`, `fair_inventory_unlock` |
| Site-wide event totals | Sum of tracked events |

Fair paths monitored:

- `/redrivervalleyfair`
- `/inventoryredrivervalleyfair`
- `/redrivervalleyavailableinventoryonly`
- `/hot-tub-offer`
- `/inventory`
- `/thank-you`

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `USER_PERMISSION_DENIED` | Add service account email in GA4 Property access management |
| `API not enabled` | Enable Google Analytics Data API in Cloud Console |
| `Credentials file not found` | Set `GA4_CREDENTIALS_PATH` to the JSON path |
| Empty funnel section | Widen date range or confirm traffic hit those paths |
