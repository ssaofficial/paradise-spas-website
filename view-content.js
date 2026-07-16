/**
 * Meta Pixel ViewContent — fires once per page load for retargeting audiences.
 * PageView still fires separately in the Pixel snippet (automatic traffic baseline).
 *
 * Naming priority:
 * 1. body[data-meta-view-content]
 * 2. Known funnel path map
 * 3. document.title (stripped of site suffix)
 */
(function () {
  if (typeof fbq !== 'function') return;

  var PATH_CONTENT = {
    '/': { name: 'Homepage', category: 'website' },
    '/contact': { name: 'Contact Page', category: 'website' },
    '/financing': { name: 'Financing Page', category: 'website' },
    '/inventory': { name: 'Minot Inventory', category: 'funnel' },
    '/inventoryredrivervalleyfair': { name: 'RRVF Inventory Gate', category: 'funnel' },
    '/inventoryredrivervalleyfair/preview-unlocked': { name: 'RRVF Inventory Unlocked', category: 'funnel' },
    '/inventorystatefair': { name: 'State Fair Inventory Gate', category: 'funnel' },
    '/inventorystatefair/preview-unlocked': { name: 'State Fair Inventory Unlocked', category: 'funnel' },
    '/active-inventory': { name: 'Active Fair Inventory', category: 'funnel' },
    '/redrivervalleyfair': { name: 'Red River Valley Fair', category: 'event' },
    '/hot-tub-offer': { name: 'Hot Tub Offer', category: 'funnel' },
    '/find-my-spa': { name: 'Find My Spa Quiz', category: 'funnel' },
    '/hot-tubs': { name: 'Hot Tubs Category', category: 'catalog' },
    '/swim-spas': { name: 'Swim Spas Category', category: 'catalog' },
    '/saunas': { name: 'Saunas Category', category: 'catalog' },
    '/thank-you': { name: 'Thank You', category: 'funnel' }
  };

  function normalizePath(pathname) {
    var path = (pathname || '/').replace(/\/index\.html$/i, '');
    if (path.length > 1 && path.charAt(path.length - 1) === '/') {
      path = path.slice(0, -1);
    }
    return path || '/';
  }

  function titleFallback() {
    return (document.title || '').replace(/\s*\|.*$/, '').replace(/\s*—.*$/, '').trim();
  }

  function run() {
    var body = document.body;
    if (!body) return;

    var customName = body.getAttribute('data-meta-view-content');
    var customCategory = body.getAttribute('data-meta-view-category');
    var path = normalizePath(window.location.pathname);
    var mapped = PATH_CONTENT[path];

    var contentName = customName || (mapped && mapped.name) || titleFallback() || path;
    var contentCategory = customCategory || (mapped && mapped.category) || 'website';

    fbq('track', 'ViewContent', {
      content_name: contentName,
      content_category: contentCategory
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
