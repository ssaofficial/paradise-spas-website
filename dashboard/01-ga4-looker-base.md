# Phase 1 — GA4 + Looker base (Increase ROAS)

**Owner:** Increase ROAS Google account  
**GA4 property ID:** `G-E5WGSEGZYP`  
**Time:** ~30–45 minutes

---

## Step 1 — Grant Increase ROAS access to GA4

1. Open [Google Analytics](https://analytics.google.com) with the account that currently owns the property.
2. **Admin** (gear) → **Property access management** → **+** → **Add users**.
3. Add the **Increase ROAS** Google email as **Editor** (needed to mark conversions).
4. Confirm Increase ROAS can open property **Paradise Spas** / `G-E5WGSEGZYP`.

---

## Step 2 — Mark website events as conversions

1. Still in GA4 **Admin** → **Events**.
2. Find each event (may take 24–48h after first fire on site):

| Event name | Meaning |
|------------|---------|
| `click_call` | Tap on phone link |
| `pricing_click` | Pricing / GHL form button |
| `generate_lead` | Thank-you page after form |

3. Toggle **Mark as conversion** ON for all three.

**Quick test:** Visit `https://www.paradisespas.com`, tap Call → check **Reports → Realtime** for `click_call`.

---

## Step 3 — Create Looker Studio report (Increase ROAS)

1. Log into [Looker Studio](https://lookerstudio.google.com) with **Increase ROAS** Google account.
2. **Create** → **Report**.
3. **Add data** → **Google Analytics** → **GA4 property** → select Paradise Spas (`G-E5WGSEGZYP`).
4. Name the data source: `Paradise Spas — GA4`.

---

## Step 4 — First widgets (GA4-only proof)

Add a **date range control** (Last 7 days / Last 30 days).

### Scorecards (Metric: Event count, Filter: Event name)

| Scorecard title | Filter |
|-----------------|--------|
| Call button taps | Event name = `click_call` |
| Pricing clicks | Event name = `pricing_click` |
| Thank-you visits | Event name = `generate_lead` |

How to filter a scorecard:
- Select scorecard → **Setup** → **Metric** → Event count  
- **Add filter** → Event name → Equal to → `click_call` (repeat per card)

### Time series chart

- Dimension: **Date**
- Metric: **Event count**
- Breakdown dimension: **Event name**
- Filter: Event name IN (`click_call`, `pricing_click`)

### Table

- Dimension: **Page path**
- Metric: **Event count**
- Filter: Event name = `pricing_click`
- Sort: Event count descending

---

## Step 5 — Save

- **File → Report name:** `Paradise Spas — Performance Dashboard`
- Leave sharing private until Phase 4 (final layout + client link).

---

## Done when

- [ ] Three events marked as conversions in GA4  
- [ ] Looker report exists under Increase ROAS with GA4 source  
- [ ] Scorecards show data (or Realtime confirms events fire)

Next: [02-coupler-gbp.md](./02-coupler-gbp.md)
