(function () {
  var body = document.body;
  var clientName = body.getAttribute('data-client-name') || 'Us';
  var clientPhone = body.getAttribute('data-client-phone') || '';
  var phoneDisplay = clientPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

  function disclaimer() {
    var phoneLine = phoneDisplay
      ? ' Reply STOP to opt out of texts or call <a href="tel:+1' + clientPhone + '">' + phoneDisplay + '</a>.'
      : ' Reply STOP to opt out of texts.';
    return (
      'By submitting, I consent to receive calls, texts, and emails from ' + clientName +
      ', including automated messages. Consent is not required to purchase.' + phoneLine
    );
  }

  function fieldId(prefix, name) {
    return prefix + name;
  }

  function honeypot(prefix) {
    var id = fieldId(prefix, 'website_url');
    return (
      '<div class="lead-form-honeypot" aria-hidden="true">' +
        '<label for="' + id + '">Website</label>' +
        '<input type="text" id="' + id + '" name="website_url" tabindex="-1" autocomplete="off">' +
      '</div>'
    );
  }

  function standardFields(prefix) {
    return (
      '<label for="' + fieldId(prefix, 'full_name') + '">Full name</label>' +
      '<input type="text" id="' + fieldId(prefix, 'full_name') + '" name="full_name" autocomplete="name" required placeholder="Jane Smith">' +
      '<label for="' + fieldId(prefix, 'email') + '">Email</label>' +
      '<input type="email" id="' + fieldId(prefix, 'email') + '" name="email" autocomplete="email" required placeholder="you@email.com">' +
      '<label for="' + fieldId(prefix, 'phone') + '">Phone</label>' +
      '<input type="tel" id="' + fieldId(prefix, 'phone') + '" name="phone" autocomplete="tel" required placeholder="(555) 555-0100">'
    );
  }

  function messageField(prefix) {
    return (
      '<label for="' + fieldId(prefix, 'message') + '">How can we help?</label>' +
      '<textarea id="' + fieldId(prefix, 'message') + '" name="message" rows="4" placeholder="Tell us what you need"></textarea>'
    );
  }

  function companyField(prefix) {
    return (
      '<label for="' + fieldId(prefix, 'company') + '">Company</label>' +
      '<input type="text" id="' + fieldId(prefix, 'company') + '" name="company" autocomplete="organization" placeholder="Your company">'
    );
  }

  function render(container) {
    var source = container.getAttribute('data-lead-source') || 'website-form';
    var submitLabel = container.getAttribute('data-submit-label') || 'Send Message';
    var success = container.getAttribute('data-lead-success') || 'thank-you';
    var prefix = container.getAttribute('data-field-prefix') || (source.replace(/[^a-z0-9]+/gi, '-') + '-');
    var errorId = container.getAttribute('data-error-id') || (prefix + 'lead-error');
    var formId = container.getAttribute('data-form-id') || (prefix + 'lead-form');
    var showMessage = container.getAttribute('data-show-message') !== 'false';
    var showCompany = container.getAttribute('data-show-company') === 'true';

    var parts = [
      '<p id="' + errorId + '" class="lead-form-error" hidden></p>',
      '<form class="lead-form" id="' + formId + '" data-lead-form novalidate',
      ' data-lead-source="' + source + '" data-lead-success="' + success + '">',
      honeypot(prefix),
      standardFields(prefix)
    ];

    if (showCompany) parts.push(companyField(prefix));
    if (showMessage) parts.push(messageField(prefix));

    parts.push(
      '<div class="cf-turnstile" data-theme="light"></div>',
      '<button type="submit">' + submitLabel + '</button>',
      '<p class="lead-form-disclaimer">' + disclaimer() + '</p>',
      '</form>'
    );

    container.innerHTML = parts.join('');
    container.classList.add('is-ready');
  }

  window.NativeForm = {
    render: render,
    renderAll: function () {
      document.querySelectorAll('[data-native-form]').forEach(render);
      if (window.LeadForm && typeof window.LeadForm.bindAll === 'function') {
        window.LeadForm.bindAll();
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.NativeForm.renderAll);
  } else {
    window.NativeForm.renderAll();
  }
})();
