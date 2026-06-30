# Hot Tub Dealer Website Template

Static dealer website built for Paradise Spas (Minot, ND). Use as a starting point for other hot tub / outdoor living clients.

**Live site:** https://www.paradisespas.com  
**Hosting:** Cloudflare Pages

## What's included

- Homepage, inventory, category pages (hot tubs, swim spas, saunas)
- Product detail pages, financing, contact, Find My Spa quiz
- GHL popup + inline forms
- Thank-you page with conversion tracking ($950 Lead event)
- Meta Pixel, GA4, Clarity, call-click tracking

## Quick start (new client)

1. **Duplicate this repo** (or use GitHub template)
2. **Replace branding**
   - `paradiselogo.svg`, `paradiselogofooter.svg`
   - Hero/lifestyle/product images
   - Colors in `style.css` (search for `#0d4cae`, `#F0A500`)
3. **Update business info** across HTML files
   - Phone: search `7018382614` / `701-838-2614`
   - Address, email, Facebook URL
   - Page titles and meta descriptions
4. **GoHighLevel**
   - Form ID: search `iz3wpzwCI9GQhR3wlwbV`
   - Chat widget ID: search `6a428113cf2c64bbfadc2891`
   - Set form redirect to `https://YOURDOMAIN.com/thank-you.html`
5. **Tracking IDs** (in every HTML `<head>`)
   - Meta Pixel: search `1317738110513512`
   - GA4: search `G-E5WGSEGZYP`
   - Clarity: search `xeoe7g20ml`
   - Thank-you page Lead value: search `950` in `thank-you.html`
6. **Deploy to Cloudflare Pages**

```bash
npm install
export CLOUDFLARE_ACCOUNT_ID=your_account_id
npm run deploy
```

Create a new Cloudflare Pages project per client, or change `--project-name` in `package.json`.

## Deploy commands

| Command | Purpose |
|---------|---------|
| `npm run deploy` | Production (main branch) |
| `npm run preview:deploy` | Preview branch |

Requires [Wrangler](https://developers.cloudflare.com/workers/wrangler/) and `CLOUDFLARE_ACCOUNT_ID` set in your environment.

## Key files

| File | Purpose |
|------|---------|
| `style.css` | All styling |
| `ghl-modal.js` | GHL popup modal |
| `call-tracking.js` | GA4 + Clarity call-click events |
| `category-page.js` | Category page interactions |
| `product-page.js` | Product page gallery/tabs |
| `_redirects` | Cloudflare URL redirects |
| `thank-you.html` | Post-form redirect + conversion events |

## Pages

```
index.html
inventory.html
contact.html
financing.html
thank-you.html
hot-tubs/index.html
swim-spas/index.html
saunas/index.html
find-my-spa/index.html
product*.html
```
