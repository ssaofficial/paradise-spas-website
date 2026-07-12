(function () {
  if (!document.body.classList.contains('inventory-gate-fair')) return;

  var overlay = document.getElementById('ghl-overlay');
  var wizard = document.getElementById('fair-in-person-wizard');
  if (!overlay || !wizard) return;

  var titleEl = overlay.querySelector('.ghl-modal-title');
  var subEl = overlay.querySelector('.ghl-modal-sub');
  var productEl = document.getElementById('ghl-product-line');
  var trustEl = overlay.querySelector('.ghl-modal-trust');
  var legacyShell = document.getElementById('ghl-form-shell');
  var dayGrid = document.getElementById('fair-in-person-days');
  var timeGrid = document.getElementById('fair-in-person-times');
  var confirmedStep = wizard.querySelector('[data-step="confirmed"]');
  var confirmedCopy = document.getElementById('fair-in-person-confirmed-copy');
  var backDayBtn = document.getElementById('fair-in-person-back-day');
  var errorEl = document.getElementById('fair-in-person-error');
  var form = document.getElementById('fair-in-person-form');

  var state = {
    product: null,
    day: '',
    dayLabel: '',
    time: ''
  };

  var FAIR_START_KEY = '2026-07-03';
  var FAIR_END_KEY = '2026-07-12';
  var FAIR_DAY_LABEL_FORMATTER = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  function todayFairKey() {
    var parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());
    var y = parts.find(function (p) { return p.type === 'year'; }).value;
    var m = parts.find(function (p) { return p.type === 'month'; }).value;
    var d = parts.find(function (p) { return p.type === 'day'; }).value;
    return y + '-' + m + '-' + d;
  }

  function availableDays() {
    var today = todayFairKey();
    var start = today > FAIR_START_KEY ? today : FAIR_START_KEY;
    var days = [];
    var current = new Date(start + 'T12:00:00-05:00');
    var end = new Date(FAIR_END_KEY + 'T12:00:00-05:00');

    while (current <= end) {
      var key = current.toISOString().slice(0, 10);
      days.push({
        value: key,
        label: FAIR_DAY_LABEL_FORMATTER.format(current)
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  }

  function getSavedContact() {
    var saved = window.ParadiseLeadForm && typeof window.ParadiseLeadForm.getSavedContact === 'function'
      ? window.ParadiseLeadForm.getSavedContact()
      : null;

    if (!saved) {
      var gateForm = document.getElementById('paradise-lead-form');
      if (gateForm) {
        saved = {
          full_name: (gateForm.querySelector('[name="full_name"]') || {}).value || '',
          email: (gateForm.querySelector('[name="email"]') || {}).value || '',
          phone: (gateForm.querySelector('[name="phone"]') || {}).value || ''
        };
      }
    }

    if (!saved || (!saved.full_name && !saved.email && !saved.phone)) return null;
    return saved;
  }

  function prefillContact() {
    if (!form) return false;
    var saved = getSavedContact();
    if (!saved) return false;

    var nameInput = form.querySelector('[name="full_name"]');
    var emailInput = form.querySelector('[name="email"]');
    var phoneInput = form.querySelector('[name="phone"]');
    if (nameInput) nameInput.value = saved.full_name || '';
    if (emailInput) emailInput.value = saved.email || '';
    if (phoneInput) phoneInput.value = saved.phone || '';
    return !!(saved.email && saved.phone);
  }

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message || '';
    errorEl.hidden = !message;
  }

  function setTimeChoicesDisabled(disabled) {
    if (!timeGrid) return;
    timeGrid.querySelectorAll('.fair-in-person-choice').forEach(function (btn) {
      btn.disabled = !!disabled;
      btn.setAttribute('aria-busy', disabled ? 'true' : 'false');
    });
  }

  function showStep(name) {
    wizard.querySelectorAll('.fair-in-person-step').forEach(function (step) {
      step.hidden = step.getAttribute('data-step') !== name;
    });
    overlay.classList.toggle('fair-in-person-step--confirmed', name === 'confirmed');
    if (titleEl) titleEl.textContent = name === 'confirmed' ? 'Visit confirmed' : 'See it in person';
    if (subEl) {
      subEl.hidden = name === 'day' || name === 'confirmed';
      if (name === 'time') {
        subEl.hidden = false;
        subEl.textContent = 'What time of day works best on ' + state.dayLabel + '?';
      }
    }
    if (trustEl) trustEl.hidden = true;
    if (productEl && state.product && state.product.name) {
      productEl.hidden = name === 'confirmed';
    }
    if (name !== 'time') showError('');
    if (name !== 'time') setTimeChoicesDisabled(false);
  }

  function setProduct(product) {
    state.product = product || null;
    if (productEl) {
      if (product && product.name) {
        productEl.textContent = 'Selected model: ' + product.name;
        productEl.hidden = false;
      } else {
        productEl.hidden = true;
        productEl.textContent = '';
      }
    }
    var productInput = form && form.querySelector('[name="product_name"]');
    if (productInput) productInput.value = product && product.name ? product.name : '';
    var categoryInput = form && form.querySelector('[name="product_category"]');
    if (categoryInput) categoryInput.value = product && product.category ? product.category : '';
  }

  function renderDays() {
    if (!dayGrid) return;
    var days = availableDays();
    dayGrid.innerHTML = days.map(function (day) {
      return (
        '<button type="button" class="fair-in-person-choice" data-day-value="' + day.value + '" data-day-label="' + day.label + '">' +
          day.label +
        '</button>'
      );
    }).join('');
  }

  function resetWizard() {
    state.day = '';
    state.dayLabel = '';
    state.time = '';
    showError('');
    if (form) {
      form.reset();
      if (window.ParadiseLeadForm && typeof window.ParadiseLeadForm.resetForm === 'function') {
        window.ParadiseLeadForm.resetForm(form);
      }
    }
    renderDays();
    showStep('day');
  }

  function submitVisit() {
    if (!form) return;

    if (!prefillContact()) {
      showError('Unlock inventory first so we know who to expect at the fair.');
      setTimeChoicesDisabled(false);
      return;
    }

    setTimeChoicesDisabled(true);
    showError('');

    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }

  function open(options) {
    options = options || {};
    if (legacyShell) legacyShell.hidden = true;
    wizard.hidden = false;
    resetWizard();
    setProduct(options.product);

    document.body.classList.add('ghl-modal-open');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');

    if (typeof window.ParadiseTrackPricing === 'function') {
      window.ParadiseTrackPricing('fair_in_person', {
        productName: options.product && options.product.name ? options.product.name : undefined
      });
    }
  }

  function close() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('ghl-modal-open');
    if (productEl) productEl.hidden = true;
  }

  function showConfirmed() {
    setTimeChoicesDisabled(false);
    if (confirmedCopy) {
      confirmedCopy.innerHTML =
        'You&rsquo;re all set for <strong>' + state.dayLabel + '</strong> in the <strong>' +
        (state.time === 'morning' ? 'morning' : 'afternoon') + '</strong>.' +
        ' We&rsquo;ll send you a reminder before your visit. If this tub sells before then, we&rsquo;ll update you right away.';
    }
    showStep('confirmed');
  }

  if (dayGrid) {
    dayGrid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-day-value]');
      if (!btn) return;
      state.day = btn.getAttribute('data-day-value');
      state.dayLabel = btn.getAttribute('data-day-label');
      var dayInput = form && form.querySelector('[name="fair_visit_day"]');
      var dateInput = form && form.querySelector('[name="fair_visit_date"]');
      if (dayInput) dayInput.value = state.dayLabel;
      if (dateInput) dateInput.value = state.day;
      showStep('time');
    });
  }

  if (timeGrid) {
    timeGrid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-time-value]');
      if (!btn || btn.disabled) return;
      state.time = btn.getAttribute('data-time-value');
      var timeInput = form && form.querySelector('[name="fair_visit_time"]');
      if (timeInput) timeInput.value = state.time;
      submitVisit();
    });
  }

  if (backDayBtn) {
    backDayBtn.addEventListener('click', function () { showStep('day'); });
  }

  if (form) {
    form.setAttribute('data-lead-success', 'fair-in-person-confirmed');
    form.addEventListener('paradise-lead-error', function (e) {
      setTimeChoicesDisabled(false);
      if (e.detail && e.detail.message) showError(e.detail.message);
    });
    if (window.ParadiseLeadForm && typeof window.ParadiseLeadForm.bindAll === 'function') {
      window.ParadiseLeadForm.bindAll();
    }
  }

  var doneBtn = document.getElementById('fair-in-person-done');
  if (doneBtn) {
    doneBtn.addEventListener('click', close);
  }

  window.FairInPersonModal = {
    open: open,
    close: close,
    reset: resetWizard,
    showConfirmed: showConfirmed,
    isFairPage: true
  };
})();
