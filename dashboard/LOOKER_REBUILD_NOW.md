# Looker Rebuild — Exact Clicks (Paradise Spas)

**Time:** ~20 minutes  
**You need:** Looker Studio open in **Edit** mode, GA4 property `G-E5WGSEGZYP` already connected as a data source.

**Top row KPIs (6 scorecards):**
1. Website visitors (Sessions)
2. Call button taps
3. Pricing clicks
4. Thank-you / form leads
5. *(Later)* Google listing calls
6. *(Later)* GHL form leads

Visitors is **not** fluff — it tells you if ads/SEO are sending traffic. Leads ÷ visitors = your conversion rate. You need both.

---

## PART A — Clear the broken default widgets

1. Open your report: [lookerstudio.google.com](https://lookerstudio.google.com)
2. Click the report **Paradise Spas — Performance Dashboard**
3. Confirm top-right button says **Edit** (you are in edit mode). If it says **View**, click **Edit** first.
4. On the white canvas, **click** the big **Sessions** line chart once (blue border appears).
5. Press **Delete** on your keyboard (or **Edit → Delete** in the top menu).
6. Repeat for every scorecard and table on the page — click it, press **Delete**.
7. **Keep** the **Select date range** dropdown if it is still there. If you deleted it too:
   - Top menu: **Insert** → **Drop-down list** → choose **Date range control**
   - Drag it to the top-left of the page
   - Click the date control → right panel **Setup** → **Default date range** → pick **Last 30 days**

---

## PART B — Add the title (text box)

1. Top menu: **Insert** → **Text**
2. Click anywhere top-center of the canvas
3. Type:
   ```
   Paradise Spas — Performance Dashboard
   ```
4. With the text box still selected, right panel click **Style**
5. Set **Font size** → **24**
6. Set **Font color** → `#0d4cae` (navy)
7. Drag the text box full width at the very top

Optional subtitle: **Insert → Text** → smaller font (14) → `Visitors, calls, pricing clicks, and form leads`

---

## PART C — Scorecard 1: Website visitors

1. Top menu: **Insert** → **Scorecard**
2. Click on the canvas below the date picker (left side)
3. With scorecard selected, look at the **right-hand panel**
4. Click the **Setup** tab (not Style)
5. Under **Data source**, confirm it says your GA4 source (e.g. `Paradise Spas — GA4`). If not, click the dropdown and pick it.
6. Under **Metric**, you will see something like `Record Count` or `Sessions` — click that field name
7. In the search box that opens, type: `Sessions`
8. Click **Sessions** from the list (the GA4 built-in metric)
9. Click the **Style** tab (right panel)
10. Under **Scorecard** → **Primary metric**, find **Show metric name** → turn **ON** if you want the label visible
11. At the top of the Style tab, **Scorecard title** → type: `Website visitors`
12. Resize the scorecard: drag the bottom-right corner to make it roughly 1/6 page width

**No filter needed** on this one — Sessions counts all visits.

---

## PART D — Scorecard 2: Call button taps

1. **Insert** → **Scorecard** → place it to the **right** of Website visitors
2. Right panel **Setup** tab:
3. **Metric** → click current metric → search `Event count` → select **Event count**
4. Scroll down in Setup to section **Filter** (or **Chart filters**)
5. Click **+ Add a filter**
6. Click **Create a filter**
7. Filter name: `click_call only`
8. Click **Select a field** → search `Event name` → select **Event name**
9. Condition dropdown: **Equal to** (should be default)
10. Value box: type exactly `click_call`
11. Click **Save**
12. Make sure that filter is **applied** to this scorecard (checkbox ON)
13. **Style** tab → **Scorecard title** → `Call button taps`

---

## PART E — Scorecard 3: Pricing clicks

1. **Insert** → **Scorecard** → place next to Call button taps
2. **Setup** → **Metric** → **Event count**
3. **Filter** → **+ Add a filter** → **Create a filter**
4. Name: `pricing_click only`
5. Field: **Event name** → **Equal to** → value: `pricing_click`
6. **Save**
7. **Style** → title: `Pricing clicks`

---

## PART F — Scorecard 4: Thank-you / form leads

1. **Insert** → **Scorecard** → place next to Pricing clicks
2. **Setup** → **Metric** → **Event count**
3. **Filter** → **+ Add a filter** → **Create a filter**
4. Name: `generate_lead only`
5. Field: **Event name** → **Equal to** → value: `generate_lead`
6. **Save**
7. **Style** → title: `Form leads (thank-you page)`

---

## PART G — Align the 4 scorecards in one row

1. Hold **Shift** and click each of the 4 scorecards
2. Top toolbar: **Arrange** → **Align** → **Top**
3. **Arrange** → **Distribute** → **Horizontally** (if available)
4. Or manually drag until they line up evenly

Turn on grid: top menu **Theme and layout** → **Layout** → toggle **Grid** → **ON**

---

## PART H — Chart 1: Visitors over time (keep this — it is useful)

1. **Insert** → **Time series chart**
2. Place it below the scorecards, **left half** of page
3. **Setup** tab:
4. **Date dimension** → click field → select **Date**
5. **Metric** → click → select **Sessions**
6. **Style** tab → **Chart title** → `Website visitors (daily)`

This replaces the flat useless chart **only if** you set Metric = Sessions and Dimension = Date. Yours was correct metric but may have had wrong date range or single-day data.

---

## PART I — Chart 2: Lead activity over time

1. **Insert** → **Time series chart**
2. Place below scorecards, **right half** of page (or full width below Chart 1)
3. **Setup** tab:
4. **Date dimension** → **Date**
5. **Metric** → **Event count**
6. **Breakdown dimension** → click **Add dimension** → search **Event name** → select it
7. **Filter** (chart level) → **+ Add a filter** → **Create a filter**
8. Name: `lead events only`
9. Field: **Event name** → condition: **In** (or **IN**)
10. Values: add three lines:
    - `click_call`
    - `pricing_click`
    - `generate_lead`
11. **Save**
12. **Style** → title: `Calls, pricing clicks, and form leads (daily)`

---

## PART J — Table: Where pricing clicks happen

1. **Insert** → **Table**
2. Place at bottom **left**
3. **Setup** tab:
4. **Dimension** → click **Add dimension** → search `Page path` → select **Page path and screen class** OR **Page path + query string**
5. **Metric** → **Event count**
6. **Filter** → **+ Add a filter** → reuse `pricing_click only` OR create new: Event name = `pricing_click`
7. **Sort** → click **Event count** → **Descending**
8. **Style** → title: `Top pages — pricing clicks`
9. **Setup** → scroll to **Rows per page** → **10**

---

## PART K — Table: Where call taps happen

1. **Insert** → **Table**
2. Place bottom **right**
3. Same as Part J but filter **Event name** = `click_call`
4. Title: `Top pages — call taps`

---

## PART L — Theme (professional look)

1. Top menu: **Theme and layout** → **Customize**
2. Panel opens on the right:
3. **Primary color** → click color swatch → type `#0d4cae` → Enter
4. **Accent color** → `#F0A500`
5. **Background** → white
6. Click **Apply** or **Done** (wording varies)
7. **Theme and layout** → **Layout** → **Grid** → **ON**

---

## PART M — Mark conversions in GA4 (fixes "Key events: 0" on old widgets)

You are **not** using Key events scorecards anymore. Still do this so GA4 reports match:

1. Open [analytics.google.com](https://analytics.google.com) in a new tab
2. Bottom-left **Admin** (gear icon)
3. Middle column **Property** → **Events**
4. Find row `click_call` → toggle **Mark as conversion** → ON
5. Repeat for `pricing_click` and `generate_lead`

If events are missing from the list:
1. Open `https://www.paradisespas.com` on your phone
2. Tap **Call Us 24/7** once
3. Tap any **Get Today's Local Price** button once
4. Back in GA4 → **Reports** → **Realtime** → confirm events appear within 60 seconds

---

## PART N — Share with Paradise Spas

1. Back in Looker → top-right click **View** (preview as client sees it)
2. Check all 4 scorecards show numbers (not "No data")
3. Top-right **Share** button
4. **Manage access**
5. **Link access** → change to **Anyone with the link**
6. Role: **Viewer**
7. **Copy link**
8. Send to client

---

## Quick reference — what to click for each scorecard

| Scorecard title | Setup → Metric | Setup → Filter |
|-----------------|----------------|----------------|
| Website visitors | **Sessions** | *(none)* |
| Call button taps | **Event count** | Event name = `click_call` |
| Pricing clicks | **Event count** | Event name = `pricing_click` |
| Form leads | **Event count** | Event name = `generate_lead` |

---

## Why your screenshot looked broken

| What you saw | Exact fix |
|--------------|-----------|
| Key events: 0 | Wrong metric. Use **Event count** + event name filter instead |
| Key events: No data | Same — delete those scorecards |
| Sessions chart flat | Usually fine with low traffic; keep it as **daily Sessions** |
| Random event table | Replace with filtered tables (Parts J & K) |
| Messy layout | Delete all → rebuild in order above → turn **Grid** on |

---

## Later: add Google listing calls + GHL form leads (scorecards 5 & 6)

When Coupler + Google Sheet are connected:

1. **Resource** (top menu) → **Manage added data sources** → confirm GBP + Sheet sources exist
2. **Insert** → **Scorecard**
3. Pick **GBP** data source → metric = call clicks field from Coupler
4. **Insert** → **Scorecard**
5. Pick **Google Sheet** source → metric = SUM of `form_leads`

See [04-looker-layout-share.md](./04-looker-layout-share.md) for field names.
