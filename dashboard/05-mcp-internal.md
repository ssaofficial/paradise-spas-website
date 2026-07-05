# Phase 5 — GHL MCP (internal audits)

Use this for **Increase ROAS / SSA team only** — not for Paradise Spas customer access.

Prompt examples in Cursor:

- *How many Paradise Spas website form leads this week?*
- *List contacts created yesterday for location Paradise Spas*
- *Does GHL show more leads than Looker this week?*

---

## Step 1 — MCP config for this project

1. Copy the example config:

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

2. Open `.cursor/mcp.json` and set your bearer token in the `Authorization` header.

3. **Do not commit** `.cursor/mcp.json` (it is gitignored). Only commit `mcp.json.example`.

---

## Step 2 — Enable in Cursor

1. **Cursor Settings → MCP** (or restart Cursor after adding the file).
2. Confirm server **gohighlevel-paradise** shows connected.
3. In chat, ask: *Use GHL to count new contacts for Paradise Spas location this week.*

---

## MCP server details

| Item | Value |
|------|--------|
| URL | `https://gohighlevel-mcp-d4kz.onrender.com/mcp` |
| Location ID | `NpZCArkZIoHhOIl8Qjd1` |
| Form ID | `iz3wpzwCI9GQhR3wlwbV` |

---

## When to use MCP vs Looker

| Question | Use |
|----------|-----|
| Client weekly review | **Looker share link** |
| “Why doesn’t this number match?” | **GHL MCP** + GA4 Realtime |
| Audit single lead | **GHL MCP** |
| Marketing trend over months | **Looker** |

---

## Optional: audit checklist

When Looker and GHL disagree on form leads:

1. GHL MCP — count contacts with `website` / form tag this week  
2. GA4 — `generate_lead` event count (thank-you page)  
3. Confirm GHL form redirect → `https://www.paradisespas.com/thank-you.html`  
4. Run **Paradise Spas Sync → Run sync now** in Google Sheet  

---

## Done when

- [ ] `.cursor/mcp.json` created locally with valid token  
- [ ] MCP server connected in Cursor  
- [ ] Test prompt returns Paradise Spas contact data  
