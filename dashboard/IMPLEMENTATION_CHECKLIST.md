# Increase ROAS — implementation checklist

Track manual steps in Increase ROAS Google account. Code/automation lives in this repo.

## Automated / in repo

- [x] GA4 event tracking on site (`click_call`, `pricing_click`, `generate_lead`)
- [x] Setup guide: [01-ga4-looker-base.md](./01-ga4-looker-base.md)
- [x] Coupler GBP guide: [02-coupler-gbp.md](./02-coupler-gbp.md)
- [x] GHL → Sheets Apps Script: [ghl-lead-sync/Code.gs](./ghl-lead-sync/Code.gs)
- [x] Sheets + Looker guide: [03-ghl-sheets-sync.md](./03-ghl-sheets-sync.md)
- [x] Final layout + share: [04-looker-layout-share.md](./04-looker-layout-share.md)
- [x] GHL MCP example: [../.cursor/mcp.json.example](../.cursor/mcp.json.example) + [05-mcp-internal.md](./05-mcp-internal.md)

## Manual (Increase ROAS Google account)

- [ ] GA4: grant Increase ROAS Editor on `G-E5WGSEGZYP`
- [ ] GA4: mark `click_call`, `pricing_click`, `generate_lead` as conversions
- [ ] Looker: create report + GA4 data source
- [ ] Coupler.io: GBP → Looker (Paradise Spas Minot location)
- [ ] Google Sheet: `Paradise Spas — Lead Sync` + paste Apps Script + `GHL_API_KEY`
- [ ] GHL workflow: form submit → tag `website-form`
- [ ] Looker: blend 3 sources + 5 KPI layout
- [ ] Share view-only link with Paradise Spas
- [ ] Cursor: `cp .cursor/mcp.json.example .cursor/mcp.json` + add bearer token

## Record live URLs here

```
Looker share (view-only):
Google Sheet:
Coupler flow:
```
