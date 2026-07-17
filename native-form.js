(function () {
  var DISCLAIMER =
    'By submitting, I consent to receive calls, texts, and emails from Paradise Spas, including automated messages. ' +
    'Consent is not required to purchase. Reply STOP to opt out of texts or call ' +
    '<a href="tel:+17018382614">701-838-2614</a>.';

  function fieldId(prefix, name) {
    return prefix + name;
  }

  function honeypot(prefix) {
    var id = fieldId(prefix, 'website_url');
    return (
      '<div class="inventory-gate-form-honeypot" aria-hidden="true">' +
        '<label for="' + id + '">Website</label>' +
        '<input type="text" id="' + id + '" name="website_url" tabindex="-1" autocomplete="off">' +
      '</div>'
    );
  }

  function productFields(prefix) {
    return (
      '<input type="hidden" name="product_name" id="' + fieldId(prefix, 'product_name') + '" value="">' +
      '<input type="hidden" name="product_category" id="' + fieldId(prefix, 'product_category') + '" value="">' +
      '<input type="hidden" name="estimated_retail_price" id="' + fieldId(prefix, 'estimated_retail_price') + '" value="">' +
      '<input type="hidden" name="our_price" id="' + fieldId(prefix, 'our_price') + '" value="">' +
      '<input type="hidden" name="monthly_payment" id="' + fieldId(prefix, 'monthly_payment') + '" value="">'
    );
  }

  function financingField(prefix, required) {
    var req = required !== false ? ' required' : '';
    var id = fieldId(prefix, 'financing_interest');
    return (
      '<label for="' + id + '">Would you like to apply for financing?</label>' +
      '<select id="' + id + '" name="financing_interest"' + req + '>' +
        '<option value="">Select one&hellip;</option>' +
        '<option value="yes">Yes &mdash; send me financing options</option>' +
        '<option value="maybe">Maybe &mdash; I&rsquo;d like more info</option>' +
        '<option value="no">No &mdash; not right now</option>' +
      '</select>'
    );
  }

  function fairField(prefix, fairName) {
    var id = fieldId(prefix, 'fair_attendance');
    fairName = fairName || 'Red River Valley Fair';
    return (
      '<label for="' + id + '">Are you coming to the ' + fairName + '?</label>' +
      '<select id="' + id + '" name="fair_attendance" required>' +
        '<option value="">Select one&hellip;</option>' +
        '<option value="yes">Yes &mdash; I&rsquo;ll be there</option>' +
        '<option value="maybe">Maybe &mdash; still planning</option>' +
        '<option value="no">No &mdash; can&rsquo;t make it this year</option>' +
      '</select>'
    );
  }

  function contactFields(prefix) {
    return (
      '<label for="' + fieldId(prefix, 'full_name') + '">Full name</label>' +
      '<input type="text" id="' + fieldId(prefix, 'full_name') + '" name="full_name" autocomplete="name" required placeholder="Jane Smith">' +
      '<label for="' + fieldId(prefix, 'email') + '">Email</label>' +
      '<input type="email" id="' + fieldId(prefix, 'email') + '" name="email" autocomplete="email" required placeholder="you@email.com">' +
      '<label for="' + fieldId(prefix, 'phone') + '">Phone</label>' +
      '<input type="tel" id="' + fieldId(prefix, 'phone') + '" name="phone" autocomplete="tel" required placeholder="(701) 555-0100">' +
      '<label for="' + fieldId(prefix, 'message') + '">How can we help?</label>' +
      '<textarea id="' + fieldId(prefix, 'message') + '" name="message" rows="4" placeholder="Tell us what you are looking for"></textarea>'
    );
  }

  function standardFields(prefix) {
    return (
      '<label for="' + fieldId(prefix, 'full_name') + '">Full name</label>' +
      '<input type="text" id="' + fieldId(prefix, 'full_name') + '" name="full_name" autocomplete="name" required placeholder="Jane Smith">' +
      '<label for="' + fieldId(prefix, 'email') + '">Email</label>' +
      '<input type="email" id="' + fieldId(prefix, 'email') + '" name="email" autocomplete="email" required placeholder="you@email.com">' +
      '<label for="' + fieldId(prefix, 'phone') + '">Phone</label>' +
      '<input type="tel" id="' + fieldId(prefix, 'phone') + '" name="phone" autocomplete="tel" required placeholder="(701) 555-0100">'
    );
  }

  function render(container) {
    var source = container.getAttribute('data-lead-source') || 'website-form';
    var submitLabel = container.getAttribute('data-submit-label') || 'Submit';
    var success = container.getAttribute('data-lead-success') || 'thank-you';
    var prefix = container.getAttribute('data-field-prefix') || (source.replace(/[^a-z0-9]+/gi, '-') + '-');
    var errorId = container.getAttribute('data-error-id') || (prefix + 'lead-error');
    var formId = container.getAttribute('data-form-id') || (prefix + 'lead-form');
    var showFinancing = container.getAttribute('data-show-financing') === 'true';
    var showFair = container.getAttribute('data-show-fair') === 'true';
    var showMessage = container.getAttribute('data-show-message') === 'true';
    var showProduct = container.getAttribute('data-show-product') === 'true';
    var financingRequired = container.getAttribute('data-financing-required') !== 'false';
    var fairName = container.getAttribute('data-fair-name') || 'Red River Valley Fair';

    var parts = [
      '<p id="' + errorId + '" class="inventory-gate-form-error paradise-lead-error" hidden></p>',
      '<form class="inventory-gate-form paradise-lead-form" id="' + formId + '" data-paradise-lead-form novalidate',
      ' data-lead-source="' + source + '" data-lead-success="' + success + '">',
      honeypot(prefix)
    ];

    if (showProduct) parts.push(productFields(prefix));
    if (showFair) parts.push(fairField(prefix, fairName));
    if (showFinancing) parts.push(financingField(prefix, financingRequired));
    if (showMessage) parts.push(contactFields(prefix));
    else parts.push(standardFields(prefix));

    parts.push(
      '<div class="inventory-gate-turnstile cf-turnstile" data-theme="light"></div>',
      '<button type="submit">' + submitLabel + '</button>',
      '<p class="inventory-gate-form-disclaimer">' + DISCLAIMER + '</p>',
      '</form>'
    );

    container.innerHTML = parts.join('');
    container.classList.add('is-ready');
  }

  window.ParadiseNativeForm = {
    render: render,
    renderAll: function () {
      document.querySelectorAll('[data-native-form]').forEach(render);
      if (window.ParadiseLeadForm && typeof window.ParadiseLeadForm.bindAll === 'function') {
        window.ParadiseLeadForm.bindAll();
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.ParadiseNativeForm.renderAll);
  } else {
    window.ParadiseNativeForm.renderAll();
  }
})();
