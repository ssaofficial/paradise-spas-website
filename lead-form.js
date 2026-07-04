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

  function trackGenerateLead(source, eventId) {
    if (typeof gtag === 'function') {
      gtag('event', 'generate_lead', {
        event_category: 'engagement',
        event_label: source,
        page_path: window.location.pathname || '/'
      });
    }
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', {
        value: LEAD_VALUE,
        currency: LEAD_CURRENCY,
        content_name: source
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

  function handleSuccess(form) {
    var mode = form.getAttribute('data-lead-success') || 'thank-you';

    if (mode === 'unlock' && window.ParadiseInventoryGate && typeof window.ParadiseInventoryGate.unlock === 'function') {
      window.ParadiseInventoryGate.unlock();
      return;
    }

    if (mode === 'close-modal' && window.ParadiseGhlModal && typeof window.ParadiseGhlModal.close === 'function') {
      window.ParadiseGhlModal.close();
    }

    if (mode === 'thank-you' || mode === 'close-modal') {
      window.location.href = body.getAttribute('data-thank-you-url') || '/thank-you.html';
    }
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
      if (isSubmitting || hasSucceeded) return;
      showError(form, '');

      if (siteKey && turnstileEl && !turnstileEl.hidden && !getTurnstileToken(form)) {
        showError(form, 'Please complete the security check.');
        return;
      }

      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
      }

      var eventId = createEventId();
      var payload = {
        source: source,
        submission_id: eventId,
        full_name: (form.querySelector('[name="full_name"]') || {}).value || '',
        email: (form.querySelector('[name="email"]') || {}).value || '',
        phone: (form.querySelector('[name="phone"]') || {}).value || '',
        message: (form.querySelector('[name="message"]') || {}).value || '',
        fair_attendance: (form.querySelector('[name="fair_attendance"]') || {}).value || '',
        financing_interest: (form.querySelector('[name="financing_interest"]') || {}).value || '',
        product_name: (form.querySelector('[name="product_name"]') || {}).value || '',
        product_category: (form.querySelector('[name="product_category"]') || {}).value || '',
        estimated_retail_price: (form.querySelector('[name="estimated_retail_price"]') || {}).value || '',
        our_price: (form.querySelector('[name="our_price"]') || {}).value || '',
        monthly_payment: (form.querySelector('[name="monthly_payment"]') || {}).value || '',
        page_url: window.location.href,
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
          if (result.data.fire_meta !== false && result.data.ghl_ok && !result.data.duplicate) {
            trackGenerateLead(source, result.data.meta_event_id || eventId);
          }
          handleSuccess(form);
        })
        .catch(function (err) {
          showError(form, err.message || 'Something went wrong. Please call 701-714-5879.');
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
  }

  function bindAll() {
    document.querySelectorAll('[data-paradise-lead-form], #paradise-lead-form').forEach(bindForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindAll);
  } else {
    bindAll();
  }

  window.ParadiseLeadForm = { bindAll: bindAll };
})();
