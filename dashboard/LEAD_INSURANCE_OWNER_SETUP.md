# Lead Insurance — Your setup checklist

Do these steps **in order**. The fair inventory form is already built in code — it will not work until you finish **Steps 1–4** and deploy.

**Time estimate:** 45–60 minutes once.

---

## Step 1 — Google Sheet (Lead Vault)

1. Create a Google Sheet named **`Paradise Spas — Lead Vault`**
2. Add tab **`All Leads`** with row 1 headers (exact spelling):

```
submission_id | submitted_at | source | full_name | email | phone | fair_attendance | page_url | ghl_status | ghl_contact_id | ghl_error
```

3. Add tab **`Missed Leads`** with row 1 headers:

```
submission_id | submitted_at | full_name | email | phone | fair_attendance | page_url | ghl_error | reimported
```

4. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`

5. **Freeze row 1** on both tabs.

---

## Step 2 — Google service account (Sheet write access)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project (e.g. `Paradise Spas Lead Vault`)
3. Enable **Google Sheets API**
4. **IAM → Service Accounts → Create**
   - Name: `paradise-lead-vault`
5. Create a **JSON key** → download the file (keep private)
6. Copy the service account email (looks like `paradise-lead-vault@....iam.gserviceaccount.com`)
7. Open your **Lead Vault** Google Sheet → **Share** → paste that email → **Editor**
8. Save these for Step 4:
   - `GOOGLE_SHEETS_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (from JSON `private_key` field)

---

## Step 3 — GHL Private Integration

1. GHL → **Settings → Integrations → Private Integrations**
2. Create: **`Paradise Spas Website Lead API`**
3. Scopes: **`contacts.write`** (+ **`contacts.read`** if available)
4. Copy token (`pit-...`) → password manager as **`GHL_LEAD_API_TOKEN`**

### Tags (create if missing)

- `website-form`
- `lead-api`
- `fair-inventory-unlock`

### Custom fields (create if missing)

| Field name | Key (important) |
|------------|-----------------|
| Fair attendance | `fair_attendance` |
| Lead source page | `lead_source_page` |

### Workflow (recommended)

- **Trigger:** Contact Created  
- **Filter:** Tag contains `fair-inventory-unlock`  
- **Action:** Internal notification email/SMS to your team  

---

## Step 4 — Cloudflare Pages environment variables

1. Cloudflare Dashboard → **Workers & Pages** → **paradise-spas** project  
2. **Settings → Environment variables** (Production)

Add these:

| Variable | Value |
|----------|--------|
| `GHL_API_TOKEN` | Your `pit-...` token |
| `GHL_LOCATION_ID` | `NpZCArkZIoHhOIl8Qjd1` |
| `GOOGLE_SHEETS_ID` | From Step 1 |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | From Step 2 |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Full private key; paste with `\n` for line breaks OR single line |
| `ALERT_EMAIL` | Your email for GHL failures |
| `ALLOWED_ORIGIN` | `https://www.paradisespas.com` |
| `TURNSTILE_SECRET_KEY` | From Step 5 (optional until Turnstile ready) |

Optional:

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Reliable failure emails (recommended) |
| `ALERT_FROM` | `Paradise Spas <leads@paradisespas.com>` |

3. **Deploy** the site (Step 6).

---

## Step 5 — Cloudflare Turnstile (spam protection)

1. Cloudflare Dashboard → **Turnstile** → Add site  
2. Domain: `paradisespas.com`  
3. Copy **Site key** and **Secret key**

4. Set in Cloudflare Pages env: `TURNSTILE_SECRET_KEY`

5. In repo, set site key on fair page body tag (or tell Cursor to set it):

```html
data-turnstile-site-key="YOUR_SITE_KEY"
```

Also set on the Turnstile div inside the form, or rely on `lead-form.js` copying from body.

---

## Step 6 — Deploy

From the project folder:

```bash
npm install
export CLOUDFLARE_ACCOUNT_ID=your_account_id
npm run deploy
```

Pages Functions live at: `https://www.paradisespas.com/api/lead`

---

## Step 7 — Test (required before fair traffic)

| Test | Expected |
|------|----------|
| Submit fair form on phone | Pricing unlocks |
| **All Leads** sheet | New row, `ghl_status = SENT` |
| GHL Contacts | New contact with tags `fair-inventory-unlock`, `lead-api` |
| Break test: wrong GHL token temporarily | Row in **Missed Leads** + alert email |

---

## Daily routine (2 minutes)

1. Open **Missed Leads** tab  
2. Any row without `reimported`? → Add contact in GHL manually → mark `reimported = YES`

---

## Weekly routine (10 minutes)

1. Count new **All Leads** rows this week (final row per `submission_id` with `SENT` or `FAILED`)  
2. Count GHL contacts tagged `lead-api` this week  
3. Investigate gaps using **Missed Leads**

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| “Lead vault is not configured” | Step 4 env vars missing → redeploy |
| Form error, no sheet row | Google service account not shared on Sheet |
| Sheet row but no GHL contact | Check **Missed Leads** + `ghl_error` column |
| No failure email | Set `ALERT_EMAIL` or `RESEND_API_KEY` |
| Turnstile error | Set site key + secret key |

---

## Record your URLs here

```
Google Sheet:
Alert email:
Turnstile site key set: YES / NO
Deploy date:
Test contact in GHL (email used):
```
