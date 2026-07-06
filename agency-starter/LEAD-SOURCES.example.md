# Lead Source Catalog — [CLIENT NAME]

Every form uses `data-lead-source`. Map each code to a GHL tag + workflow.

| Page / form | `data-lead-source` | GHL tags (auto) | GHL workflow trigger |
|-------------|-------------------|-----------------|----------------------|
| Contact page | `contact-page` | `website-form`, `lead-api`, `contact-page` | Tag: contact-page |
| Quote modal | `quote-modal` | + `quote-request` | Tag: quote-request |
| Book a call LP | `book-call` | + `book-call` | Tag: book-call |
| Facebook landing page | `lp-facebook` | + `lp-facebook` | Tag: lp-facebook |
| Application / intake | `application` | + `application` | Tag: application |

**GHL contact Source field:** `Website — {source}`

**Custom fields written:**
- `lead_source_page` — full URL
- `contact_message` — message textarea (if shown)
- `company_name` — company field (if shown)
- `service_interest` — service dropdown (if shown)
- `utm_source`, `utm_campaign`, `utm_content`, `fbclid` — from URL params on form submit

Add rows as you add forms. Update `functions/lib/ghl.js` for new tags.
