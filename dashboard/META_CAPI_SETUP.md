# Meta Conversions API (CAPI) — Paradise Spas

**Pixel ID:** `1317738110513512`  
**Lead value:** $950 USD

CAPI sends **Lead** events from your Cloudflare Worker when a form is saved to the Lead Vault — so Meta still gets conversions even if the browser Pixel is blocked.

Browser Pixel + server CAPI use the same **`event_id`** so Meta deduplicates (does not double-count).

---

## How it triggers (automatic)

```
Visitor submits fair form
    → /api/lead saves to Google Sheet (vault)
    → Worker sends Lead to Meta CAPI (hashed email/phone + IP + fbp/fbc)
    → Browser fires fbq('track', 'Lead') with same eventID
    → Inventory unlocks
```

CAPI fires when the **Sheet vault succeeds** — not only when GHL succeeds. That matches “we captured a real lead.”

---

## Step 1 — Meta Events Manager token

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager)
2. Select dataset / Pixel **`1317738110513512`**
3. **Settings** → **Conversions API** (or **Set up direct integration**)
4. Choose **Conversions API** → **Set up manually**
5. **Generate access token** → copy it (starts with `EAA...`)
6. Save as **`META_CAPI_ACCESS_TOKEN`** — never commit to git

---

## Step 2 — Cloudflare env vars

Pages → **paradise-spas** → **Settings** → **Environment variables** → Production:

| Variable | Value |
|----------|--------|
| `META_CAPI_ACCESS_TOKEN` | Your `EAA...` token |
| `META_PIXEL_ID` | `1317738110513512` (optional — default in code) |

**Optional for testing:**

| Variable | Value |
|----------|--------|
| `META_TEST_EVENT_CODE` | From Events Manager → **Test events** tab |

Remove `META_TEST_EVENT_CODE` after testing.

---

## Step 3 — Deploy

```bash
npm run deploy
```

---

## Step 4 — Test

1. Events Manager → **Test events** → copy **Test event code** → add as `META_TEST_EVENT_CODE` in Cloudflare → redeploy
2. Submit fair form on your phone (use a test email)
3. In **Test events**, you should see:
   - **Lead** from **Browser** (Pixel)
   - **Lead** from **Server** (Conversions API)
   - Same **Event ID** on both → deduplicated to **1 conversion**

4. Remove `META_TEST_EVENT_CODE` and redeploy for production

---

## Verify in production

Events Manager → **Overview** → **Lead** → check **Event match quality** (email + phone improve score).

Ads Manager → campaign using **Lead** optimization → **Events** should show server events received.

---

## What we send to Meta

| Field | Source |
|-------|--------|
| `event_name` | Lead |
| `event_id` | UUID (shared with Pixel) |
| `em` | SHA256 hashed email |
| `ph` | SHA256 hashed phone (US +1) |
| `client_ip_address` | Cloudflare |
| `client_user_agent` | Browser |
| `fbp` / `fbc` | Meta cookies (ad attribution) |
| `value` / `currency` | 950 / USD |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No server events | `META_CAPI_ACCESS_TOKEN` missing or deploy not run |
| Pixel only, no server | Check Worker deploy + token scope for pixel |
| Double counting | Ensure same `eventID` — already wired in `lead-form.js` |
| Low match quality | Normal on first events; improves with email + phone |

---

## Code locations

- Server: `functions/lib/meta-capi.js`
- Trigger: `functions/api/lead.js` (after vault save)
- Browser: `lead-form.js` (`fbq` + `meta_event_id`, `fbp`, `fbc` in POST)
