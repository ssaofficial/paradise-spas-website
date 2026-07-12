(function () {
  function nav() {
    var btn = document.getElementById('navHamburger');
    var menu = document.getElementById('navMobileMenu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function faqs() {
    document.querySelectorAll('.ai-faq-question').forEach(function (button) {
      button.addEventListener('click', function () {
        var expanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    });
  }

  function productForPage() {
    var slug = document.body.getAttribute('data-product-slug') || '';
    if (window.ActiveInventoryProductBySlug && window.ActiveInventoryProductBySlug[slug]) {
      return window.ActiveInventoryProductBySlug[slug];
    }
    return null;
  }

  function statusConfig(product) {
    var map = window.ActiveInventoryAvailabilityStatus || {};
    return map[(product && product.inventoryStatus) || ''] || map.one_available || {
      productStatusTitle: 'Only 1 fair unit currently available',
      productStatusBody: 'Request today’s fair price, financing options, and current availability.',
      heroPrimaryCta: 'GET TODAY’S FAIR PRICE',
      heroPrimaryHref: '#fair-price-form',
      heroSecondaryCta: 'CHECK FINANCING OPTIONS',
      heroSecondaryHref: '#fair-price-form',
      formHeadlinePrefix: 'Get Today’s Fair Price for ',
      formButton: 'GET TODAY’S FAIR PRICE',
      formIntent: 'Fair Price Request',
      inventoryStatusTag: 'Inventory Status - 1 Available',
      bannerClass: 'available'
    };
  }

  function setHidden(form, name, value) {
    var field = form.querySelector('[name="' + name + '"]');
    if (!field) {
      field = document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      form.appendChild(field);
    }
    field.value = value || '';
  }

  function renderProductHeader(form, product, availability) {
    var existing = form.querySelector('[data-ai-form-product-header]');
    if (!existing) {
      existing = document.createElement('div');
      existing.className = 'ai-form-product-header';
      existing.setAttribute('data-ai-form-product-header', '');
      var honeypot = form.querySelector('.inventory-gate-form-honeypot');
      form.insertBefore(existing, honeypot || form.firstChild);
    }

    existing.innerHTML =
      '<h3>' + (availability.formHeadlinePrefix || 'Get Today&rsquo;s Fair Price for ') + product.fullProductName + '</h3>' +
      '<div class="ai-form-selected-product">' +
        (product.primaryImage ? '<img src="' + product.primaryImage + '" alt="" loading="lazy" decoding="async">' : '') +
        '<div><span>Selected spa:</span><strong>' + product.fullProductName + '</strong><em>' + (availability.productStatusTitle || '') + '</em></div>' +
      '</div>';

    var visibleSelected = document.querySelector('.ai-selected-product');
    if (visibleSelected) {
      visibleSelected.innerHTML = 'Selected spa: <strong>' + product.fullProductName + '</strong>';
    }
  }

  function renderHeroAvailability(availability) {
    var copy = document.querySelector('.ai-product-copy');
    if (!copy) return;
    var existing = copy.querySelector('[data-ai-availability-notice]');
    if (!existing) {
      existing = document.createElement('div');
      existing.setAttribute('data-ai-availability-notice', '');
      var priceCard = copy.querySelector('.ai-price-card');
      copy.insertBefore(existing, priceCard || copy.firstChild);
    }
    existing.className = 'ai-availability-notice ai-availability-notice--' + (availability.bannerClass || 'available');
    existing.innerHTML = '<strong>' + (availability.productStatusTitle || '') + '</strong><p>' + (availability.productStatusBody || '') + '</p>';

    var urgency = copy.querySelector('.ai-urgency');
    if (urgency) {
      urgency.textContent = availability.productStatusTitle || urgency.textContent;
    }

    var primary = copy.querySelector('[data-ai-primary-cta]');
    if (primary) {
      primary.textContent = availability.heroPrimaryCta || primary.textContent;
      primary.setAttribute('href', availability.heroPrimaryHref || '#fair-price-form');
      if (availability.heroPrimaryHref === '/active-inventory/') {
        primary.removeAttribute('data-ai-primary-cta');
      }
    }

    var secondary = copy.querySelector('[data-ai-financing-cta]');
    if (secondary) {
      secondary.textContent = availability.heroSecondaryCta || secondary.textContent;
      secondary.setAttribute('href', availability.heroSecondaryHref || '#fair-price-form');
      if ((availability.heroSecondaryCta || '').indexOf('FINANCING') === -1) {
        secondary.removeAttribute('data-ai-financing-cta');
        secondary.setAttribute('data-ai-primary-cta', '');
      }
    }
  }

  function renderFormAvailability(form, availability) {
    var existing = form.querySelector('[data-ai-form-availability]');
    if (!existing) {
      existing = document.createElement('p');
      existing.className = 'ai-form-availability';
      existing.setAttribute('data-ai-form-availability', '');
      var header = form.querySelector('[data-ai-form-product-header]');
      if (header && header.parentNode === form) {
        header.insertAdjacentElement('afterend', existing);
      } else {
        form.insertBefore(existing, form.firstChild);
      }
    }
    existing.textContent = availability.productStatusTitle || '';
  }

  function formContext() {
    var form = document.querySelector('.ai-lead-form');
    if (!form) return;
    var product = productForPage();
    var availability = statusConfig(product);
    var message = form.querySelector('[data-ai-context]');
    var financing = form.querySelector('[name="financing_interest"]');
    var timestamp = new Date().toISOString();

    if (product) {
      var productPageUrl = product.productPageUrl || window.location.href.split('#')[0];
      form.setAttribute('data-lead-success', 'product-confirmation');
      form.setAttribute('data-active-inventory-product-form', product.slug);
      renderHeroAvailability(availability);
      renderProductHeader(form, product, availability);
      renderFormAvailability(form, availability);
      setHidden(form, 'product_name', product.fullProductName);
      setHidden(form, 'product_slug', product.slug);
      setHidden(form, 'product_id', product.productId || product.slug);
      setHidden(form, 'product_category', product.category || 'Hot Tubs');
      setHidden(form, 'product_page_url', productPageUrl);
      setHidden(form, 'product_image_url', product.primaryImage || '');
      setHidden(form, 'lead_source', product.leadSource || 'Paradise Spas Active Inventory');
      setHidden(form, 'campaign', product.campaign || 'Red River Valley Fair Inventory');
      setHidden(form, 'model_interest_tag', product.ghlTag || ('Model Interest - ' + product.fullProductName));
      setHidden(form, 'inventory_status', product.inventoryStatus || '');
      setHidden(form, 'available_quantity', String(product.availableQuantity || 0));
      setHidden(form, 'inventory_status_tag', availability.inventoryStatusTag || '');
      setHidden(form, 'form_intent', availability.formIntent || product.formIntent || 'Fair Price Request');
      setHidden(form, 'timestamp', timestamp);
      var submit = form.querySelector('[type="submit"]');
      if (submit) submit.textContent = availability.formButton || product.primaryCta || 'GET TODAY’S FAIR PRICE';
    }

    if (message) {
      if (product) {
        message.value = [
          'Requested current Red River Valley Fair pricing for ' + product.fullProductName + ' from the Active Inventory product page.',
          'Product name: ' + product.fullProductName,
          'Product slug: ' + product.slug,
          'Product ID: ' + (product.productId || product.slug),
          'Product page URL: ' + (product.productPageUrl || window.location.href.split('#')[0]),
          'Product image URL: ' + (product.primaryImage || ''),
          'Inventory status: ' + (product.inventoryStatus || ''),
          'Available quantity: ' + String(product.availableQuantity || 0),
          'Inventory status tag: ' + (availability.inventoryStatusTag || ''),
          'Lead source: ' + (product.leadSource || 'Paradise Spas Active Inventory'),
          'Campaign source: ' + (product.campaign || 'Red River Valley Fair Inventory'),
          'Form intent: ' + (availability.formIntent || product.formIntent || 'Fair Price Request'),
          'Submission timestamp: ' + timestamp
        ].join('\n');
      } else {
        message.value = message.value + '\nForm context timestamp: ' + timestamp;
      }
    }
    document.querySelectorAll('[data-ai-primary-cta]').forEach(function (link) {
      link.addEventListener('click', function () {
        if (financing && !financing.value && availability.formIntent === 'Fair Price Request') financing.value = 'maybe';
      });
    });
    document.querySelectorAll('[data-ai-financing-cta]').forEach(function (link) {
      link.addEventListener('click', function () {
        if (financing) financing.value = 'yes';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      nav();
      faqs();
      formContext();
    });
  } else {
    nav();
    faqs();
    formContext();
  }
})();
