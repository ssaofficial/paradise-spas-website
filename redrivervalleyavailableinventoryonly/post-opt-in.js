(function () {
  var ROUTE = '/redrivervalleyavailableinventoryonly/';
  var CAMPAIGN = 'rrvf_2026';
  var PHONE = '7017145879';
  var PHONE_DISPLAY = '701-714-5879';
  var BOOKING_URL = '';

  var STORAGE_UNLOCK_KEY = 'paradise_rrvf_inventory_unlocked';
  var STORAGE_UNLOCK_TS = STORAGE_UNLOCK_KEY + '_at';
  var INVENTORY_PATH = '/inventoryredrivervalleyfair/?inventory_unlocked=1';

  function unlockFairInventory() {
    try {
      localStorage.setItem(STORAGE_UNLOCK_KEY, '1');
      localStorage.setItem(STORAGE_UNLOCK_TS, String(Date.now()));
    } catch (e) { /* ignore */ }
  }

  var SMS = {
    matches: 'Hi Paradise, I requested fair pricing. Please text me 2-3 hot tub matches.',
    directions: "Hi Paradise, I'm coming to the fair. Please send booth directions.",
    cantAttend: "Hi Paradise, I can't make the fair. Please send my best options by text.",
    times: 'Hi Paradise, please text me available fair visit times.',
    callFirst: 'Hi Paradise, please text me before calling about fair pricing.',
    showroom: 'Hi Paradise, I cannot make the fair. Please help me book a showroom visit during fair week.',
    fullInventory: 'Hi Paradise, please send me the full fair inventory list.',
    phoneCall: 'Hi Paradise, please call me about fair pricing options.'
  };

  var PRIMARY = [
    { id: 'coming_to_fair', label: 'I’m coming to the fair', desc: 'Send me booth details and what to see first.' },
    { id: 'text_best_options', label: 'Text me the best options', desc: 'Send 2–3 tubs that fit what I’m looking for.' },
    { id: 'monthly_payment', label: 'Show me tubs by monthly payment', desc: 'Start with a realistic payment range.' },
    { id: 'help_choose', label: 'Help me pick the right tub', desc: 'I’m not sure what size, features, or model makes sense.' },
    { id: 'cant_make_fair', label: 'I can’t make the fair', desc: 'Help me shop the fair-week options remotely.' },
    { id: 'call_before_coming', label: 'Call me before I come', desc: 'I’d rather talk to someone first.' }
  ];

  var DONE_COPY = {
    coming_to_fair: 'We’ll text booth directions, fair hours, and 2–3 tubs to look at before you arrive.',
    text_best_options: 'We’ll text 2–3 good matches instead of the whole lineup.',
    monthly_payment: 'We’ll focus on tubs that fit your payment range first.',
    help_choose: 'We’ll text a short list based on what you told us — not just the most expensive tub.',
    cant_make_fair: 'We’ll help you shop the fair-week options remotely.',
    call_before_coming: 'Watch for a call or text from Paradise Spas.',
    book_fair_visit: 'Watch for a text with fair visit times.'
  };

  var state = {
    primary: null,
    secondary: null,
    helpIntent: null,
    stepIndex: 0,
    totalSteps: 2,
    history: []
  };

  function smsLink(body) {
    return 'sms:' + PHONE + '?body=' + encodeURIComponent(body);
  }

  function telLink() {
    return 'tel:+1' + PHONE;
  }

  function track(event, payload) {
    payload = payload || {};
    payload.campaign = CAMPAIGN;
    payload.route = ROUTE;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, payload));
    if (typeof gtag === 'function') gtag('event', event, payload);
    if (typeof clarity === 'function') clarity('event', event);
  }

  function saveChoice(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function setProgress() {
    var pct = Math.round(((state.stepIndex + 1) / state.totalSteps) * 100);
    var text = document.getElementById('poSurveyStepText');
    var fill = document.getElementById('poSurveyProgressFill');
    if (text) text.textContent = 'Step ' + (state.stepIndex + 1) + ' of ' + state.totalSteps;
    if (fill) fill.style.width = pct + '%';
  }

  function markSelectedChoice(el) {
    document.querySelectorAll('#poSurveyStage .po-choice').forEach(function (c) {
      c.classList.remove('po-choice--selected');
      c.setAttribute('aria-pressed', 'false');
    });
    if (!el) return;
    el.classList.add('po-choice--selected');
    el.setAttribute('aria-pressed', 'true');
  }

  function choiceCardHtml(opt, tag, attrs) {
    var html = '<' + tag + ' ' + attrs + '>';
    html += '<span class="po-choice__body">';
    html += '<span class="po-choice__title">' + opt.label + '</span>';
    if (opt.desc) html += '<span class="po-choice__desc">' + opt.desc + '</span>';
    html += '</span>';
    html += '<span class="po-choice__arrow" aria-hidden="true"><span class="po-choice__arrow-icon">→</span></span>';
    html += '</' + tag + '>';
    return html;
  }

  function renderStage(html) {
    var stage = document.getElementById('poSurveyStage');
    if (!stage) return;
    stage.classList.remove('po-survey-stage--in');
    stage.innerHTML = html;
    requestAnimationFrame(function () {
      stage.classList.add('po-survey-stage--in');
    });
  }

  function renderQuestion(question, subtitle, options, opts) {
    opts = opts || {};
    var html = '<h2 class="po-survey-q">' + question + '</h2>';
    if (subtitle) html += '<p class="po-survey-sub">' + subtitle + '</p>';
    if (opts.disclosure) html += '<p class="po-disclosure">' + opts.disclosure + '</p>';

    if (BOOKING_URL && opts.booking) {
      html += '<iframe class="po-booking-frame" src="' + BOOKING_URL + '" title="Book a fair visit" loading="lazy"></iframe>';
    } else if (opts.booking) {
      html += '<p class="po-survey-sub">Online booking is being finalized. Pick a time below and we’ll confirm by text, or call Paradise.</p>';
    }

    html += '<div class="po-choices po-choices--survey" role="group">';
    options.forEach(function (opt) {
      var tag = opt.href ? 'a' : 'button';
      var compact = !opt.desc ? ' po-choice--compact' : '';
      var pressed = ' aria-pressed="false"';
      var attrs = tag === 'a'
        ? 'href="' + opt.href + '" class="po-choice po-choice--link' + compact + '"' + pressed
        : 'type="button" class="po-choice' + compact + '" data-opt="' + opt.id + '"' + pressed;
      html += choiceCardHtml(opt, tag, attrs);
    });
    html += '</div>';
    html += '<p class="po-survey-reassure">No pressure — this just helps us send the right fair options first.</p>';
    renderStage(html);

    document.querySelectorAll('#poSurveyStage [data-opt]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        markSelectedChoice(btn);
        var id = btn.getAttribute('data-opt');
        window.setTimeout(function () { handleOption(id); }, 140);
      });
    });

    document.querySelectorAll('#poSurveyStage .po-choice--link').forEach(function (link) {
      link.addEventListener('click', function () {
        markSelectedChoice(link);
        track('post_optin_secondary_click', {
          primary_choice: state.primary,
          secondary_choice: 'link_action'
        });
        if (state.primary === 'call_before_coming' || state.primary === 'cant_make_fair') {
          setTimeout(function () { finishSurvey(state.primary); }, 400);
        }
      });
    });
  }

  function updateBack() {
    var back = document.getElementById('poSurveyBack');
    if (!back) return;
    back.hidden = state.history.length === 0;
  }

  function pushHistory(fn) {
    state.history.push(fn);
    updateBack();
  }

  function goBack() {
    if (!state.history.length) return;
    var prev = state.history.pop();
    updateBack();
    prev();
  }

  function showQ1() {
    state.stepIndex = 0;
    state.totalSteps = 2;
    state.primary = null;
    state.secondary = null;
    state.helpIntent = null;
    setProgress();
    renderQuestion(
      'What’s the easiest way for us to help you choose?',
      'We already have your info — just pick one.',
      PRIMARY.map(function (p) {
        return { id: p.id, label: p.label, desc: p.desc };
      })
    );
  }

  function handlePrimary(id) {
    state.primary = id;
    saveChoice('rrvf_post_optin_choice', id);
    track('post_optin_choice_click', { choice: id });
    state.totalSteps = id === 'coming_to_fair' ? 3 : 2;
    pushHistory(showQ1);
    showFollowUp(id);
  }

  function handleOption(id) {
    if (!state.primary) {
      handlePrimary(id);
      return;
    }
    state.secondary = id;
    saveChoice('rrvf_post_optin_secondary_choice', id);
    track('post_optin_secondary_click', {
      primary_choice: state.primary,
      secondary_choice: id
    });

    if (state.primary === 'help_choose' && !state.helpIntent) {
      state.helpIntent = id;
      pushHistory(function () { showFollowUp('help_choose'); });
      showHelpSeats();
      return;
    }

    if (state.primary === 'coming_to_fair' && state.stepIndex === 1) {
      pushHistory(function () { showFollowUp('coming_to_fair'); });
      showBooking();
      return;
    }

    if (state.primary === 'coming_to_fair' && state.stepIndex === 2) {
      finishSurvey('book_fair_visit');
      return;
    }

    if (state.primary === 'cant_make_fair' && id === 'monthly_opts') {
      pushHistory(function () { showFollowUp('cant_make_fair'); });
      state.primary = 'monthly_payment';
      showFollowUp('monthly_payment');
      return;
    }

    finishSurvey(state.primary);
  }

  function showFollowUp(id) {
    state.stepIndex = 1;
    setProgress();

    if (id === 'coming_to_fair') {
      renderQuestion('When are you most likely stopping by?', null, [
        { id: 'today', label: 'Today' },
        { id: 'tomorrow', label: 'Tomorrow' },
        { id: 'weekday_evening', label: 'Weekday evening' },
        { id: 'fri_sun', label: 'Friday–Sunday' },
        { id: 'not_sure', label: 'Not sure yet' }
      ]);
      return;
    }

    if (id === 'text_best_options') {
      renderQuestion('What matters most?', 'We’ll text 2–3 matches — not the whole list.', [
        { id: 'best_payment', label: 'Best monthly payment' },
        { id: 'pain_sleep', label: 'Pain relief / better sleep' },
        { id: 'family_time', label: 'Family time' },
        { id: 'cold_weather', label: 'Cold-weather use' },
        { id: 'low_maint', label: 'Low maintenance' },
        { id: 'small_tub', label: 'Smaller tub for 2–3 people' },
        { id: 'large_tub', label: 'Larger tub for 5–6+ people' }
      ]);
      return;
    }

    if (id === 'monthly_payment') {
      renderQuestion('What monthly range feels comfortable to start with?', null, [
        { id: '79_119', label: 'Around $79–$119/mo' },
        { id: '120_159', label: 'Around $120–$159/mo' },
        { id: '160_199', label: 'Around $160–$199/mo' },
        { id: '200_plus', label: '$200+/mo if it’s the right tub' },
        { id: 'total_price', label: 'I’d rather see total price' },
        { id: 'not_sure', label: 'Not sure yet' }
      ], {
        disclosure: 'Starting ranges only — exact payments depend on model, term, credit, taxes, delivery, and down payment.'
      });
      return;
    }

    if (id === 'help_choose') {
      renderQuestion('What are you mainly hoping the tub does for you?', null, [
        { id: 'pain_sleep', label: 'Help with aches, pain, or sleep' },
        { id: 'family', label: 'Get the family together more' },
        { id: 'winter', label: 'Make winter easier' },
        { id: 'backyard', label: 'Upgrade the backyard' },
        { id: 'maintenance', label: 'Keep maintenance simple' },
        { id: 'replace', label: 'Replace an old tub' },
        { id: 'starting', label: 'I’m just starting to look' }
      ]);
      return;
    }

    if (id === 'cant_make_fair') {
      renderQuestion('How should we help you shop remotely?', 'Fair-week pricing still applies.', [
        { id: 'text_matches', label: 'Text me 2–3 best matches', href: smsLink(SMS.cantAttend) },
        { id: 'phone_call', label: 'Book a quick phone call', href: smsLink(SMS.phoneCall) },
        { id: 'showroom', label: 'Book a showroom visit', href: smsLink(SMS.showroom) },
        { id: 'monthly_opts', label: 'Show me monthly payment options' },
        { id: 'full_inv', label: 'Send me the full inventory', href: smsLink(SMS.fullInventory) }
      ]);
      return;
    }

    if (id === 'call_before_coming') {
      renderQuestion('When should Paradise reach out?', null, [
        { id: 'call_now', label: 'Call ' + PHONE_DISPLAY, href: telLink() },
        { id: 'asap', label: 'Call me as soon as possible', href: smsLink(SMS.phoneCall) },
        { id: 'afternoon', label: 'Call me this afternoon', href: smsLink('Hi Paradise, please call me this afternoon about fair pricing.') },
        { id: 'evening', label: 'Call me this evening', href: smsLink('Hi Paradise, please call me this evening about fair pricing.') },
        { id: 'text_first', label: 'Text me first', href: smsLink(SMS.callFirst) }
      ]);
    }
  }

  function showHelpSeats() {
    state.stepIndex = 1;
    setProgress();
    renderQuestion('How many people should it comfortably fit?', null, [
      { id: 'seats_23', label: '2–3' },
      { id: 'seats_45', label: '4–5' },
      { id: 'seats_6plus', label: '6+' },
      { id: 'seats_unsure', label: 'Not sure' }
    ]);
  }

  function showBooking() {
    state.stepIndex = 2;
    state.totalSteps = 3;
    setProgress();
    pushHistory(function () { showFollowUp('coming_to_fair'); });
    renderQuestion(
      'Pick a quick time to stop by the Paradise Spas booth.',
      'A quick stop — not a long sales appointment. Someone will point you to the right tubs and answer payment questions.',
      [
        { id: 'today_gates', label: 'Today after gates open' },
        { id: 'tomorrow_afternoon', label: 'Tomorrow afternoon' },
        { id: 'fri_sun_morning', label: 'Friday–Sunday morning' },
        { id: 'fri_sun_evening', label: 'Friday–Sunday evening' },
        { id: 'text_times', label: 'Text me available times', href: smsLink(SMS.times) }
      ],
      { booking: true }
    );
  }

  function resetSurveyView() {
    var screen = document.getElementById('poSurveyScreen');
    var done = document.getElementById('poSurveyDone');
    if (screen) screen.hidden = false;
    if (done) done.hidden = true;
    document.body.classList.add('po-page--survey-only');
    document.body.classList.remove('po-page--done');
  }

  function restartSurvey() {
    state.history = [];
    updateBack();
    resetSurveyView();
    showQ1();
  }

  function finishSurvey(doneKey) {
    unlockFairInventory();
    var screen = document.getElementById('poSurveyScreen');
    var done = document.getElementById('poSurveyDone');
    var msg = document.getElementById('poDoneMessage');
    if (screen) screen.hidden = true;
    if (done) done.hidden = false;
    if (msg) {
      msg.textContent = (DONE_COPY[doneKey] || DONE_COPY.text_best_options) +
        ' Tap below to browse all fair tubs — no second form.';
    }
    document.body.classList.remove('po-page--survey-only');
    document.body.classList.add('po-page--done');
  }

  function init() {
    unlockFairInventory();
    resetSurveyView();
    track('post_optin_view');
    showQ1();

    var back = document.getElementById('poSurveyBack');
    if (back) back.addEventListener('click', goBack);

    var restart = document.getElementById('poSurveyRestart');
    if (restart) restart.addEventListener('click', restartSurvey);

    var doneInventory = document.getElementById('poDoneInventory');
    if (doneInventory) {
      doneInventory.addEventListener('click', function () {
        unlockFairInventory();
        track('post_optin_secondary_click', {
          primary_choice: state.primary || 'done',
          secondary_choice: 'view_inventory'
        });
      });
    }

    var doneText = document.getElementById('poDoneText');
    if (doneText) {
      doneText.addEventListener('click', function () {
        track('post_optin_secondary_click', {
          primary_choice: state.primary || 'done',
          secondary_choice: 'done_text'
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.ParadisePostOptIn = { BOOKING_URL: BOOKING_URL, smsLink: smsLink };
})();
