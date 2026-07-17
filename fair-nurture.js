/**
 * Fair nurture inventory page — reviews, product cards, GHL booking embed.
 * Set BOOKING_URL to your GHL calendar / booking link (embed URL).
 */
(function () {
  var BOOKING_URL = ''; // TODO: paste GHL calendar booking link, e.g. https://api.leadconnectorhq.com/widget/booking/YOUR_ID

  /* ========== EDITABLE REVIEWS — paste real Google reviews here ========== */
  var REVIEWS = {
    trust: {
      quote: 'No pressure at all — they answered every question honestly and never pushed us to buy on the spot.',
      name: 'Google reviewer',
      stars: 5,
      tag: 'trust / no pressure'
    },
    service: {
      quote: 'Three years later they still take care of us. Service calls are fast and they actually remember our name.',
      name: 'Google reviewer',
      stars: 5,
      tag: 'after-sale service'
    },
    pain: {
      quote: 'My back hasn\u2019t felt this good in years. I sleep through the night now — didn\u2019t think that was possible.',
      name: 'Google reviewer',
      stars: 5,
      tag: 'pain relief / sleep'
    },
    nightly: {
      quote: 'Ten minutes at the end of the day is my reset button. No phone, no noise — just quiet.',
      name: 'Google reviewer',
      stars: 5,
      tag: 'nightly ritual'
    },
    family: {
      quote: 'Our kids actually put their phones down. It\u2019s the one place everyone ends up together.',
      name: 'Google reviewer',
      stars: 5,
      tag: 'family time'
    },
    dailyUse: {
      quote: 'We\u2019re in it four or five nights a week. It\u2019s not collecting dust — it\u2019s part of our routine.',
      name: 'Google reviewer',
      stars: 5,
      tag: 'daily use'
    },
    final: {
      quote: 'So glad we went with Paradise. James walked us through everything and we felt it before we decided.',
      name: 'Google reviewer',
      stars: 5,
      tag: 'final trust'
    }
  };

  /* ========== EDITABLE PRODUCTS — drop in real models, images, monthly prices ========== */
  var PRODUCTS = [
    {
      name: 'Artesian South Seas 743D Deluxe',
      image: '../product-artesian-748b.png',
      descriptor: 'For aching joints and bad sleep — the therapy-first tub',
      price: 'As low as $95/mo'
    },
    {
      name: 'Artesian South Seas 748B Deluxe',
      image: '../product-artesian-748b.png',
      descriptor: 'For the whole family — room for everyone, built to take teenagers',
      price: 'As low as $119/mo'
    },
    {
      name: 'Artesian South Seas 533DL Deluxe',
      image: '../lifestyle-hot-tub.png',
      descriptor: 'For just the two of you — smaller, premium, done right for two',
      price: 'As low as $102/mo'
    },
    {
      name: 'Strong Spas Summit Series',
      image: '../product-strong-g2.png',
      descriptor: 'For the recovery routine — if you\u2019re building a hot/cold setup',
      price: 'As low as $99/mo'
    }
  ];

  function stars(n) {
    var s = '';
    for (var i = 0; i < n; i++) s += '\u2605';
    return s;
  }

  function renderReview(slot, el) {
    var r = REVIEWS[slot];
    if (!r || !el) return;
    el.innerHTML =
      '<div class="stars" aria-label="' + r.stars + ' out of 5 stars">' + stars(r.stars) + '</div>' +
      '<blockquote>\u201C' + r.quote + '\u201D</blockquote>' +
      '<span class="who">\u2014 ' + r.name + '</span>' +
      '<span class="tag">' + r.tag + '</span>';
  }

  function renderProducts(container) {
    if (!container) return;
    container.innerHTML = PRODUCTS.map(function (p) {
      return (
        '<article class="fair-product-card">' +
          '<div class="fair-product-img-wrap">' +
            '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" width="400" height="300">' +
          '</div>' +
          '<div class="fair-product-body">' +
            '<h4 class="fair-product-name">' + p.name + '</h4>' +
            '<p class="fair-product-desc">' + p.descriptor + '</p>' +
            '<p class="fair-product-price">' + p.price + '</p>' +
            '<a href="#book" class="fair-product-cta">Book a time at the fair &rarr;</a>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderBooking(container) {
    if (!container) return;
    if (BOOKING_URL) {
      container.innerHTML =
        '<iframe class="fair-booking-iframe" src="' + BOOKING_URL + '" title="Book a time at Paradise Spas — Red River Valley Fair" loading="lazy"></iframe>';
      return;
    }
    container.innerHTML =
      '<div class="fair-booking-fallback">' +
        '<p><strong>Calendar link not set yet.</strong> Add your GHL booking URL to <code>BOOKING_URL</code> in <code>fair-nurture.js</code>.</p>' +
        '<p>Until then, call <a href="tel:+17018382614">701-838-2614</a> to book your fair visit.</p>' +
      '</div>';
  }

  function trackBookingClick() {
    if (typeof gtag === 'function') {
      gtag('event', 'pricing_click', {
        click_source: 'fair_booking_cta',
        page_path: window.location.pathname || '/'
      });
    }
    if (typeof clarity === 'function') {
      clarity('event', 'fair_booking_click');
    }
  }

  function bindBookingCtas() {
    document.querySelectorAll('a[href="#book"], .fair-book-cta').forEach(function (link) {
      link.addEventListener('click', function () {
        trackBookingClick();
        if (BOOKING_URL && link.getAttribute('target') === '_blank') {
          window.open(BOOKING_URL, '_blank', 'noopener');
        }
      });
    });
  }

  function init() {
    document.querySelectorAll('[data-review]').forEach(function (el) {
      renderReview(el.getAttribute('data-review'), el);
    });
    renderProducts(document.getElementById('fair-product-grid'));
    renderBooking(document.getElementById('fair-booking-embed'));
    bindBookingCtas();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.ParadiseFairNurture = {
    REVIEWS: REVIEWS,
    PRODUCTS: PRODUCTS,
    BOOKING_URL: BOOKING_URL
  };
})();
