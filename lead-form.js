/**
 * Native lead form → /api/lead (Cloudflare Pages Function)
 * Requires body[data-lead-source] on inventory gate pages.
 */
(function () {
  var form = document.getElementById('paradise-lead-form');
  if (!form) return;

  var body = document.body;
  var source = body.getAttribute('data-lead-source') || 'website-form';
  var apiPath = body.getAttribute('data-lead-api') || '/api/lead';
  var submitBtn = form.querySelector('[type="submit"]');
  var errorEl = document.getElementById('paradise-lead-error');
  var siteKey = body.getAttribute('data-turnstile-site-key') || '';
  var turnstileEl = form.querySelector('.cf-turnstile');
  var LEAD_VALUE = 950;
  var LEAD_CURRENCY = 'USD';

  if (turnstileEl && siteKey) {
    turnstileEl.setAttribute('data-sitekey', siteKey);
  } else if (turnstileEl && !siteKey) {
    turnstileEl.hidden = true;
  }

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

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = !message;
  }

  function trackGenerateLead(eventId) {
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

  function getTurnstileToken() {
    if (!siteKey || !window.turnstile) return '';
    var widget = form.querySelector('.cf-turnstile');
    if (!widget) return '';
    try {
      return window.turnstile.getResponse(widget) || '';
    } catch (err) {
      return '';
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showError('');

    if (siteKey && turnstileEl && !turnstileEl.hidden && !getTurnstileToken()) {
      showError('Please complete the security check.');
      return;
    }

    var consent = form.querySelector('[name="consent"]');
    if (consent && !consent.checked) {
      showError('Please accept the consent statement to continue.');
      return;
    }

    var eventId = createEventId();
    var payload = {
      source: source,
      full_name: (form.querySelector('[name="full_name"]') || {}).value || '',
      email: (form.querySelector('[name="email"]') || {}).value || '',
      phone: (form.querySelector('[name="phone"]') || {}).value || '',
      fair_attendance: (form.querySelector('[name="fair_attendance"]') || {}).value || '',
      financing_interest: (form.querySelector('[name="financing_interest"]') || {}).value || '',
      page_url: window.location.href,
      consent: !!(consent && consent.checked),
      turnstile_token: getTurnstileToken(),
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
          throw new Error(result.data.error || 'Something went wrong. Please call 701-714-5879.');
        }

        trackGenerateLead(result.data.meta_event_id || eventId);

        if (window.ParadiseInventoryGate && typeof window.ParadiseInventoryGate.unlock === 'function') {
          window.ParadiseInventoryGate.unlock();
        }
      })
      .catch(function (err) {
        showError(err.message || 'Something went wrong. Please call 701-714-5879.');
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
})();
