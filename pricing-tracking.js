(function () {
  function getPricingSource(element) {
    if (!element) return 'ghl_modal';
    if (element.classList.contains('inv-card-cta')) return 'inventory_card';
    if (element.classList.contains('category-inv-cta')) return 'category_inventory';
    if (element.classList.contains('pd-cta')) return 'product_detail';
    if (element.classList.contains('btn-card')) return 'homepage_slider';
    if (element.classList.contains('btn-financing') || element.classList.contains('btn-financing-page')) return 'financing';
    if (element.classList.contains('btn-coupon-claim')) return 'coupon';
    if (element.classList.contains('btn-primary')) return 'primary_cta';
    if (element.classList.contains('btn-secondary-outline')) return 'secondary_cta';
    if (element.getAttribute('data-product-name')) return 'product_card';
    return element.textContent.trim().slice(0, 40) || 'pricing_button';
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
        product_name: extra.productName || undefined
      });
    }
  }

  window.ParadiseTrackPricing = trackPricingClick;

  /* Direct link clicks that navigate to a product page with ?open=price */
  document.addEventListener('click', function (event) {
    var target = event.target.closest('.inv-card-cta, .category-inv-cta, a[href*="open=price"]');
    if (!target) return;
    trackPricingClick(getPricingSource(target));
  }, true);
})();
