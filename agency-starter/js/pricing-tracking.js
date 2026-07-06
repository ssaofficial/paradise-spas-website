(function () {
  function getPricingSource(element) {
    if (!element) return 'cta_button';
    if (element.classList.contains('btn-quote')) return 'quote_button';
    if (element.classList.contains('btn-primary')) return 'primary_cta';
    if (element.classList.contains('btn-secondary')) return 'secondary_cta';
    if (element.getAttribute('data-cta-track')) return element.getAttribute('data-cta-track');
    return (element.textContent || '').trim().slice(0, 40) || 'pricing_button';
  }

  function trackPricingClick(source, extra) {
    var page = window.location.pathname || '/';
    extra = extra || {};

    if (typeof clarity === 'function') {
      clarity('event', 'pricing_click');
      clarity('set', 'pricing_click_source', source);
      clarity('set', 'pricing_click_page', page);
    }

    if (typeof gtag === 'function') {
      gtag('event', 'pricing_click', {
        click_source: source,
        page_path: page,
        cta_label: extra.label || undefined
      });
    }
  }

  window.TrackPricingClick = trackPricingClick;

  document.addEventListener('click', function (event) {
    var target = event.target.closest('[data-track-pricing], .btn-quote, a[href*="book"]');
    if (!target) return;
    if (target.matches('a[href^="tel:"]')) return;
    trackPricingClick(getPricingSource(target));
  }, true);
})();
