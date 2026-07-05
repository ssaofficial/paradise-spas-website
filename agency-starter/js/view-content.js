/**
 * Meta Pixel ViewContent — fires once per page load for retargeting audiences.
 * Load after Meta Pixel init. PageView remains the automatic baseline event.
 */
(function () {
  if (typeof fbq !== 'function') return;

  function run() {
    var body = document.body;
    if (!body) return;

    var contentName = body.getAttribute('data-meta-view-content')
      || (document.title || '').replace(/\s*\|.*$/, '').replace(/\s*—.*$/, '').trim()
      || window.location.pathname;

    var contentCategory = body.getAttribute('data-meta-view-category') || 'website';

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
