(function() {
  var overlay = document.getElementById('ghl-overlay');
  if (!overlay) return;

  var closeBtn = document.getElementById('ghl-close');
  var formShell = document.getElementById('ghl-form-shell');
  var formLoader = document.getElementById('ghl-form-loader');
  var formIframe = overlay.querySelector('.ghl-form-iframe, #inline-ghl-modal-form, iframe[data-form-id]');
  var pricingTrust = document.getElementById('ghl-trust-pricing');
  var financingTrust = document.getElementById('ghl-trust-financing');
  var formReady = false;

  ['https://api.leadconnectorhq.com', 'https://link.msgsndr.com', 'https://stcdn.leadconnectorhq.com'].forEach(function(origin) {
    if (document.querySelector('link[rel="preconnect"][href="' + origin + '"]')) return;
    var link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  if (!document.querySelector('script[src*="form_embed.js"]')) {
    var embedScript = document.createElement('script');
    embedScript.src = 'https://link.msgsndr.com/js/form_embed.js';
    embedScript.defer = true;
    document.body.appendChild(embedScript);
  }

  function setTrustMode(isFinancing) {
    if (pricingTrust) pricingTrust.hidden = !!isFinancing;
    if (financingTrust) financingTrust.hidden = !isFinancing;
  }

  function markFormReady() {
    if (formReady) return;
    formReady = true;
    if (formShell) formShell.classList.add('is-ready');
    if (formLoader) formLoader.setAttribute('aria-hidden', 'true');
  }

  if (formIframe) {
    formIframe.addEventListener('load', markFormReady);
    setTimeout(markFormReady, 6000);
  } else {
    markFormReady();
  }

  function openModal(options) {
    options = options || {};
    setTrustMode(!!options.financing);
    if (formReady && formShell) {
      formShell.classList.add('is-ready');
    }
    document.body.classList.add('ghl-modal-open');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('ghl-modal-open');
  }

  function bindTrigger(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var isFinancing = btn.classList.contains('btn-financing') || btn.classList.contains('btn-financing-page');
      openModal({ financing: isFinancing });
    });
  }

  document.querySelectorAll('[data-ghl-trigger]').forEach(bindTrigger);

  /* Hidden GHL iframe can cover footer CTAs — open modal if click lands on trigger bounds */
  document.addEventListener('click', function(e) {
    if (overlay.classList.contains('is-open')) return;
    if (e.target.closest('[data-ghl-trigger]')) return;

    var hitTrigger = null;
    document.querySelectorAll('[data-ghl-trigger]').forEach(function(btn) {
      if (hitTrigger) return;
      var rect = btn.getBoundingClientRect();
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        hitTrigger = btn;
      }
    });

    if (!hitTrigger) return;

    e.preventDefault();
    e.stopPropagation();
    var isFinancing = hitTrigger.classList.contains('btn-financing') || hitTrigger.classList.contains('btn-financing-page');
    openModal({ financing: isFinancing });
  }, true);

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
    isFormReady: function() { return formReady; }
  };
})();
