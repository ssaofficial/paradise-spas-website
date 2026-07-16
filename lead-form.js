/**
 * Native lead forms → /api/lead (Cloudflare Pages Function)
 */
(function () {
  var body = document.body;
  var defaultApiPath = body.getAttribute('data-lead-api') || '/api/lead';
  var siteKey = body.getAttribute('data-turnstile-site-key') || '';
  var LEAD_VALUE = 950;
  var LEAD_CURRENCY = 'USD';

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : '';
  }

  function getTrafficChannel() {
    if (window.ParadiseTraffic && typeof window.ParadiseTraffic.getChannel === 'function') {
      return window.ParadiseTraffic.getChannel();
    }
    return '';
  }

  function getAttribution() {
    if (window.ParadiseTraffic && typeof window.ParadiseTraffic.getAttribution === 'function') {
      return window.ParadiseTraffic.getAttribution();
    }
    return {};
  }

  if (window.ParadiseTraffic && typeof window.ParadiseTraffic.capture === 'function') {
    window.ParadiseTraffic.capture();
  }

  function createEventId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'ps-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  }

  function getFbc() {
    var existing = getCookie('_fbc');
    if (existing) return existing;
    var params = new URLSearchParams(window.location.search);
    var fbclid = params.get('fbclid');
    if (!fbclid) return '';
    return 'fb.1.' + Date.now() + '.' + fbclid;
  }

  function getErrorEl(form) {
    var errorId = form.getAttribute('data-error-id');
    if (errorId) {
      var byId = document.getElementById(errorId);
      if (byId) return byId;
    }
    var shell = form.closest('[data-native-form], .inventory-gate-form-shell');
    if (shell) {
      var shellError = shell.querySelector('.paradise-lead-error, .inventory-gate-form-error');
      if (shellError) return shellError;
    }
    return document.getElementById('paradise-lead-error');
  }

  function showError(form, message) {
    var errorEl = getErrorEl(form);
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = !message;
  }

  function campaignForLeadSource(source) {
    if (source === 'statefair-inventory-gate' || source === 'statefair-in-person-visit') {
      return 'North Dakota State Fair Inventory';
    }
    if (source === 'fair-inventory-gate' || source === 'fair-in-person-visit') {
      return 'Red River Valley Fair Inventory';
    }
    return '';
  }

  function trackGenerateLead(source, eventId, campaign) {
    var contentName = campaign || source;
    if (typeof gtag === 'function') {
      gtag('event', 'generate_lead', {
        event_category: 'engagement',
        event_label: contentName,
        page_path: window.location.pathname || '/'
      });
    }
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', {
        value: LEAD_VALUE,
        currency: LEAD_CURRENCY,
        content_name: contentName,
        content_category: campaign || 'website-form'
      }, {
        eventID: eventId
      });
    }
  }

  function getTurnstileToken(form) {
    if (!siteKey || !window.turnstile) return '';
    var widget = form.querySelector('.cf-turnstile');
    if (!widget) return '';
    try {
      return window.turnstile.getResponse(widget) || '';
    } catch (err) {
      return '';
    }
  }

  function isFairInventoryGateSource(source) {
    return source === 'fair-inventory-gate' || source === 'statefair-inventory-gate';
  }

  function isUnlockForm(form) {
    return form.getAttribute('data-lead-success') === 'unlock';
  }

  function validateFairGateFields(form, source) {
    if (!isFairInventoryGateSource(source)) return '';
    var fairAttendance = (form.querySelector('[name="fair_attendance"]') || {}).value || '';
    if (!fairAttendance) {
      return source === 'statefair-inventory-gate'
        ? 'Please select whether you\'re coming to the North Dakota State Fair.'
        : 'Please select whether you\'re coming to the fair.';
    }
    return '';
  }

  function setupTurnstile(form) {
    var turnstileEl = form.querySelector('.cf-turnstile');
    if (!turnstileEl) return null;
    if (siteKey) {
      turnstileEl.setAttribute('data-sitekey', siteKey);
    } else {
      turnstileEl.hidden = true;
    }
    return turnstileEl;
  }

  function handleSuccess(form, data) {
    var mode = form.getAttribute('data-lead-success') || 'thank-you';

    if (mode === 'unlock' && window.ParadiseInventoryGate && typeof window.ParadiseInventoryGate.unlock === 'function') {
      window.ParadiseInventoryGate.unlock();
      return;
    }

    if (mode === 'fair-in-person-confirmed' && window.FairInPersonModal && typeof window.FairInPersonModal.showConfirmed === 'function') {
      window.FairInPersonModal.showConfirmed();
      return;
    }

    if (mode === 'close-modal' && window.ParadiseGhlModal && typeof window.ParadiseGhlModal.close === 'function') {
      window.ParadiseGhlModal.close();
    }

    if (mode === 'product-confirmation') {
      var productName = (form.querySelector('[name="product_name"]') || {}).value || 'this spa';
      var message = data && data.message
        ? data.message
        : 'Thank you. Your request for the ' + productName + ' has been received. Paradise Spas will contact you with current fair pricing, financing options, and availability.';
      var confirmation = form.querySelector('[data-product-confirmation]');
      if (!confirmation) {
        confirmation = document.createElement('div');
        confirmation.className = 'ai-form-confirmation';
        confirmation.setAttribute('data-product-confirmation', '');
        confirmation.setAttribute('role', 'status');
        confirmation.setAttribute('aria-live', 'polite');
        form.insertBefore(confirmation, form.firstChild);
      }
      confirmation.textContent = message;
      confirmation.hidden = false;
      Array.from(form.elements).forEach(function (field) {
        if (field.type !== 'hidden') field.disabled = true;
      });
      return;
    }

    if (mode === 'thank-you' || mode === 'close-modal') {
      window.location.href = body.getAttribute('data-thank-you-url') || '/thank-you.html';
    }
  }

  function leadDedupeKey(email, phone, source) {
    var e = String(email || '').trim().toLowerCase();
    var p = String(phone || '').replace(/\D/g, '').slice(-10);
    return String(source || 'default') + '|' + e + '|' + p;
  }

  function contactStorageKey() {
    var gateKey = body.getAttribute('data-gate-storage-key') || 'paradise_inventory_unlocked';
    return gateKey + '_contact';
  }

  function saveLeadContact(contact) {
    if (!contact) return;
    try {
      localStorage.setItem(contactStorageKey(), JSON.stringify({
        full_name: contact.full_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        savedAt: Date.now()
      }));
    } catch (err) { /* ignore */ }
  }

  function getSavedLeadContact() {
    try {
      var raw = localStorage.getItem(contactStorageKey());
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || (!data.full_name && !data.email && !data.phone)) return null;
      return data;
    } catch (err) {
      return null;
    }
  }

  function hasRecentBrowserLead(email, phone, source) {
    try {
      var key = 'paradise_lead_dedupe_' + leadDedupeKey(email, phone, source);
      var ts = parseInt(sessionStorage.getItem(key), 10);
      return ts && Date.now() - ts < 24 * 60 * 60 * 1000;
    } catch (err) {
      return false;
    }
  }

  function markBrowserLead(email, phone, source) {
    try {
      sessionStorage.setItem('paradise_lead_dedupe_' + leadDedupeKey(email, phone, source), String(Date.now()));
    } catch (err) { /* ignore */ }
  }

  function bindForm(form) {
    if (form.dataset.leadBound === '1') return;
    form.dataset.leadBound = '1';

    var apiPath = form.getAttribute('data-lead-api') || defaultApiPath;
    var source = form.getAttribute('data-lead-source') || body.getAttribute('data-lead-source') || 'website-form';
    var submitBtn = form.querySelector('[type="submit"]');
    var turnstileEl = setupTurnstile(form);
    var isSubmitting = false;
    var hasSucceeded = false;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (isSubmitting || (hasSucceeded && source !== 'fair-in-person-visit')) return;
      showError(form, '');

      if (siteKey && turnstileEl && !turnstileEl.hidden && !getTurnstileToken(form)) {
        showError(form, 'Please complete the security check.');
        return;
      }

      var formEmail = (form.querySelector('[name="email"]') || {}).value || '';
      var formPhone = (form.querySelector('[name="phone"]') || {}).value || '';
      var formProductSlug = (form.querySelector('[name="product_slug"]') || {}).value || '';
      var activeProductRequest = form.getAttribute('data-lead-success') === 'product-confirmation' || !!formProductSlug;
      var unlockMode = isUnlockForm(form);
      var fairGateError = validateFairGateFields(form, source);
      if (fairGateError) {
        showError(form, fairGateError);
        return;
      }

      if (!unlockMode && !activeProductRequest && source !== 'fair-in-person-visit' && hasRecentBrowserLead(formEmail, formPhone, source)) {
        showError(form, 'We already received your info. Please call 701-714-5879 if you need help.');
        return;
      }

      if (unlockMode && hasRecentBrowserLead(formEmail, formPhone, source)) {
        if (window.ParadiseInventoryGate && typeof window.ParadiseInventoryGate.unlock === 'function') {
          window.ParadiseInventoryGate.unlock();
        }
        return;
      }

      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
      }

      var eventId = createEventId();
      var attribution = getAttribution();
      var campaign = (form.querySelector('[name="campaign"]') || {}).value ||
        campaignForLeadSource(source) ||
        body.getAttribute('data-lead-campaign') ||
        '';
      var payload = {
        source: source,
        submission_id: eventId,
        full_name: (form.querySelector('[name="full_name"]') || {}).value || '',
        email: (form.querySelector('[name="email"]') || {}).value || '',
        phone: (form.querySelector('[name="phone"]') || {}).value || '',
        message: (form.querySelector('[name="message"]') || {}).value || '',
        fair_attendance: (form.querySelector('[name="fair_attendance"]') || {}).value || '',
        fair_visit_day: (form.querySelector('[name="fair_visit_day"]') || {}).value || '',
        fair_visit_date: (form.querySelector('[name="fair_visit_date"]') || {}).value || '',
        fair_visit_time: (form.querySelector('[name="fair_visit_time"]') || {}).value || '',
        financing_interest: (form.querySelector('[name="financing_interest"]') || {}).value || '',
        product_name: (form.querySelector('[name="product_name"]') || {}).value || '',
        product_slug: formProductSlug,
        product_id: (form.querySelector('[name="product_id"]') || {}).value || '',
        product_category: (form.querySelector('[name="product_category"]') || {}).value || '',
        product_page_url: (form.querySelector('[name="product_page_url"]') || {}).value || window.location.href,
        product_image_url: (form.querySelector('[name="product_image_url"]') || {}).value || '',
        inventory_status: (form.querySelector('[name="inventory_status"]') || {}).value || '',
        available_quantity: (form.querySelector('[name="available_quantity"]') || {}).value || '',
        inventory_status_tag: (form.querySelector('[name="inventory_status_tag"]') || {}).value || '',
        lead_source: (form.querySelector('[name="lead_source"]') || {}).value || '',
        campaign: campaign,
        model_interest_tag: (form.querySelector('[name="model_interest_tag"]') || {}).value || '',
        form_intent: (form.querySelector('[name="form_intent"]') || {}).value || '',
        timestamp: (form.querySelector('[name="timestamp"]') || {}).value || new Date().toISOString(),
        estimated_retail_price: (form.querySelector('[name="estimated_retail_price"]') || {}).value || '',
        our_price: (form.querySelector('[name="our_price"]') || {}).value || '',
        monthly_payment: (form.querySelector('[name="monthly_payment"]') || {}).value || '',
        page_url: window.location.href,
        landing_page_url: attribution.landing_page_url || window.location.href,
        referrer_url: attribution.referrer_url || document.referrer || '',
        traffic_channel: attribution.traffic_channel || getTrafficChannel(),
        utm_source: attribution.utm_source || '',
        utm_medium: attribution.utm_medium || '',
        utm_campaign: attribution.utm_campaign || '',
        utm_content: attribution.utm_content || '',
        utm_term: attribution.utm_term || '',
        fbclid: attribution.fbclid || '',
        gclid: attribution.gclid || '',
        msclkid: attribution.msclkid || '',
        consent: true,
        turnstile_token: getTurnstileToken(form),
        website_url: (form.querySelector('[name="website_url"]') || {}).value || '',
        meta_event_id: eventId,
        fbp: getCookie('_fbp'),
        fbc: getFbc()
      };

      fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return { ok: false, error: 'Unexpected server response.' }; })
            .then(function (data) { return { res: res, data: data }; });
        })
        .then(function (result) {
          if (!result.data.ok) {
            throw new Error(result.data.error || 'Something went wrong. Please call 701-714-5879.');
          }

          hasSucceeded = true;
          markBrowserLead(formEmail, formPhone, source);
          if (isFairInventoryGateSource(source) || body.classList.contains('inventory-gate-fair')) {
            saveLeadContact({
              full_name: payload.full_name,
              email: payload.email,
              phone: (form.querySelector('[name="phone"]') || {}).value || ''
            });
          }
          if (result.data.fire_meta !== false && result.data.ghl_ok && !result.data.duplicate) {
            trackGenerateLead(source, result.data.meta_event_id || eventId, campaign);
          }
          handleSuccess(form, result.data);
        })
        .catch(function (err) {
          showError(form, err.message || 'Something went wrong. Please call 701-714-5879.');
          if (source === 'fair-in-person-visit') {
            form.dispatchEvent(new CustomEvent('paradise-lead-error', {
              bubbles: true,
              detail: { message: err.message || 'Something went wrong. Please call 701-714-5879.' }
            }));
          }
          if (window.turnstile && siteKey) {
            try { window.turnstile.reset(); } catch (resetErr) { /* ignore */ }
          }
        })
        .finally(function () {
          isSubmitting = false;
          if (!hasSucceeded && submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
          }
        });
    });

    form._paradiseLeadReset = function () {
      isSubmitting = false;
      hasSucceeded = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
      }
    };
  }

  function bindAll() {
    document.querySelectorAll('[data-paradise-lead-form], #paradise-lead-form').forEach(bindForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindAll);
  } else {
    bindAll();
  }

  window.ParadiseLeadForm = {
    bindAll: bindAll,
    getSavedContact: getSavedLeadContact,
    saveContact: saveLeadContact,
    resetForm: function (formEl) {
      if (formEl && typeof formEl._paradiseLeadReset === 'function') {
        formEl._paradiseLeadReset();
      }
    }
  };
})();
