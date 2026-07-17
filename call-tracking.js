(function () {
  function getClickSource(link) {
    if (link.classList.contains('nav-call-cta')) return 'nav_call_bar';
    if (link.classList.contains('nav-phone-badge') || link.classList.contains('mobile-phone-badge')) return 'nav_phone_badge';
    if (link.classList.contains('footer-phone-badge')) return 'footer_phone';
    if (link.classList.contains('contact-phone-link')) return 'contact_page_phone';
    if (link.classList.contains('pd-sidebar-phone')) return 'product_sidebar_phone';
    if (link.classList.contains('btn-phone')) return 'hero_phone_button';
    return link.getAttribute('aria-label') || 'phone_link';
  }

  function trackCallClick(link) {
    var source = getClickSource(link);
    var page = window.location.pathname || '/';

    if (typeof clarity === 'function') {
      clarity('event', 'call_click');
      clarity('set', 'call_click_source', source);
      clarity('set', 'call_click_page', page);
    }

    if (typeof gtag === 'function') {
      gtag('event', 'click_call', {
        event_category: 'engagement',
        event_label: source,
        page_path: page
      });
    }

    if (typeof fbq === 'function') {
      fbq('track', 'Contact');
    }
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="tel:"]');
    if (!link) return;
    trackCallClick(link);
  }, true);
})();
