/**
 * Meta Pixel ViewContent — same contract as view-content.js (agency React sites).
 * Import and call trackViewContent() once on mount in landing/opt-in pages.
 */
export function trackViewContent(contentName: string, contentCategory = 'funnel') {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq('track', 'ViewContent', {
    content_name: contentName,
    content_category: contentCategory
  });
}

/**
 * PowersportsLaunch — paste into MasterclassOptIn.tsx:
 *
 * import { trackViewContent } from '@/lib/view-content';
 *
 * useEffect(() => {
 *   captureUTMs();
 *   trackViewContent('Powersports Business Owner AI Strategy Masterclass', 'masterclass');
 * }, []);
 */
