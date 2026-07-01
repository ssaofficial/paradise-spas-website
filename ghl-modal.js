(function() {
  var overlay = document.getElementById('ghl-overlay');
  if (!overlay) return;

  var closeBtn = document.getElementById('ghl-close');
  var pricingTrust = document.getElementById('ghl-trust-pricing');
  var financingTrust = document.getElementById('ghl-trust-financing');

  function setTrustMode(isFinancing) {
    if (pricingTrust) pricingTrust.hidden = !!isFinancing;
    if (financingTrust) financingTrust.hidden = !isFinancing;
  }

  function getModalForm() {
    return document.getElementById('ghl-modal-lead-form');
  }

  function setFieldValue(form, name, value) {
    var field = form.querySelector('[name="' + name + '"]');
    if (field) field.value = value || '';
  }

  function applyProductToForm(product) {
    var form = getModalForm();
    if (!form || !product || !product.name) return;

    setFieldValue(form, 'product_name', product.name);
    setFieldValue(form, 'product_category', product.category || '');
    setFieldValue(form, 'estimated_retail_price', product.retail || '');
    setFieldValue(form, 'our_price', product.our || '');
    setFieldValue(form, 'monthly_payment', product.monthly || '');

    try {
      sessionStorage.setItem('paradise_lead_product', JSON.stringify(product));
    } catch (err) { /* ignore */ }
  }

  function openModal(options) {
    options = options || {};
    setTrustMode(!!options.financing);

    var titleEl = overlay.querySelector('.ghl-modal-title');
    var subEl = overlay.querySelector('.ghl-modal-sub');
    var productEl = document.getElementById('ghl-product-line');
    var form = getModalForm();
    var trackSource = options.source || (options.financing ? 'financing' : (options.product && options.product.name ? 'product_detail' : 'pricing_modal'));

    if (form) {
      form.setAttribute('data-lead-source', trackSource);
    }

    if (options.product && options.product.name) {
      if (titleEl) titleEl.textContent = 'Check Local Price & Availability';
      if (subEl) {
        subEl.textContent = 'Tell us which model you\u2019re interested in and Paradise Spas will confirm current availability, local pricing, financing options, and delivery details.';
      }
      if (productEl) {
        productEl.textContent = 'Selected model: ' + options.product.name;
        productEl.hidden = false;
      }
      applyProductToForm(options.product);
    } else {
      if (titleEl) titleEl.textContent = 'Get Today\u2019s Local Price';
      if (subEl) subEl.textContent = 'Fill out the form and we\u2019ll get back to you within 2 hours.';
      if (productEl) productEl.hidden = true;
      if (form) {
        ['product_name', 'product_category', 'estimated_retail_price', 'our_price', 'monthly_payment'].forEach(function(name) {
          setFieldValue(form, name, '');
        });
      }
    }

    document.body.classList.add('ghl-modal-open');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');

    if (typeof window.ParadiseTrackPricing === 'function') {
      window.ParadiseTrackPricing(trackSource, {
        productName: options.product && options.product.name ? options.product.name : undefined
      });
    }
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('ghl-modal-open');
    var productEl = document.getElementById('ghl-product-line');
    if (productEl) productEl.hidden = true;
  }

  function bindTrigger(btn) {
    if (btn.dataset.ghlBound === '1') return;
    btn.dataset.ghlBound = '1';
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var isFinancing = btn.classList.contains('btn-financing') || btn.classList.contains('btn-financing-page');
      var product = null;
      if (btn.getAttribute('data-product-name')) {
        product = {
          name: btn.getAttribute('data-product-name'),
          retail: btn.getAttribute('data-estimated-retail-price') || '',
          our: btn.getAttribute('data-our-price') || '',
          monthly: btn.getAttribute('data-monthly-payment') || '',
          category: btn.getAttribute('data-product-category') || '',
          pageUrl: window.location.href
        };
      }
      openModal({ financing: isFinancing, product: product, source: getPricingSource(btn) });
    });
  }

  document.querySelectorAll('[data-ghl-trigger]').forEach(bindTrigger);

  function getPricingSource(element) {
    if (!element) return 'pricing_modal';
    if (element.classList.contains('btn-card')) return 'homepage_slider';
    if (element.classList.contains('btn-financing') || element.classList.contains('btn-financing-page')) return 'financing';
    if (element.classList.contains('btn-coupon-claim')) return 'coupon';
    if (element.classList.contains('btn-primary')) return 'primary_cta';
    if (element.classList.contains('btn-secondary-outline')) return 'secondary_cta';
    return element.textContent.trim().slice(0, 40) || 'pricing_button';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeModal();
    }
  });

  window.ParadiseGhlModal = {
    open: openModal,
    close: closeModal,
    bindTrigger: bindTrigger
  };
})();
