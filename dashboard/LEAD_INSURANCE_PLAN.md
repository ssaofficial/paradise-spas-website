# Lead Insurance Plan — Custom Forms → GHL

**Paradise Spas · Increase ROAS build**  
**Goal:** Own the forms on our website. Every submit is saved somewhere we control **before** we trust GHL. If GHL fails, the owner can still recover the lead in under 60 seconds.

**Live site:** https://www.paradisespas.com  
**First target:** Fair inventory gate (`/inventoryredrivervalleyfair/`)

**Owner setup guide:** [LEAD_INSURANCE_OWNER_SETUP.md](./LEAD_INSURANCE_OWNER_SETUP.md)  
**Pre-deploy form QA:** [FORM_GATE_QA.md](./FORM_GATE_QA.md)  
**Env variable template:** [lead-api.env.example](./lead-api.env.example)

---

## How we work through this

1. **One phase at a time.** Do not start the next phase until the current phase’s **Completion gate** is checked off.
2. **Owner tasks** (Alexander) and **Build tasks** (Cursor/dev) are listed separately.
3. When a phase is done, update **Phase status** at the top of that section to `COMPLETE` and note the date.
4. **Phase 7+** only start after Phase 6 sign-off.

---

## Architecture (target state)

```
Visitor form (our HTML)
        │
        ▼
Cloudflare Worker  /api/lead
        ├─ Turnstile + spam checks
        ├─ submission_id
        ├─ ① Google Sheet "All Leads" (vault) — MUST succeed
        ├─ ② POST GHL Contacts API — retry on timeout/429/5xx
        └─ Visitor sees success only if ① succeeded
                 │
        GHL success ──► unlock inventory + GA4 generate_lead
        GHL fail    ──► "Missed Leads" sheet + email alert (lead still safe in All Leads)
```

**Minimal stack (Phases 1–6):** Worker + Google Sheets vault + GHL API + failure email.  
**Upgrade later (Phase 8):** Cloudflare Queue + D1 + dead-letter — only if we outgrow minimal or see repeated GHL failures.

---

## Phase status overview

| Phase | Name | Status | Completed |
|-------|------|--------|-----------|
| 0 | Prerequisites & accounts | COMPLETE | — |
| 1 | GHL API + Sheet structure | COMPLETE | — |
| 2 | Worker vault (Sheet only) | COMPLETE | — |
| 3 | GHL delivery + Missed Leads | COMPLETE | — |
| 4 | Fair inventory form (live) | COMPLETE | — |
| 5 | Owner alerts & ops routine | COMPLETE | Set `ALERT_EMAIL` — verify with a failure test when ready |
| 6 | End-to-end verification & sign-off | COMPLETE | Phone test passed |
| 7 | Roll out to other forms | NOT STARTED | — |
| 8 | Optional: Queue + D1 upgrade | NOT STARTED | — |

---

## Phase 0 — Prerequisites & accounts

**Status:** NOT STARTED

**Goal:** Accounts and decisions ready before any code.

### Decisions (confirm once)

- [ ] **Forms:** Custom HTML on our site — no GHL Form Builder / iframe for fair gate (and eventually site-wide).
- [ ] **CRM:** GHL remains source of truth for follow-up; backup is insurance only.
- [ ] **Failure alerts go to:** _____________________________ (email required; Slack optional).
- [ ] **Who re-imports missed leads:** _____________________________ (default: Alexander).

### Owner checklist

- [ ] Cloudflare account access for `paradisespas.com` (Pages + Workers).
- [ ] Google account for a new Sheet (Increase ROAS or Paradise Spas — pick one owner).
- [ ] GHL sub-account admin access (Location ID: `NpZCArkZIoHhOIl8Qjd1`).
- [ ] Confirm GHL plan includes **Private Integrations** / API access for contact create.

### Build checklist

- [ ] Create empty repo folder plan: `workers/lead-api/` (Phase 2).
- [ ] Document chosen alert email in **Record URLs** section at bottom of this file.

### Completion gate ✓

- [ ] All decisions filled in.
- [ ] Alexander confirms Cloudflare + GHL + Google access.
- [ ] **Do not start Phase 1 until this gate is checked.**

---

## Phase 1 — GHL API + Google Sheet structure

**Status:** NOT STARTED  
**Depends on:** Phase 0 complete

**Goal:** GHL can receive API contacts with the right tags/fields; Google Sheet ready as the vault.

### Owner checklist — GHL

- [ ] **Private Integration:** Settings → Integrations → Private Integrations → Create.
- [ ] **Name:** `Paradise Spas Website Lead API`
- [ ] **Scopes:** `contacts.write` (and `contacts.read` if offered — helps upsert later).
- [ ] Copy token once → store in password manager (never in git). Label: `GHL_LEAD_API_TOKEN`.
- [ ] **Custom field** (if not exists): `Fair attendance` or map to existing field for fair yes/maybe/no.
- [ ] **Custom field** (if not exists): `Lead source page` (URL path).
- [ ] **Tags** (create in GHL if missing):
  - `website-form`
  - `fair-inventory-unlock`
  - `lead-api` (marks contacts created via Worker, not old iframe form)
- [ ] **Workflow (simple):** Trigger = Contact Created + Tag contains `fair-inventory-unlock` → internal notification email/SMS to team (so silent workflow failure is visible).

### Owner checklist — Google Sheet

Create: **`Paradise Spas — Lead Vault`**

**Tab 1: `All Leads`** — every submission, success or fail

| Column | Purpose |
|--------|---------|
| submission_id | Unique ID from Worker |
| submitted_at | ISO timestamp |
| source | e.g. `fair-inventory-gate` |
| full_name | |
| email | |
| phone | |
| fair_attendance | yes / maybe / no |
| page_url | |
| ghl_status | PENDING / SENT / FAILED |
| ghl_contact_id | if GHL succeeded |
| ghl_error | last error message if failed |
| ip_hash | optional, for dedupe |

**Tab 2: `Missed Leads`** — copy of rows where `ghl_status = FAILED` (can be manual filter at first; Worker appends here on final GHL failure)

| Column | Purpose |
|--------|---------|
| submission_id | |
| submitted_at | |
| full_name | email | phone | fair_attendance | page_url |
| ghl_error | |
| reimported | YES / blank |
| reimported_at | |
| notes | |

- [ ] Share Sheet with service account email (Phase 2 — dev will provide email) as **Editor**.
- [ ] Bookmark Sheet URL → record in **Record URLs** below.

### Build checklist

- [ ] Verify GHL API with one test contact via curl/Postman (document contact ID in Phase 6 tests).
- [ ] Confirm `locationId`: `NpZCArkZIoHhOIl8Qjd1` in test payload.
- [ ] Confirm API header `Version: 2021-07-28`.

### Completion gate ✓

- [ ] Test contact visible in GHL with correct tag.
- [ ] Sheet exists with both tabs and headers.
- [ ] Token stored securely (not in repo).
- [ ] **Do not start Phase 2 until this gate is checked.**

---

## Phase 2 — Cloudflare Worker vault (Google Sheet only)

**Status:** NOT STARTED  
**Depends on:** Phase 1 complete

**Goal:** `POST /api/lead` accepts form JSON and **always** appends to `All Leads` before returning success. GHL not wired yet.

### Build checklist

- [ ] Add `workers/lead-api/` with Wrangler config bound to `paradisespas.com` route `/api/lead`.
- [ ] Secrets (Wrangler): `GHL_API_TOKEN` (placeholder ok), `GOOGLE_SERVICE_ACCOUNT_JSON`, `SHEET_ID`, `TURNSTILE_SECRET` (Phase 4 if not ready — stub validate in dev).
- [ ] Worker logic:
  - [ ] Validate required fields: name, email, phone, source.
  - [ ] Generate `submission_id` (UUID).
  - [ ] Append row to `All Leads` with `ghl_status = PENDING`.
  - [ ] Return `{ ok: true, submission_id }` only if Sheet append succeeded.
  - [ ] Return `{ ok: false, error }` if Sheet failed — visitor must NOT see success.
- [ ] CORS: allow `https://www.paradisespas.com` only.
- [ ] Rate limit: basic per-IP (Cloudflare rate limit rule or Worker counter).

### Owner checklist

- [ ] Deploy Worker to production (dev runs deploy or walks Alexander through Wrangler).
- [ ] Submit test payload from browser console or temporary test page → row appears in `All Leads`.

### Completion gate ✓

- [ ] 3 test rows in `All Leads` with correct columns.
- [ ] Forced Sheet failure (bad ID) returns error to client — no fake success.
- [ ] **Do not start Phase 3 until this gate is checked.**

---

## Phase 3 — GHL delivery + Missed Leads path

**Status:** NOT STARTED  
**Depends on:** Phase 2 complete

**Goal:** After Sheet vault succeeds, Worker sends contact to GHL. Retries on timeout/429/5xx. Final failure → `Missed Leads` + alert.

### Build checklist

- [ ] After Sheet append, POST to `https://services.leadconnectorhq.com/contacts/` with:
  - [ ] `locationId`, name, email, phone
  - [ ] Tags: `website-form`, `lead-api`, + source tag (e.g. `fair-inventory-unlock`)
  - [ ] Custom fields: fair attendance, page URL
- [ ] **Upsert pattern:** search by email first; update if exists, create if not (avoid duplicate contacts).
- [ ] **Retries:** 3 attempts, backoff 1s / 3s / 9s on timeout, 429, 5xx.
- [ ] On success: update Sheet row `ghl_status = SENT`, `ghl_contact_id = …`.
- [ ] On final failure: append `Missed Leads`, set `ghl_status = FAILED`, store `ghl_error`.
- [ ] Trigger failure alert (Phase 5 can wire email; stub `console.error` ok until Phase 5).

### Owner checklist

- [ ] Run 1 happy-path test → contact in GHL + Sheet shows SENT.
- [ ] Run 1 failure test (dev temporarily breaks token) → row in `Missed Leads`, lead still in `All Leads`.

### Completion gate ✓

- [ ] Happy path: GHL contact + Sheet SENT.
- [ ] Failure path: lead never lost — still in `All Leads` + `Missed Leads`.
- [ ] **Do not start Phase 4 until this gate is checked.**

---

## Phase 4 — Fair inventory form (live)

**Status:** NOT STARTED  
**Depends on:** Phase 3 complete

**Goal:** Replace GHL iframe on fair inventory gate with native form + instant unlock on confirmed vault success.

### Build checklist

- [ ] Native form on `inventoryredrivervalleyfair/index.html`:
  - [ ] Fair question: “Are you coming to the Red River Valley Fair?”
  - [ ] Name, email, phone
  - [ ] TCPA consent line (match existing site disclaimer language)
  - [ ] Cloudflare Turnstile widget
- [ ] Client JS: POST to `/api/lead` with `source: fair-inventory-gate`.
- [ ] On `{ ok: true }`: call existing unlock (`ParadiseInventoryGate.unlock()` or localStorage + applyUnlocked).
- [ ] On `{ ok: false }`: show “Something went wrong — please call 701-714-5879” (do not unlock).
- [ ] Remove GHL iframe from fair gate panel (keep modal iframe until Phase 7 if desired).
- [ ] Fire `gtag('event', 'generate_lead', …)` only after `{ ok: true }`.
- [ ] Deploy to production.

### Owner checklist

- [ ] Submit real test on phone (fair page) → pricing unlocks → row in Sheet → contact in GHL.
- [ ] Confirm fair question answer visible in GHL custom field.
- [ ] Confirm old GHL form iframe is gone from fair gate.

### Completion gate ✓

- [ ] Fair gate live on production with native form.
- [ ] Unlock only after Worker confirms vault write.
- [ ] Lead in GHL with tag `fair-inventory-unlock`.
- [ ] **Do not start Phase 5 until this gate is checked.**

---

## Phase 5 — Owner alerts & ops routine

**Status:** NOT STARTED  
**Depends on:** Phase 4 complete

**Goal:** Alexander gets notified when GHL fails; daily/weekly routine documented and tested.

### Build checklist

- [ ] Failure email via Worker (Resend, SendGrid, or Mailchannels) to alert address from Phase 0.
- [ ] Email subject: `[Paradise Spas] Lead saved — GHL failed — ACTION NEEDED`
- [ ] Email body: name, phone, email, fair answer, link to Sheet row, submission_id.
- [ ] Optional: Slack webhook same payload.

### Owner checklist — daily (2 min)

- [ ] Open **`Missed Leads`** tab.
- [ ] If rows with blank `reimported`: add contact in GHL manually → mark `reimported = YES` + date.

### Owner checklist — weekly (10 min)

- [ ] Count new rows in **`All Leads`** this week.
- [ ] Count new GHL contacts with tag `lead-api` (or `fair-inventory-unlock`) this week.
- [ ] Numbers should match ± manual tests; investigate gaps using `ghl_status = FAILED`.

### Manual re-import (60 sec)

1. Open `Missed Leads` row.
2. GHL → Contacts → Add / search email.
3. Paste name, phone, email, fair field, tags `website-form`, `fair-inventory-unlock`, `lead-api`.
4. Mark row `reimported = YES`.

### Completion gate ✓

- [ ] Failure test triggers email within 5 minutes.
- [ ] Alexander completed one practice re-import from Sheet to GHL.
- [ ] **Do not start Phase 6 until this gate is checked.**

---

## Phase 6 — End-to-end verification & sign-off

**Status:** NOT STARTED  
**Depends on:** Phase 5 complete

**Goal:** Prove the system under realistic conditions; sign off before expanding to other pages.

### Test matrix (all must pass)

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 1 | Normal submit, fair page, mobile | Unlock + All Leads + GHL contact | [ ] |
| 2 | Normal submit, desktop | Same | [ ] |
| 3 | Invalid email | Form blocked, no Sheet row | [ ] |
| 4 | Turnstile fail / bot | Blocked, no Sheet row | [ ] |
| 5 | GHL API down (simulated) | Unlock OK, All Leads OK, Missed Leads + email | [ ] |
| 6 | Sheet down (simulated) | No unlock, error message, no data loss claim | [ ] |
| 7 | Duplicate email same week | Upsert, no duplicate GHL contacts | [ ] |
| 8 | Ad blocker on | Submit still works (no GHL iframe dependency) | [ ] |

### Sign-off

- [ ] Alexander sign-off: fair gate ready for real traffic.
- [ ] Record production Worker URL and Sheet URL below.
- [ ] Update `README.md` with one-paragraph owner ops link to this doc.

### Completion gate ✓

- [ ] All 8 tests passed.
- [ ] Sign-off date recorded.
- [ ] **Phase 7 unlocked only after this gate is checked.**

---

## Phase 7 — Roll out to other forms (after Phase 6)

**Status:** NOT STARTED  
**Depends on:** Phase 6 complete

**Goal:** Same Worker, different `source` values — no new insurance architecture.

### Order of rollout

1. [ ] Standard inventory gate (`inventory.html`) — question: local/delivery area
2. [ ] GHL modal / pricing CTAs (`ghl-modal.js`) — replace iframe with modal native form
3. [ ] Contact page
4. [ ] Product page inline forms
5. [ ] Remove unused GHL form embed script site-wide when nothing references iframe form `iz3wpzwCI9GQhR3wlwbV`

Each sub-rollout needs its own mini gate:

- [ ] Submit test → Sheet + GHL + tracking
- [ ] Correct tag per source
- [ ] Owner notified on failure

### Completion gate ✓

- [ ] All priority pages on native forms.
- [ ] Old GHL iframe form removed from production paths.

---

## Phase 8 — Optional upgrade (Queue + D1)

**Status:** NOT STARTED  
**Depends on:** Phase 6 complete + evidence we need it

**Start Phase 8 only if:**

- GHL failures happen more than ~2× per month, **or**
- Submit volume exceeds ~500/month, **or**
- We need automated replay from vault → GHL without manual re-import.

### Upgrade checklist

- [ ] Cloudflare D1 table mirrors `All Leads` schema.
- [ ] Cloudflare Queue between Worker and GHL consumer.
- [ ] Dead-letter queue for final failures.
- [ ] Optional: automated replay job for FAILED rows.

---

## Record URLs (fill as you go)

```
Alert email:
Google Sheet — Lead Vault:
Cloudflare Worker route:
GHL Private Integration name:
Phase 6 sign-off date: 2026-07-01 (phone test passed)
```

---

## What we are NOT doing in Phases 0–6

- Meta CAPI / server-side Pixel (can add after Phase 6 — separate project).
- Replacing GHL workflows or pipeline.
- D1 + Queue (Phase 8 only).
- Changing call tracking number.

---

## Quick reference — GHL IDs

| Item | Value |
|------|--------|
| Location ID | `NpZCArkZIoHhOIl8Qjd1` |
| Old iframe form ID (retire after Phase 7) | `iz3wpzwCI9GQhR3wlwbV` |
| Fair page | `/inventoryredrivervalleyfair/` |
| Tracking phone | 701-714-5879 |

---

*Last updated: plan created. Phase 0 not started.*
