# Form gate QA — run before every deploy

Use this **2-minute phone check** whenever you change the fair inventory gate, `inventory-gate.css`, or `lead-form.js`.

**Test URL:** https://www.paradisespas.com/inventoryredrivervalleyfair/

---

## Phone checklist (iPhone Safari)

- [ ] Form fields stack vertically — no overlapping text
- [ ] Consent paragraph is readable (not on top of “Limited fair inventory”)
- [ ] **Unlock Fair Inventory** button is fully visible
- [ ] Pink **Limited fair inventory** box sits **below** the button
- [ ] Submit test lead → pricing unlocks
- [ ] Row appears in Lead Vault Sheet

---

## Why the overlap bug happened

Mobile CSS still used a **260px fixed height** from the old **GHL iframe** form. Native forms are taller and overflowed onto the scarcity block.

**Prevention in code:**

- Fixed heights apply only to `.inventory-gate-form-shell:has(iframe)` — not native forms
- Native forms use `inventory-gate-form-shell--native` + `data-gate-form="native"`

**Rule for future changes:** Never set `height` / `max-height` on `.inventory-gate-form-shell` without `:has(iframe)`.

---

## Before deploy (dev)

1. Bump CSS cache query on fair page if you edited gate styles (`?v=YYYYMMDD`)
2. `npm run deploy`
3. Run phone checklist above on **production** (not just preview)

---

## Optional — desktop spot check

Chrome DevTools → toggle device toolbar → iPhone size → same URL → scroll gate panel.

---

## When Phase 7 adds more native forms

Copy the same pattern:

```html
<div class="inventory-gate-form-shell inventory-gate-form-shell--native" data-gate-form="native">
  <form id="paradise-lead-form" class="inventory-gate-form">...</form>
</div>
```

Never put a native form inside a shell that also contains a GHL iframe.
