# Paradise Spas — Increase ROAS Dashboard

Customer-facing metrics live in **Looker Studio** (Increase ROAS Google account).  
This folder holds automation + setup guides.

## Quick links

| Doc | Purpose |
|-----|---------|
| [01-ga4-looker-base.md](./01-ga4-looker-base.md) | GA4 conversions + Looker GA4 data source |
| [02-coupler-gbp.md](./02-coupler-gbp.md) | Google Business Profile calls via Coupler.io |
| [03-ghl-sheets-sync.md](./03-ghl-sheets-sync.md) | GHL form leads → Google Sheets |
| [04-looker-layout-share.md](./04-looker-layout-share.md) | Final dashboard layout + client share link |
| [05-mcp-internal.md](./05-mcp-internal.md) | GHL MCP in Cursor for internal audits |

## IDs (Paradise Spas)

| Item | Value |
|------|--------|
| GA4 property | `G-E5WGSEGZYP` |
| GHL location | `NpZCArkZIoHhOIl8Qjd1` |
| GHL form | `iz3wpzwCI9GQhR3wlwbV` (WEBSITE FORM) |
| Site | `https://www.paradisespas.com` |

## Build order

1. GA4 conversions + Looker GA4 source (`01`)
2. Coupler GBP → Looker (`02`)
3. Google Sheet + Apps Script sync (`03`)
4. Blend all sources in Looker (`04`)
5. Enable GHL MCP in Cursor (`05`)

## GA4 events on the site

| Event | File |
|-------|------|
| `click_call` | `call-tracking.js` |
| `pricing_click` | `pricing-tracking.js` |
| `generate_lead` | `thank-you.html` |
