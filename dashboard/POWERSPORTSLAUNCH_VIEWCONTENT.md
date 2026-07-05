# PowersportsLaunch — ViewContent snippet

The PowersportsLaunch React repo is not in this workspace. Paste the following into the live project.

## 1. Create `client/src/lib/view-content.ts`

```typescript
export function trackViewContent(contentName: string, contentCategory = 'funnel') {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq('track', 'ViewContent', {
    content_name: contentName,
    content_category: contentCategory
  });
}
```

## 2. Update `client/src/pages/MasterclassOptIn.tsx`

```typescript
import { trackViewContent } from '@/lib/view-content';

useEffect(() => {
  captureUTMs();
  trackViewContent(
    'Powersports Business Owner AI Strategy Masterclass',
    'masterclass'
  );
}, []);
```

## 3. Optional — other funnel pages

| Page | content_name | content_category |
|------|--------------|------------------|
| `/get-started` | Free Audit Opt-In | funnel |
| `/` | Homepage | website |
| `/book` | Strategy Call Booking | booking |

## Meta Events Manager

After deploy, confirm in **Test Events**:
- `PageView` — every page (existing)
- `ViewContent` — masterclass page load (new)
- `Lead` — form submit only (existing)

Use `ViewContent` audiences for retargeting: *Viewed masterclass page, did not register.*
