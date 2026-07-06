# Agency Lead Stack — Copy Into Any HTML Site

Portable kit for **agency / service / funnel sites** (no inventory, no hot tubs).

Copy this entire `agency-starter/` folder contents into your new website project root, then follow the steps below.

**Full playbook (B2B agency site):** `../dashboard/AGENCY_B2B_TRACKING_AND_LEADS_SOP.md`  
**Generic client playbook:** `../dashboard/AGENCY_TRACKING_AND_LEADS_SOP.md`

---

## 1. Copy files into your site folder

```bash
# From your new site project root:
cp -R /path/to/paradise-spas-website/agency-starter/functions ./
cp -R /path/to/paradise-spas-website/agency-starter/js/* ./js/   # or site root
cp agency-starter/snippets/* ./   # reference only — paste into your HTML
cp agency-starter/thank-you.html ./
cp -R agency-starter/css ./css/   # or merge into your existing styles
cp agency-starter/package.json ./
cp agency-starter/lead-api.env.example ./
cp agency-starter/CLIENT.config.json ./CLIENT.config.json
```

**Minimum files required:**

```
your-site/
├── functions/
│   ├── api/lead.js
│   └── lib/{validate,ghl,sheets,meta-capi,cors,alert}.js
├── js/
│   ├── lead-form.js
│   ├── native-form.js
│   ├── call-tracking.js
│   └── pricing-tracking.js
├── css/lead-form.css
├── thank-you.html
├── package.json
└── CLIENT.config.json   ← fill this in
```

---

## 2. Fill `CLIENT.config.json`

| Field | Example |
|-------|---------|
| `clientName` | Acme Marketing |
| `primaryDomain` | https://www.acmemarketing.com |
| `ghlLocationId` | GHL sub-account ID |
| `ga4MeasurementId` | G-XXXXXXXX |
| `metaPixelId` | 123456789 (or empty) |
| `leadValueUsd` | 500 |
| `defaultPhone` | 5551234567 |
| `cloudflareProject` | acme-marketing |

Define your **lead sources** in `LEAD-SOURCES.md` (copy from example) and map them in `functions/lib/ghl.js`.

---

## 3. Wire each HTML page

**In `<head>`** — paste from `snippets/head-tracking.html` (replace GA4 + Pixel IDs).

**On `<body>`** — add:

```html
<body
  data-lead-api="/api/lead"
  data-client-name="Acme Marketing"
  data-client-phone="5551234567"
  data-lead-value="500"
  data-turnstile-site-key="">
```

**Before `</body>`** — paste from `snippets/body-scripts.html`.

**Subfolder pages** (e.g. `/services/index.html`): use `../js/call-tracking.js` paths or a shared layout — root-relative `js/...` breaks tracking on nested pages.

**Contact form** — paste from `snippets/form-contact.html` where you want the form.

---

## 4. Cloudflare Pages secrets

Set in Pages → Settings → Environment variables → **Production**:

**Required (forms work):**
- `GOOGLE_SHEETS_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

**Recommended:**
- `GHL_API_TOKEN`
- `GHL_LOCATION_ID`
- `META_CAPI_ACCESS_TOKEN`
- `ALLOWED_ORIGIN` = your domain
- `CLIENT_NAME` = business name (alert emails)

See `lead-api.env.example`.

---

## 5. Google Sheet setup

Tab **All Leads** — row 1 headers:

```
submission_id | submitted_at | source | full_name | email | phone | message | page_url | ghl_status | ghl_contact_id | ghl_error
```

Tab **Missed Leads** — for GHL failures.

Share sheet with service account email (Editor).

---

## 6. GHL setup

1. Create custom fields: `lead_source_page`, `contact_message`, `company_name`, `service_interest`, `utm_source`, `utm_campaign`, `utm_content`, `fbclid` (match keys in `ghl.js`)
2. Add tags you'll use: `contact-page`, `quote-request`, `book-call`, `lp-facebook`, etc.
3. Workflows: **Trigger → Contact tag added → [your tag]**
4. Private Integration token (`pit-...`) with contacts write scope

**Lead reliability (built in):**
- GHL create uses `locationId` in POST body only; updates omit it (prevents 422 on repeat submitters)
- Meta Lead + CAPI fire only after successful GHL save, not on duplicates
- 24h duplicate detection by email/phone in Lead Vault
- Browser submit lock prevents double-click duplicates

---

## 7. Facebook ads

1. Install Pixel (snippet in head)
2. Set `META_CAPI_ACCESS_TOKEN` in Cloudflare
3. Optimize campaign on **Lead** event
4. Form success fires Pixel + CAPI with **same event_id** (deduped automatically)
5. **Do not** fire Lead on `thank-you.html` (template is conversion-free)

Test in Meta Events Manager → Test events.

---

## 8. Deploy

```bash
npm install
# Edit package.json → project-name = your Cloudflare Pages project
npm run deploy
```

---

## 9. QA (15 min)

- [ ] Submit contact form → Sheet row + GHL contact + correct tag
- [ ] Submit same email again within 24h → duplicate row, no second Meta Lead, no duplicate GHL contact
- [ ] GA4 Realtime: `generate_lead` once (not twice)
- [ ] Meta: one Lead per submit only when GHL succeeds (browser + server, same event ID)
- [ ] Phone tap: `click_call`
- [ ] CTA click with `data-track-pricing`: `pricing_click` (nav contact links should NOT fire this)
- [ ] GHL retry: submit with email already in GHL → contact updates, no 422 error

---

## Adding a new form

1. Add HTML shell with unique `data-lead-source="your-code"`
2. Add mapping in `functions/lib/ghl.js` → `tagsForSource()`
3. Create GHL workflow on new tag
4. Add row to `LEAD-SOURCES.md`
