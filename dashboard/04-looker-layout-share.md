# Phase 4 — Final Looker layout + share with Paradise Spas

**Owner:** Increase ROAS Google account  
**Time:** ~45 minutes

---

## Data sources in one report

You should have three sources connected:

| Source name | Origin | Primary metrics |
|-------------|--------|-----------------|
| `Paradise Spas — GA4` | Native GA4 | `click_call`, `pricing_click`, `generate_lead` |
| `Paradise Spas — GBP` | Coupler.io | Call clicks from listing |
| `Paradise Spas — GHL` | Google Sheets `daily_summary` | `form_leads` |

---

## Theme (Paradise Spas branding)

1. **Theme and layout → Customize**
2. **Primary color:** `#0d4cae` (navy)
3. **Accent:** `#F0A500` (amber) if available
4. **Text:** dark on white background
5. Optional: add Paradise Spas logo as a **Image** component (upload `paradiselogo.svg` exported as PNG)

---

## Page layout

### Header row

- **Text:** `Paradise Spas — Performance Dashboard`
- **Subtitle:** `Website + Google listing + form leads`
- **Date range control** (global): Last 7 days | Last 30 days | Custom

---

### Row 1 — Five KPI scorecards

Place in one row (5 columns):

| # | Title | Source | Metric / field |
|---|-------|--------|----------------|
| 1 | **Form leads** | GHL sheet | SUM `form_leads` |
| 2 | **Google listing calls** | GBP / Coupler | SUM call clicks field |
| 3 | **Call button taps** | GA4 | Event count, filter `click_call` |
| 4 | **Pricing clicks** | GA4 | Event count, filter `pricing_click` |
| 5 | **Thank-you visits** | GA4 | Event count, filter `generate_lead` |

Add a small caption under row: *Form leads = GHL. Listing calls = Google Business Profile. Website taps = GA4.*

---

### Row 2 — Charts

**Chart A — Daily activity (bar or line)**

| Series | Source | Field |
|--------|--------|-------|
| Form leads | GHL | `form_leads` by `date` |
| Listing calls | GBP | daily call clicks |
| Call taps | GA4 | `click_call` by Date |

**Chart B — Pricing interest**

- GA4 time series: `pricing_click` by Date

---

### Row 3 — Tables

**Funnel summary (static labels + live metrics)**

Create a small table or text + scorecards:

| Step | Metric |
|------|--------|
| Pricing button taps | GA4 `pricing_click` |
| Thank-you page visits | GA4 `generate_lead` |
| Confirmed form leads | GHL SUM `form_leads` |
| Google listing calls | GBP call clicks |
| Website call taps | GA4 `click_call` |

**Recent leads (optional)**

- GHL `lead_log` tab: name, email, phone, date

---

## Share with Paradise Spas (customer)

1. **Share** (top right)
2. **Manage access**
3. Choose one:
   - **Anyone with the link** → **Viewer** (easiest for client)
   - Or add Paradise Spas owner emails as **Viewer** only
4. Copy link → save in your client folder

**Do not** give Paradise Spas **Edit** access unless they should change the report.

---

## Suggested client message

> Here’s your weekly performance dashboard for Paradise Spas.  
> It shows form leads, Google listing calls, and website activity (call taps + pricing clicks).  
> Bookmark this link — it updates automatically.  
> [Looker Studio link]

---

## Replace placeholder link

After publishing, paste the live share URL here for your team:

```
LOOKER_SHARE_URL=
```

---

## Done when

- [ ] All 5 KPI scorecards show data  
- [ ] Charts render for last 7 days  
- [ ] View-only link sent to Paradise Spas  
- [ ] Increase ROAS retains Editor access  

Internal audits: [05-mcp-internal.md](./05-mcp-internal.md)
