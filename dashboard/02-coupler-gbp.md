# Phase 2 — Google Business Profile via Coupler.io

**Owner:** Increase ROAS Google account  
**Time:** ~45 minutes

---

## Prerequisites

- Increase ROAS Google user is **Manager** on Paradise Spas GBP listing.
- If not: **business.google.com** → Paradise Spas → **Users** → Invite Increase ROAS email as Manager.

Location: **1615 South Broadway, Minot, ND 58701**

---

## Step 1 — Coupler.io account

1. Go to [coupler.io](https://www.coupler.io).
2. Sign up / log in with **Increase ROAS Google account**.

---

## Step 2 — Create GBP → Looker data flow

1. **Add importer** (or use preconfigured GBP → Looker flow if offered).
2. **Source:** Google Business Profile  
3. **Destination:** Looker Studio (or Google Sheets named `Paradise Spas — GBP` if blending is easier in Looker)

### Source settings

- Connect Google account (Increase ROAS).
- Select **Paradise Spas** location (Minot).
- Metrics to include:

| Metric | Use in dashboard |
|--------|------------------|
| Call clicks | **Google listing calls** (primary) |
| Website clicks | Optional context |
| Direction requests | Optional context |
| Business impressions | Optional context |

4. **Schedule:** Daily refresh (free tier limits apply — sufficient for one location).

---

## Step 3 — Connect to Looker report

1. Open the Paradise Spas Looker report from Phase 1.
2. **Resource → Manage added data sources → Add a data source**.
3. Choose the Coupler-generated source (or **Google Sheets** if Coupler writes to a sheet first).
4. Name it: `Paradise Spas — GBP`.

---

## Step 4 — GBP scorecard

1. **Add a scorecard**.
2. Metric: **Call clicks** (or field name Coupler provides, e.g. `CALL_CLICKS`).
3. Title: **Google listing calls**
4. Add same **date range control** as GA4 widgets.

If using Sheets destination, ensure date column aligns with Looker date range filter.

---

## Step 5 — Optional blend with GA4

For a combined daily chart later (Phase 4):

- GA4 `click_call` = website tap-to-call  
- GBP call clicks = calls from Google Maps / Search listing  

These are **different actions** — label them clearly on the dashboard.

---

## Done when

- [ ] Coupler flow runs without errors  
- [ ] Looker has `Paradise Spas — GBP` data source  
- [ ] Scorecard shows listing call data for last 7 days  

Next: [03-ghl-sheets-sync.md](./03-ghl-sheets-sync.md)
