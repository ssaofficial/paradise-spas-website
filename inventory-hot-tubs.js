(function () {
  var ICON_PEOPLE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  var ICON_TARGET = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>';
  var ICON_SPARK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z"/></svg>';

  var ASSET_PREFIX = document.body.dataset.invAssetPrefix || '';
  var CTA_LABEL = document.body.dataset.invCtaLabel || 'See Local Price & Availability';
  var IS_FAIR_PAGE = document.body.classList.contains('inventory-gate-fair');
  var HOT_TUB_PRODUCTS = [
    { badge: 'Budget-Friendly', title: 'Strong Spas G-2 36-Jet Lounger', retail: 10995, our: 9995, monthly: 99, capacity: '4–5 Person', bestUse: 'Lower Payment', benefit: 'Full-Body Lounger', chips: ['budget-friendly', 'loungers'], outcome: 'Best for buyers who want a lower monthly payment and a lounger-style spa without jumping into premium pricing.', image: 'product-strong-g2.png', seats: '4-5' },
    { badge: 'Family Favorite', title: 'Artesian South Seas 748B Deluxe', retail: 13799, our: 11799, monthly: 119, capacity: '6–7 Person', bestUse: 'Family Seating', benefit: 'Strong Therapy', chips: ['family-favorites'], outcome: 'Best for families who want room, comfort, and strong hydrotherapy without going oversized.', image: 'product-artesian-748b.png', seats: '6-7' },
    { badge: 'Most Popular Lounger', title: 'Artesian South Seas 748L Deluxe', retail: 13500, our: 11500, monthly: 115, capacity: '5–6 Person', bestUse: 'Full-Body Lounger', benefit: 'Stress Relief', chips: ['loungers', 'premium-comfort'], outcome: 'Best for people who want a full-body lounge seat and deep relaxation after long workdays.', image: 'product-artesian-748b.png', seats: '6-7' },
    { badge: 'Best Value 7-Seater', title: 'Artesian South Seas 737BE Deluxe', retail: 11995, our: 9995, monthly: 99, capacity: '6–7 Person', bestUse: 'Best Value', benefit: 'Family Nights', chips: ['family-favorites', 'budget-friendly'], outcome: 'Best for families who want a full-size spa with strong therapy at a better value.', image: 'product-artesian-748b.png', seats: '6-7' },
    { badge: 'Compact Therapy Spa', title: 'Artesian South Seas 743D Deluxe', retail: 11495, our: 9495, monthly: 95, capacity: '4–5 Person', bestUse: 'Smaller Patio', benefit: 'Deep Therapy', chips: ['compact-spas'], outcome: 'Best for buyers who want real hydrotherapy without needing the biggest spa on the floor.', image: 'product-artesian-748b.png', seats: '4-5' },
    { badge: 'Couples Lounger', title: 'Artesian South Seas 735L Deluxe', retail: 10995, our: 8995, monthly: 89, capacity: '4–6 Person', bestUse: 'Couples Favorite', benefit: 'Lounge Therapy', chips: ['loungers', 'compact-spas'], outcome: 'Best for couples or smaller families who want a lounger but do not need a huge tub.', image: 'product-artesian-748b.png', seats: '4-5' },
    { badge: 'Open Seating Pick', title: 'Artesian South Seas 735B Deluxe', retail: 10795, our: 8795, monthly: 89, capacity: '5–6 Person', bestUse: 'Open Seating', benefit: 'Easy Entertaining', chips: ['family-favorites'], outcome: 'Best for buyers who want more open seating instead of a lounger taking up space.', image: 'product-artesian-748b.png', seats: '4-5' },
    { badge: 'Small Space Lounger', title: 'Artesian South Seas 532L Deluxe', retail: 12099, our: 10099, monthly: 99, capacity: '2–3 Person', bestUse: 'Tight Spaces', benefit: 'True Lounger', chips: ['compact-spas', 'loungers'], outcome: 'Best for tight spaces where the buyer still wants a true lounger and therapy jets.', image: 'lifestyle-hot-tub.png', seats: '2-3' },
    { badge: 'Premium Compact', title: 'Artesian South Seas 533DL Deluxe', retail: 12199, our: 10199, monthly: 102, capacity: '2–3 Person', bestUse: 'Compact Luxury', benefit: 'Neck & Back Relief', chips: ['compact-spas', 'premium-comfort'], outcome: 'Best for couples, empty nesters, smaller patios, and serious hydrotherapy in a smaller footprint.', image: 'lifestyle-hot-tub.png', seats: '2-3' },
    { badge: 'Premium Family Spa', title: 'Artesian South Seas 860B Deluxe', retail: 14000, our: 12000, monthly: 119, capacity: '6–7 Person', bestUse: 'More Room', benefit: 'No Lounger', chips: ['family-favorites', 'premium-comfort'], outcome: 'Best for families who want a larger open-seating spa without a lounger taking up space.', image: 'product-artesian-748b.png', seats: '6-7' },
    { badge: 'Premium Lounger', title: 'Artesian South Seas 860L Deluxe', retail: 14500, our: 12500, monthly: 125, capacity: '5–6 Person', bestUse: 'Premium Lounger', benefit: 'Bigger Feel', chips: ['loungers', 'premium-comfort'], outcome: 'Best for buyers who want a roomier, more premium lounger experience.', image: 'product-artesian-748b.png', seats: '6-7' },
    { badge: 'First-Time Buyer Pick', title: 'Strong Spas Embark Series', retail: 9999, our: 7999, monthly: 79, capacity: '5–6 Person', bestUse: 'Easy First Spa', benefit: 'Simple Ownership', chips: ['budget-friendly', 'easy-ownership'], outcome: 'Best for first-time buyers who want a simple, dependable spa with fewer decisions.', image: 'product-strong-g2.png', seats: '4-5' },
    { badge: 'Durable Family Pick', title: 'Strong Spas Summit Series', retail: 11995, our: 9995, monthly: 99, capacity: '5–7 Person', bestUse: 'Built Tough', benefit: 'Year-Round Use', chips: ['family-favorites', 'easy-ownership'], outcome: 'Best for buyers who want a durable family spa built for regular year-round use.', image: 'product-strong-g2.png', seats: '6-7' },
    { badge: 'Lowest Payment', title: 'Eco Spa E1', retail: 5995, our: 3995, monthly: 39, capacity: '2–3 Person', bestUse: 'Lowest Payment', benefit: 'Plug & Play', chips: ['budget-friendly', 'compact-spas', 'easy-ownership'], outcome: 'Best for buyers who want the easiest and lowest-payment way to get into a hot tub.', image: 'lifestyle-hot-tub.png', seats: '2-3' },
    { badge: 'Starter Spa', title: 'Eco Spa E2', retail: 6995, our: 4995, monthly: 49, capacity: '2–4 Person', bestUse: 'Starter Spa', benefit: 'Easy Maintenance', chips: ['budget-friendly', 'easy-ownership'], outcome: 'Best for couples and starter buyers who want low maintenance, lower payment, and smaller size.', image: 'lifestyle-hot-tub.png', seats: '2-3' },
    { badge: 'Small Family Value', title: 'Eco Spa E3', retail: 7995, our: 5995, monthly: 59, capacity: '3–5 Person', bestUse: 'Small Family', benefit: 'Low Maintenance', chips: ['budget-friendly', 'family-favorites', 'easy-ownership'], outcome: 'Best for buyers who want more room than a 2-person spa but still want a simple, lower-maintenance option.', image: 'lifestyle-hot-tub.png', seats: '4-5' },
    { badge: 'Easy Family Spa', title: 'Eco Spa E4', retail: 9995, our: 7995, monthly: 79, capacity: '4–5 Person', bestUse: 'Easy Ownership', benefit: 'Family Value', chips: ['family-favorites', 'easy-ownership'], outcome: 'Best for buyers who want an easier-to-own family spa with enough room for everyday use.', image: 'lifestyle-hot-tub.png', seats: '4-5' }
  ];

  function formatMoney(n) {
    return '$' + n.toLocaleString('en-US');
  }

  function pill(label, icon) {
    return '<div class="inv-pill">' + icon + '<span>' + label + '</span></div>';
  }

  function renderCtaLabel(p) {
    if (p && p.fairCta) {
      return p.fairCta + ' <span class="inv-card-cta-arrow" aria-hidden="true">→</span>';
    }
    if (CTA_LABEL.indexOf('DISCOUNTED FAIR PRICE') !== -1) {
      return (
        '<span class="inv-cta-lines">' +
          '<span class="inv-cta-line">FIND OUT DISCOUNTED</span>' +
          '<span class="inv-cta-line">FAIR PRICE <span class="inv-card-cta-arrow" aria-hidden="true">→</span></span>' +
        '</span>'
      );
    }
    return CTA_LABEL + ' <span class="inv-card-cta-arrow" aria-hidden="true">→</span>';
  }

  var fairProductsShuffled = null;

  function shuffleProducts(list) {
    var items = list.slice();
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
    return items;
  }

  function getProducts() {
    if (!IS_FAIR_PAGE) return HOT_TUB_PRODUCTS;
    if (!fairProductsShuffled) fairProductsShuffled = shuffleProducts(FAIR_ONLY_PRODUCTS);
    return fairProductsShuffled;
  }

  var FAIR_ONLY_PRODUCTS = [
    {
      badge: 'Budget-Friendly',
      title: 'Strong Spas G-2B 36-Jet Lounger',
      capacity: '4–5 Person',
      bestUse: '36 Jets',
      benefit: 'Full-Body Lounger',
      outcome: 'Best for shoppers who want a comfortable lounger spa, easy monthly payments, and a practical hot tub that fits the family without overspending.',
      monthly: 79,
      image: 'product-strong-g2b.png',
      seats: '4-5',
      chips: ['budget-friendly', 'loungers'],
      fairFinancingOnly: true,
      fairCta: 'SEE IT IN PERSON AT THE FAIR',
      fairMicro: 'Ask about local delivery, financing, and fair-only availability.'
    },
    {
      badge: 'Budget-Friendly',
      title: 'Strong Spas G-2L Lounger',
      capacity: '4–5 Person',
      bestUse: 'Lounger',
      benefit: 'Easy Payment',
      outcome: 'Best for shoppers who want a simple, comfortable lounger spa with an affordable monthly payment and enough room to relax without buying more hot tub than they need.',
      monthly: 79,
      image: 'product-strong-g2l.png',
      seats: '4-5',
      chips: ['budget-friendly', 'loungers'],
      fairFinancingOnly: true,
      fairCta: 'SEE IT IN PERSON AT THE FAIR',
      fairMicro: 'Fair units are limited — come see it in person before it\'s gone.'
    },
    {
      badge: 'Family Favorite',
      title: 'Ocho Rios CS',
      capacity: '5–6 Person',
      bestUse: 'Open Seating',
      benefit: 'Family Spa',
      outcome: 'Best for families who want an open-seat hot tub with plenty of room to relax, hang out, and enjoy time together without everyone fighting for one lounger seat.',
      monthly: 79,
      image: 'product-ocho-rios-cs.png',
      seats: '6-7',
      chips: ['family-favorites'],
      fairFinancingOnly: true,
      fairCta: 'SEE IT IN PERSON AT THE FAIR',
      fairMicro: 'Fair units are limited — come see it in person before it\'s gone.'
    },
    {
      badge: 'Best Starter Spa',
      title: 'Eco Spa E3',
      capacity: '2–3 Person',
      bestUse: 'Compact Size',
      benefit: 'Easy Ownership',
      outcome: 'Best for couples or first-time hot tub buyers who want something simple, affordable, and easy to own without taking up too much backyard space.',
      monthly: 79,
      image: 'product-eco-spa-e3.png',
      seats: '2-3',
      chips: ['budget-friendly', 'compact-spas', 'easy-ownership'],
      fairFinancingOnly: true,
      fairCta: 'SEE IT IN PERSON AT THE FAIR',
      fairMicro: 'Fair units are limited — come see it in person before it\'s gone.'
    },
    {
      badge: 'Best Value Spa',
      title: 'Eco Spa E5',
      capacity: '4–5 Person',
      bestUse: 'Open Seating',
      benefit: 'Easy Ownership',
      outcome: 'Best for families or couples who want more room than a starter spa, simple upkeep, and an affordable way to enjoy a hot tub at home.',
      monthly: 79,
      image: 'product-eco-spa-e5.png',
      seats: '4-5',
      chips: ['budget-friendly', 'family-favorites', 'easy-ownership'],
      fairFinancingOnly: true,
      fairCta: 'SEE IT IN PERSON AT THE FAIR',
      fairMicro: 'Fair units are limited — come see it in person before it\'s gone.'
    },
    {
      badge: 'Couples Favorite',
      title: 'Eco Spa E4',
      capacity: '3–4 Person',
      bestUse: 'Compact Comfort',
      benefit: 'Easy Ownership',
      outcome: 'Best for couples or smaller families who want a little more room than a starter spa while still keeping the hot tub simple, affordable, and easy to fit at home.',
      monthly: 79,
      image: 'product-eco-spa-e4.png',
      seats: '4-5',
      chips: ['family-favorites', 'easy-ownership', 'compact-spas'],
      fairFinancingOnly: true,
      fairCta: 'SEE IT IN PERSON AT THE FAIR',
      fairMicro: 'Fair units are limited — come see it in person before it\'s gone.'
    },
    {
      badge: 'Premium Lounger',
      title: 'Forsythia',
      capacity: '5–6 Person',
      bestUse: 'Lounger',
      benefit: 'Hydrotherapy',
      outcome: 'Best for buyers who want a more premium hot tub with a full-body lounger, stronger therapy seats, and enough room for family or friends to relax together.',
      monthly: 79,
      image: 'product-forsythia.png',
      seats: '6-7',
      chips: ['loungers', 'premium-comfort'],
      fairFinancingOnly: true,
      fairCta: 'SEE IT IN PERSON AT THE FAIR',
      fairMicro: 'Fair units are limited — come see it in person before it\'s gone.'
    },
    {
      badge: 'Family Comfort',
      title: 'Kona',
      capacity: '5–6 Person',
      bestUse: 'Open Seating',
      benefit: 'Relaxation Spa',
      outcome: 'Best for families who want a roomy, comfortable hot tub for relaxing after work, spending time together, and making the backyard feel more enjoyable year-round.',
      monthly: 79,
      image: 'product-kona.png',
      seats: '6-7',
      chips: ['family-favorites', 'premium-comfort'],
      fairFinancingOnly: true,
      fairCta: 'SEE IT IN PERSON AT THE FAIR',
      fairMicro: 'Fair units are limited — come see it in person before it\'s gone.'
    },
    {
      badge: 'Luxury Family Spa',
      title: 'Nassau Royale',
      capacity: '6–7 Person',
      bestUse: 'Open Seating',
      benefit: 'Premium Comfort',
      outcome: 'Best for families who want a larger, more comfortable hot tub with plenty of room for guests, relaxing nights, and making the backyard feel like a private retreat.',
      monthly: 79,
      image: 'product-nassau-royale.png',
      seats: '6-7',
      chips: ['family-favorites', 'premium-comfort'],
      fairFinancingOnly: true,
      fairCta: 'SEE IT IN PERSON AT THE FAIR',
      fairMicro: 'Fair units are limited — come see it in person before it\'s gone.'
    },
    {
      badge: 'Premium Lounger',
      title: 'Caribbean Breeze',
      capacity: '5–6 Person',
      bestUse: 'Lounger',
      benefit: 'Therapy Seating',
      outcome: 'Best for buyers who want a comfortable lounge seat, strong therapy jets, and enough space for family or friends without going all the way to the largest spa.',
      monthly: 79,
      image: 'product-caribbean-breeze.png',
      seats: '6-7',
      chips: ['loungers', 'premium-comfort'],
      fairFinancingOnly: true,
      fairCta: 'SEE IT IN PERSON AT THE FAIR',
      fairMicro: 'Fair units are limited — come see it in person before it\'s gone.'
    },
    {
      badge: 'Roomy Lounger',
      title: 'Ocean Breeze',
      capacity: '5–6 Person',
      bestUse: 'Lounger',
      benefit: 'Family Comfort',
      outcome: 'Best for families who want a roomy hot tub with a relaxing lounge seat, comfortable therapy, and space to enjoy the backyard together.',
      monthly: 79,
      image: 'product-ocean-breeze.png',
      seats: '6-7',
      chips: ['loungers', 'family-favorites'],
      fairFinancingOnly: true,
      fairCta: 'SEE IT IN PERSON AT THE FAIR',
      fairMicro: 'Fair units are limited — come see it in person before it\'s gone.'
    },
    {
      badge: 'Backyard Favorite',
      title: 'Cabana Bay',
      capacity: '5–6 Person',
      bestUse: 'Open Seating',
      benefit: 'Family Comfort',
      outcome: 'Best for families who want a comfortable, easy-to-enjoy hot tub with open seating, room to relax together, and a backyard upgrade everyone can use.',
      monthly: 79,
      image: 'product-cabana-bay.png',
      seats: '6-7',
      chips: ['family-favorites', 'premium-comfort'],
      fairFinancingOnly: true,
      fairCta: 'SEE IT IN PERSON AT THE FAIR',
      fairMicro: 'Fair units are limited — come see it in person before it\'s gone.'
    },
    {
      badge: 'Relaxation Favorite',
      title: 'Serenity Cove',
      capacity: '5–6 Person',
      bestUse: 'Comfort Seating',
      benefit: 'Relaxation Spa',
      outcome: 'Best for buyers who want a peaceful, comfortable hot tub for relaxing after long days, spending quiet time together, and making home feel more like a retreat.',
      monthly: 79,
      image: 'product-serenity-cove.png',
      seats: '6-7',
      chips: ['premium-comfort', 'family-favorites'],
      fairFinancingOnly: true,
      fairCta: 'SEE IT IN PERSON AT THE FAIR',
      fairMicro: 'Fair units are limited — come see it in person before it\'s gone.'
    },
    {
      badge: 'Peaceful Retreat',
      title: 'Tranquility Harbor',
      capacity: '5–6 Person',
      bestUse: 'Comfort Seating',
      benefit: 'Relaxation Spa',
      outcome: 'Best for buyers who want a calm, comfortable hot tub for relaxing at night, easing stress, and turning the backyard into a quiet place to unwind.',
      monthly: 79,
      image: 'product-tranquility-harbor.png',
      seats: '6-7',
      chips: ['premium-comfort', 'family-favorites'],
      fairFinancingOnly: true,
      fairCta: 'SEE IT IN PERSON AT THE FAIR',
      fairMicro: 'Fair units are limited — come see it in person before it\'s gone.'
    }
  ];

  function renderPriceBox(p) {
    return (
      '<div class="inv-price-box inv-price-box--financing-only">' +
        '<div class="inv-price-left">' +
          '<p class="inv-financing-label">Financing As Low As</p>' +
        '</div>' +
        '<p class="inv-card-monthly">' + formatMoney(p.monthly) + '/mo</p>' +
      '</div>'
    );
  }

  function renderCard(p, index) {
    var cardClass = 'inv-card ht-card' + (p.fairFinancingOnly ? ' ht-card--fair-financing' : '');
    var retailAttr = p.fairFinancingOnly ? '' : (' data-estimated-retail-price="' + p.retail + '"');
    var ourAttr = p.fairFinancingOnly ? '' : (' data-our-price="' + p.our + '"');
    var microCopy = p.fairMicro || 'Ask about local delivery, financing, and availability.';
    var badgeHtml = IS_FAIR_PAGE ? '' : ('<span class="product-tag">' + p.badge + '</span>');

    return (
      '<article class="' + cardClass + '" data-category="Hot Tubs" data-seats="' + p.seats + '" data-monthly="' + p.monthly + '" data-chips="' + p.chips.join(' ') + '" data-original-order="' + index + '">' +
        '<div class="inv-card-img">' +
          badgeHtml +
          '<img src="' + ASSET_PREFIX + p.image + '" alt="' + p.title + '" loading="lazy">' +
        '</div>' +
        '<div class="inv-card-body">' +
          '<div class="inv-card-top">' +
            '<h2 class="inv-card-name">' + p.title + '</h2>' +
            '<hr class="inv-card-divider">' +
            '<div class="inv-card-pills">' +
              pill(p.capacity, ICON_PEOPLE) +
              pill(p.bestUse, ICON_TARGET) +
              pill(p.benefit, ICON_SPARK) +
            '</div>' +
            '<p class="inv-card-outcome">' + p.outcome + '</p>' +
            renderPriceBox(p) +
          '</div>' +
          '<button type="button" class="inv-card-cta" data-ghl-trigger' +
            ' data-product-name="' + p.title + '"' +
            retailAttr +
            ourAttr +
            ' data-monthly-payment="' + p.monthly + '"' +
            ' data-product-category="' + p.chips.join(', ') + '"' +
          '>' + renderCtaLabel(p) + '</button>' +
          '<p class="inv-card-micro">' + microCopy + '</p>' +
        '</div>' +
      '</article>'
    );
  }

  var activeChip = 'all';

  function renderGrid() {
    var grid = document.getElementById('htGrid');
    if (!grid) return;
    grid.innerHTML = getProducts().map(renderCard).join('');
    bindProductTriggers(grid);
    applyChipFilter();
    if (window.refreshInventory) window.refreshInventory();
  }

  function bindProductTriggers(root) {
    var bind = window.ParadiseGhlModal && window.ParadiseGhlModal.bindTrigger;
    if (!bind) return;
    (root || document).querySelectorAll('[data-ghl-trigger]').forEach(bind);
  }

  function applyChipFilter() {
    if (window.refreshInventory) window.refreshInventory();
  }

  function initChips() {
    var wrap = document.getElementById('htChips');
    if (!wrap) return;
    var chips = [
      { id: 'all', label: 'All Hot Tubs' },
      { id: 'family-favorites', label: 'Family Favorites' },
      { id: 'loungers', label: 'Loungers' },
      { id: 'budget-friendly', label: 'Budget-Friendly' },
      { id: 'compact-spas', label: 'Compact Spas' },
      { id: 'easy-ownership', label: 'Easy Ownership' },
      { id: 'premium-comfort', label: 'Premium Comfort' }
    ];
    wrap.innerHTML = chips.map(function (c, i) {
      return '<button type="button" class="ht-chip' + (i === 0 ? ' active' : '') + '" data-chip="' + c.id + '">' + c.label + '</button>';
    }).join('');
    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.ht-chip');
      if (!btn) return;
      activeChip = btn.getAttribute('data-chip');
      wrap.querySelectorAll('.ht-chip').forEach(function (b) { b.classList.toggle('active', b === btn); });
      applyChipFilter();
      if (window.refreshInventory) window.refreshInventory();
    });
  }

  function initHelpCta() {
    var helpBtn = document.getElementById('htHelpCta');
    if (!helpBtn || !window.ParadiseGhlModal) return;
    helpBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.ParadiseGhlModal.open({
        product: {
          name: 'Help Me Pick A Hot Tub',
          retail: '',
          our: '',
          monthly: '',
          category: 'help-me-pick',
          pageUrl: window.location.href
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initChips();
    renderGrid();
    initHelpCta();
    var chipReset = document.querySelector('.ht-chip-reset');
    if (chipReset) {
      chipReset.addEventListener('click', function () {
        var allChip = document.querySelector('.ht-chip[data-chip="all"]');
        if (allChip) allChip.click();
      });
    }
  });

  window.ParadiseHotTubInventory = {
    products: HOT_TUB_PRODUCTS,
    getActiveChip: function () { return activeChip; }
  };
})();
