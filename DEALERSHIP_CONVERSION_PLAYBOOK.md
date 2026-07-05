# Dealership Website Conversion Playbook

**Who this is for:** Owners and managers at hot tub, powersports, RV, and outdoor-living dealerships who want more leads from their website — without guessing what actually works.

**What this covers:** Every conversion tactic we built on the Paradise Spas website (`paradisespas.com`), written so you can copy the ideas for your own store. Each section explains **what we did**, **why it matters**, and **what the data tells us** in plain English.

---

## The Big Picture (Read This First)

Most dealership websites look fine but **do not convert**. Visitors browse, leave, and you never know why.

The fix is not one magic button. It is a **system**:

1. **Make the next step obvious** (price, availability, call, or form).
2. **Capture intent before they bounce** (modal forms, phone tracking, quizzes).
3. **Measure every step** so you know what is working and can fix what is not.

**Industry benchmarks (simple version):**

| Metric | Typical dealership site | Well-optimized local dealer site |
|--------|-------------------------|----------------------------------|
| Visit → any lead action (form or call click) | ~1–3% | ~5–12% |
| Form starts that actually submit | ~40–60% | ~70–85% |
| Cost per lead from paid ads (when tracked correctly) | Often unknown | Can drop 30–50% vs. untracked sites |

When you track calls, pricing clicks, and form submits separately, you stop paying for ads that only get "window shoppers" and start optimizing for people who actually raise their hand.

---

## 1. One Lead Form, Everywhere (GHL Modal)

### What we did
- Connected **GoHighLevel (GHL)** as the CRM.
- Added a **popup form** that opens when someone clicks buttons like "Get Today's Local Price" anywhere on the site.
- Same form, same pipeline, same follow-up — whether they clicked on the homepage, inventory page, or a product page.

### Why it matters
Shoppers do not want to hunt for a contact page. They want to act **in the moment** they see something they like. A modal form removes friction: one click, name and phone, done.

For powersports and hot tub buyers, **local price and availability** is the #1 question. Buttons that say "Get Today's Local Price" speak their language better than "Contact Us."

### The data
- Sites that use **in-context forms** (popup on the page you're already on) typically see **2–3× more form starts** vs. sending people to a separate contact page.
- One CRM source of truth means your team never loses a lead because it went to an old email inbox or a web form nobody checks.

### How to copy it
1. Build one "Website Form" in GHL.
2. Put `data-ghl-trigger` (or equivalent) on every pricing CTA sitewide.
3. Set the form redirect to your thank-you page (see Section 3).

---

## 2. Inventory Cards That Sell (Not Just List)

### What we did
On the inventory grid, each product card shows:

- **Retail price** (crossed out or labeled "Retail Price")
- **Our price** (your actual offer)
- **Save $X** in green (the dollar difference — very visible)
- A blue button: **"See Local Price & Availability →"**

We removed clutter like long financing disclaimers from the card face. Financing still exists on the site — it just does not compete with the main action.

### Why it matters
Big-ticket buyers compare options fast. If they only see "Call for price," many leave. Showing **retail vs. your price** creates instant value ("I'm already saving $1,000") and gives them a reason to click.

Powersports dealers see the same pattern: MSRP vs. sale price + "Check availability" beats a plain SKU list every time.

### The data
- **Price transparency** on listing pages can lift click-through to product detail or lead forms by **20–40%** vs. "call for pricing" only.
- Highlighting **savings in dollars** ("Save $1,500") outperforms percentage-off alone for items over $5,000 — people feel the win in real money.

### How to copy it
1. Pick 4–8 hero units per category (in-stock, margin-friendly, or fast movers).
2. Show three lines: Retail → Our Price → Save $X.
3. One primary button per card — always the same wording sitewide.

---

## 3. Thank-You Page = Real Conversion Tracking

### What we did
After someone submits the GHL form, they land on **`thank-you.html`** — not back on the homepage.

That page fires:

- **Google Analytics 4:** `generate_lead` event with **$950 value**
- **Meta (Facebook) Pixel:** `Lead` event with **$950 value**
- **Microsoft Clarity:** session continues so you can watch what they did before converting

The thank-you page is set to **noindex** (search engines should not rank it).

### Why it matters
If you only track "page views," Facebook and Google think your best page is the homepage. They optimize for browsers, not buyers.

A dedicated thank-you page tells ad platforms: **"This person became a lead."** That lets their algorithms find more people like them.

The **$950 value** is an estimated average lead value for this business (adjust for yours — e.g., powersports might use $500–$2,000 depending on unit mix).

### The data
- Dealers who switch from "form embed with no thank-you redirect" to a **tracked thank-you page** often see ad platforms stabilize in **2–4 weeks** instead of flying blind.
- Assigning a dollar value to leads improves **ROAS reporting** in Meta and helps Google Smart Bidding if you use it later.

### How to copy it
1. Create `/thank-you.html` with a clear "We got your info" message + phone number.
2. In GHL form settings → Redirect URL → `https://yourdomain.com/thank-you.html`
3. Fire GA4 `generate_lead` and Meta `Lead` on that page only.

---

## 4. Track Every Phone Click (Not Just Form Fills)

### What we did
- Replaced the public store number sitewide with a **tracking number** (`701-714-5879`) that forwards to the real line in GHL.
- Added **`call-tracking.js`** on every page: any click on a `tel:` link records:
  - **GA4:** `click_call` (with source: nav bar, footer, contact page, etc.)
  - **Meta:** `Contact` event
  - **Clarity:** `call_click` event

Phone appears in: top nav "Call Us 24/7," phone badge, mobile menu, footer, contact page, thank-you page.

### Why it matters
**40–60% of dealership leads still come by phone**, especially for $8K–$30K purchases. If you only count form fills, you under-report success and over-cut budget on campaigns that actually drive calls.

A tracking number also tells you which marketing channel the call came from when paired with GHL call tracking.

### The data
- Local service and big-ticket retail: **phone leads often equal or exceed web form leads**.
- Tracking `click_call` separately from `pricing_click` shows you whether people prefer to call vs. fill out a form — so you can put the right CTA first on mobile.

### How to copy it
1. Buy a tracking number in GHL (or CallRail, etc.) → forward to main store line.
2. Put that number everywhere — never mix old and new numbers on the same site.
3. Mark `click_call` as a **conversion** in GA4.

---

## 5. Track "Pricing Intent" Clicks Separately

### What we did
Added **`pricing-tracking.js`** to log every click on:

- `[data-ghl-trigger]` buttons (opens price form)
- `.inv-card-cta` (inventory card buttons)

Events go to **GA4** as `pricing_click` and **Clarity** as `pricing_click`, with labels like `inventory_card`, `primary_cta`, `product_detail`, `financing`, `coupon`.

### Why it matters
Not everyone submits a form on the first visit. **Pricing clicks** are "micro-conversions" — strong signals that someone is shopping seriously.

If you get 200 pricing clicks and 20 form submits, your form or follow-up may be the bottleneck — not your ads.

### The data
- Funnel example: 1,000 visits → 80 pricing clicks (8%) → 24 form submits (30% of clickers) is a healthy pattern.
- If pricing clicks are high but submits are low, fix the form (shorter fields, faster load, trust badges) before spending more on ads.

### How to copy it
1. Tag all "get price" buttons consistently.
2. In GA4, mark `pricing_click` as a secondary conversion.
3. Review weekly: pricing clicks vs. `generate_lead` vs. `click_call`.

---

## 6. Product Pages That Open the Price Form Automatically

### What we did
Inventory and category cards link to product pages with **`?open=price`** in the URL (e.g., `product.html?open=price`).

When that parameter is present, the GHL price modal opens automatically after the page loads.

### Why it matters
The shopper already clicked "See Local Price & Availability." Making them click again on the product page feels like a broken promise.

Auto-opening the form **continues the momentum** from the listing to the lead capture.

### The data
- Each extra click in a funnel loses **~10–25% of people** (classic e-commerce drop-off).
- Removing one click on high-intent paths often lifts form starts **15–30%** on product detail traffic.

### How to copy it
Link listing CTAs to `your-product-url?open=price` and add a small script on product pages to detect that parameter and open the modal.

---

## 7. "Find My Spa" Quiz (Guided Selling)

### What we did
Built **`/find-my-spa/`** — a short quiz (usage, space, budget) that routes visitors to the right category or product instead of dumping them on a generic homepage.

### Why it matters
Many buyers do not know SKUs. They know: *"I want something for cold North Dakota winters"* or *"4 people, small patio."*

A quiz **qualifies them** and makes your site feel like a salesperson, not a catalog. You also learn what they care about before they ever talk to your team.

### The data
- Interactive quizzes on considered-purchase sites often achieve **40–70% completion** when kept to 2–4 questions.
- Quizzed leads typically close at **higher rates** because reps already know fit and budget tier.

### How to copy it
1. Ask 2–3 questions max: product type, party size or use case, rough budget band.
2. End on a category page or specific model + price CTA.
3. Optionally tag quiz completions in GHL for follow-up sequences.

---

## 8. Category Landing Pages (Hot Tubs, Swim Spas, Saunas)

### What we did
Dedicated URLs: `/hot-tubs`, `/swim-spas`, `/saunas` — each with:

- Hero + **"GET TODAY'S LOCAL PRICE"** button
- Featured in-stock units with the same pricing card layout as inventory
- Trust content and secondary CTAs

### Why it matters
Google and Facebook ads work better when the **landing page matches the ad**. "Hot tubs in Minot" should land on `/hot-tubs`, not a generic home page.

Powersports parallel: `/utvs`, `/side-by-sides`, `/snowmobiles` — same idea.

### The data
- **Message match** (ad text = page headline) can improve conversion rates **20–50%** vs. sending all traffic to the homepage.
- Separate URLs also give cleaner analytics per product line.

---

## 9. Announcement Bar + 24/7 Phone in the Nav

### What we did
- Top bar: **"Summer Sale — Hot Tubs & Swim Spas In Stock | Financing as low as $79/month"**
- Nav button: **"Call Us 24/7"** with tracking number always visible (desktop + mobile)

### Why it matters
The announcement bar creates **urgency and financing anchor** without a popup. "In stock" matters in seasonal markets where buyers fear long wait times.

"24/7" does not mean you answer at 3 AM — it means **they can call or leave a message anytime**, which reduces anxiety for people researching after hours.

### The data
- Sticky phone CTAs on mobile can increase **phone click rate by 2–4×** vs. phone number buried in footer only.
- Mentioning financing monthly payment in the hero/bar increases engagement on big-ticket items (anchor effect — "$79/mo" feels approachable vs. "$7,995").

---

## 10. Financing Page With Its Own Form Mode

### What we did
Financing buttons open the same GHL modal but switch to **financing trust copy** (different headline/subtext in the modal shell via `ghl-modal.js`).

Separate tracking label: `financing` on pricing clicks.

### Why it matters
Someone clicking "Financing" has a different mindset than "Get price." They want **payment fit**, not jet count. Matching the message improves trust and submit rate.

### The data
- Splitting **price leads** vs. **financing leads** in CRM lets you route to the right rep or follow-up script.
- Financing-qualified leads for $10K+ units often convert **1.5–2×** vs. unqualified price shoppers when follow-up is tailored.

---

## 11. Delayed Chat Widget (Inventory Page Only)

### What we did
On **`inventory.html` only**, the GHL chat widget loads after **20 seconds** — not immediately on page load.

### Why it matters
Chat popups that appear instantly annoy people who are still comparing units. A delay lets serious shoppers browse first; chat catches the ones still on the page after 20 seconds (high intent).

### The data
- Instant chat can increase **bounce rate** on comparison pages by **5–15%**.
- Delayed chat on high-intent pages often improves **chat engagement quality** (fewer "how much?" typos, more specific questions).

### How to copy it
Load chat script with `setTimeout(..., 20000)` on inventory/listing pages only. Keep instant chat on contact page if you want.

---

## 12. Coupon & Offer Landing Pages

### What we did
Built dedicated offer pages (e.g., **`/hot-tub-offer`**, fair/event pages) with:

- Single focused offer
- GHL form embedded or triggered via button
- TCPA-compliant disclaimer on form
- Same tracking stack (Pixel, GA4, call + pricing scripts)

Fixed a common bug: coupon buttons must be real `<button>` or `[data-ghl-trigger]` elements — not plain links that fail to open the modal when GHL's hidden iframe overlaps the page.

### Why it matters
Event marketing (fair, open house, seasonal sale) needs **one URL** you can put on QR codes, flyers, and Facebook ads. Generic homepage links waste the campaign.

### The data
- Dedicated offer pages for events typically convert **3–5×** better than homepage for offline-to-online traffic (QR codes, radio URLs).
- Compliance disclaimer on forms reduces legal risk for SMS/call follow-up.

---

## 13. Trust Elements Inside the Price Modal

### What we did
The GHL modal shell includes trust bullets before the iframe loads — e.g., local family-owned, in-stock units, financing available. A loading state shows while the form iframe loads (with preconnect to GHL servers for speed).

Also fixed **click interception**: GHL's hidden embed iframe can sit on top of footer buttons; we added logic so clicks on pricing buttons still open the modal.

### Why it matters
Forms that feel slow or broken kill conversions. Trust lines answer "why should I give you my number?" in one glance.

### The data
- Form load delays over **3 seconds** can drop completion rates **~20%**.
- Trust badges near forms lift completion **10–20%** on local service businesses (BBB, reviews, "family owned since…").

---

## 14. Full Measurement Stack (See What Is Working)

### What we did
| Tool | Job |
|------|-----|
| **Google Analytics 4** | Traffic, `pricing_click`, `click_call`, `generate_lead` |
| **Meta Pixel** | Retargeting, `Lead` and `Contact` for ad optimization |
| **Microsoft Clarity** | Session recordings — watch where people rage-click or drop off |
| **GoHighLevel** | CRM, forms, call tracking, follow-up |
| **Looker Studio dashboard** | Owner-friendly weekly view: leads, calls, GBP calls, funnel |
| **Google Business Profile** (via Coupler.io) | Track map listing phone calls separately from website |

Mark these as **conversions in GA4**:
- `generate_lead` (primary — form submit)
- `click_call` (primary — phone intent)
- `pricing_click` (secondary — shopping intent)

### Why it matters
You cannot improve what you do not measure. Most owners look at "website hits" — that number is nearly useless for sales.

The dashboard answers: **How many real leads this week? From ads or organic? Calls or forms? Which page drove them?**

### The data
- Dealers who review a **simple weekly KPI sheet** (leads, calls, cost per lead) grow lead volume **20%+ over 90 days** vs. "set and forget" sites — mainly because they fix what the data shows (slow mobile, weak inventory page, etc.).

Setup guides live in the repo under **`dashboard/`**.

---

## 15. SEO Basics (Free Traffic Layer)

### What we did
- **`sitemap.xml`** — lists all public pages for Google
- **`robots.txt`** — tells crawlers where the sitemap is
- **`thank-you.html`** excluded from index (`noindex`)
- Canonical URLs and page titles per category/product

### Why it matters
Conversion tactics work on top of traffic. Local SEO ("hot tubs Minot ND") brings free visits from people already searching to buy.

### The data
- Local organic traffic for dealer keywords often has **3–5× higher lead rate** than cold social traffic — they are further down the buying path.
- Sitemap + clean URLs speeds up indexing after a site launch (days vs. weeks).

---

## 16. Mobile-First Layout

### What we did
- Hamburger nav with phone badge on mobile
- Full-width inventory cards and tap-friendly CTAs
- Modal form works on small screens

### Why it matters
**60–75% of local dealer traffic is mobile** — often from ads or map listings. If the phone button or form is hard to tap, you lose the lead on the parking lot scroll.

### The data
- Non-mobile-optimized dealer sites lose an estimated **30–50% of potential mobile leads** (industry rule of thumb from Google mobile speed/conversion studies).

---

## Quick Reference: Event Names to Watch Weekly

| Event | Meaning | Priority |
|-------|---------|----------|
| `generate_lead` | Form submitted (thank-you page) | ★★★ Primary |
| `click_call` | Clicked phone number | ★★★ Primary |
| `pricing_click` | Clicked get-price / inventory CTA | ★★ Secondary |
| Meta `Lead` | Same as form — for Facebook ads | ★★★ Primary |
| Meta `Contact` | Phone click — for Facebook ads | ★★ Secondary |
| GBP calls (dashboard) | Calls from Google Maps listing | ★★★ Primary |

**Simple funnel to review every Monday:**

```
Website visits
  → Pricing clicks (shopping intent)
    → Form leads + Phone clicks (actual leads)
      → Appointments / showroom visits (track in CRM)
        → Sold units (track in CRM — the only number that pays the bills)
```

---

## Implementation Checklist (Copy for Your Dealership)

- [ ] One GHL form + pipeline for all web leads
- [ ] Thank-you page with GA4 + Meta conversion events
- [ ] Tracking phone number sitewide (forward to main line)
- [ ] `click_call` and `pricing_click` tracking scripts
- [ ] Inventory cards: Retail / Our Price / Save $X + one blue CTA
- [ ] Product links with auto-open price modal (`?open=price`)
- [ ] Category landing pages matching ad campaigns
- [ ] Optional: Find My [Product] quiz for guided selling
- [ ] Chat delayed 15–20 sec on comparison/inventory pages only
- [ ] GA4 conversions marked; owner dashboard (Looker or similar)
- [ ] GHL tag on form submit (e.g., `website-form`) for reporting
- [ ] sitemap.xml + robots.txt published

---

## Final Word for Owners

Your website is not a brochure. It is a **lead machine** that should work when your showroom is closed.

Every tactic above serves one goal: **make it easy to raise a hand** (price, call, or form) and **prove it with data** so you spend marketing dollars confidently.

Paradise Spas implemented this full stack. Powersports, RV, or pool dealers can use the same playbook — swap product names, adjust lead dollar values, and keep the structure.

---

*Document version: June 2026 · Built from the Paradise Spas website project · Increase ROAS / Start Scale Automate*
