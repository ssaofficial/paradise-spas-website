/**
 * Native lead forms → POST /api/lead
 * Fires GA4 generate_lead + Meta Lead once on success (thank-you page does NOT re-fire).
 */
(function () {
  var body = document.body;
  var defaultApiPath = body.getAttribute('data-lead-api') || '/api/lead';
  var siteKey = body.getAttribute('data-turnstile-site-key') || '';
  var LEAD_VALUE = parseFloat(body.getAttribute('data-lead-value') || '500') || 500;
  var LEAD_CURRENCY = 'USD';

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : '';
  }

  function createEventId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'lead-' + Date.now() + '-' + Math.random().toString(36).slice(2);
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
    var shell = form.closest('[data-native-form]');
    if (shell) {
      var shellError = shell.querySelector('.lead-form-error');
      if (shellError) return shellError;
    }
    return null;
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
    if (typeof clarity === 'function') {
      clarity('event', 'generate_lead');
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
    var thankYou = body.getAttribute('data-thank-you-url') || '/thank-you.html';

    if (mode === 'inline') return;

    if (mode === 'thank-you') {
      window.location.href = thankYou;
    }
  }

  function bindForm(form) {
    if (form.dataset.leadBound === '1') return;
    form.dataset.leadBound = '1';

    var apiPath = form.getAttribute('data-lead-api') || defaultApiPath;
    var source = form.getAttribute('data-lead-source') || body.getAttribute('data-lead-source') || 'website-form';
    var submitBtn = form.querySelector('[type="submit"]');
    var turnstileEl = setupTurnstile(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showError(form, '');

      if (siteKey && turnstileEl && !turnstileEl.hidden && !getTurnstileToken(form)) {
        showError(form, 'Please complete the security check.');
        return;
      }

      var eventId = createEventId();
      var payload = {
        source: source,
        full_name: (form.querySelector('[name="full_name"]') || {}).value || '',
        email: (form.querySelector('[name="email"]') || {}).value || '',
        phone: (form.querySelector('[name="phone"]') || {}).value || '',
        message: (form.querySelector('[name="message"]') || {}).value || '',
        company: (form.querySelector('[name="company"]') || {}).value || '',
        service_interest: (form.querySelector('[name="service_interest"]') || {}).value || '',
        page_url: window.location.href,
        consent: true,
        turnstile_token: getTurnstileToken(form),
        website_url: (form.querySelector('[name="website_url"]') || {}).value || '',
        meta_event_id: eventId,
        fbp: getCookie('_fbp'),
        fbc: getFbc()
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
      }

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
            throw new Error(result.data.error || 'Something went wrong. Please try again.');
          }
          trackGenerateLead(source, result.data.meta_event_id || eventId);
          handleSuccess(form);
        })
        .catch(function (err) {
          showError(form, err.message || 'Something went wrong. Please try again.');
          if (window.turnstile && siteKey) {
            try { window.turnstile.reset(); } catch (resetErr) { /* ignore */ }
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
          }
        });
    });
  }

  function bindAll() {
    document.querySelectorAll('[data-lead-form], .lead-form').forEach(bindForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindAll);
  } else {
    bindAll();
  }

  window.LeadForm = { bindAll: bindAll };
})();
