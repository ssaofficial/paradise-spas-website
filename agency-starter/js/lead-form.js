/**
 * Native lead forms → POST /api/lead
 * Fires GA4 generate_lead + Meta Lead once on GHL success (thank-you page does NOT re-fire).
 */
(function () {
  var body = document.body;
  var defaultApiPath = body.getAttribute('data-lead-api') || '/api/lead';
  var siteKey = body.getAttribute('data-turnstile-site-key') || '';
  var clientPhone = body.getAttribute('data-client-phone') || '';
  var phoneDisplay = clientPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
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

  function getUtmParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      fbclid: params.get('fbclid') || ''
    };
  }

  function leadDedupeKey(email, phone) {
    var e = String(email || '').trim().toLowerCase();
    var p = String(phone || '').replace(/\D/g, '').slice(-10);
    return e + '|' + p;
  }

  function hasRecentBrowserLead(email, phone) {
    try {
      var key = 'agency_lead_dedupe_' + leadDedupeKey(email, phone);
      var ts = parseInt(sessionStorage.getItem(key), 10);
      return ts && Date.now() - ts < 24 * 60 * 60 * 1000;
    } catch (err) {
      return false;
    }
  }

  function markBrowserLead(email, phone) {
    try {
      sessionStorage.setItem('agency_lead_dedupe_' + leadDedupeKey(email, phone), String(Date.now()));
    } catch (err) { /* ignore */ }
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

      var formEmail = (form.querySelector('[name="email"]') || {}).value || '';
      var formPhone = (form.querySelector('[name="phone"]') || {}).value || '';
      if (hasRecentBrowserLead(formEmail, formPhone)) {
        var callMsg = phoneDisplay
          ? 'We already received your info. Please call ' + phoneDisplay + ' if you need help.'
          : 'We already received your info. Please contact us if you need help.';
        showError(form, callMsg);
        return;
      }

      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
      }

      var eventId = createEventId();
      var utm = getUtmParams();
      var payload = {
        source: source,
        submission_id: eventId,
        full_name: (form.querySelector('[name="full_name"]') || {}).value || '',
        email: formEmail,
        phone: formPhone,
        message: (form.querySelector('[name="message"]') || {}).value || '',
        company: (form.querySelector('[name="company"]') || {}).value || '',
        service_interest: (form.querySelector('[name="service_interest"]') || {}).value || '',
        page_url: window.location.href,
        utm_source: utm.utm_source,
        utm_campaign: utm.utm_campaign,
        utm_content: utm.utm_content,
        fbclid: utm.fbclid,
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
            throw new Error(result.data.error || 'Something went wrong. Please try again.');
          }

          hasSucceeded = true;
          markBrowserLead(formEmail, formPhone);
          if (result.data.fire_meta !== false && result.data.ghl_ok && !result.data.duplicate) {
            trackGenerateLead(source, result.data.meta_event_id || eventId);
          }
          handleSuccess(form);
        })
        .catch(function (err) {
          showError(form, err.message || 'Something went wrong. Please try again.');
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
    document.querySelectorAll('[data-lead-form], .lead-form').forEach(bindForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindAll);
  } else {
    bindAll();
  }

  window.LeadForm = { bindAll: bindAll };
})();
