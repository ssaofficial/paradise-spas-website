/**
 * Gated inventory unlock
 *
 * Optional body data attributes:
 *   data-gate-storage-key  — localStorage key (default: paradise_inventory_unlocked)
 *   data-gate-return-path  — page after unlock (default: inventory.html)
 *
 * Legacy GHL iframe redirect (retired on fair gate):
 *   Standard:  thank-you.html?unlock=inventory
 *   Fair:        thank-you.html?unlock=rrvf-inventory
 *
 * Fair gate uses native form → /api/lead (see lead-form.js + dashboard/LEAD_INSURANCE_OWNER_SETUP.md)
 */
(function () {
  var body = document.body;
  var STORAGE_KEY = body.getAttribute('data-gate-storage-key') || 'paradise_inventory_unlocked';
  var STORAGE_TS = STORAGE_KEY + '_at';
  var RETURN_PATH = body.getAttribute('data-gate-return-path') || 'inventory.html';
  var TTL_MS = 30 * 24 * 60 * 60 * 1000;
  var scrollY = 0;
  var scrollLocked = false;

  function isInsideScrollableGate(target) {
    if (!target || !target.closest) return false;
    return !!target.closest('.inventory-gate-panel, .inventory-gate-scroll-body');
  }

  function blockScrollEvent(e) {
    if (!document.body.classList.contains('inventory-locked')) return;
    if (isInsideScrollableGate(e.target)) return;
    e.preventDefault();
  }

  function scrollFocusedFieldIntoView(e) {
    var gate = document.getElementById('inventory-gate');
    if (!gate || gate.hidden) return;
    var scrollBody = gate.querySelector('.inventory-gate-scroll-body');
    if (!scrollBody) return;
    var target = e.target;
    if (!scrollBody.contains(target)) return;
    if (!target.matches || !target.matches('input, select, textarea, button')) return;

    requestAnimationFrame(function () {
      try {
        target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } catch (err) {
        target.scrollIntoView(false);
      }
    });
  }

  function enableScrollLock() {
    if (scrollLocked) return;
    scrollLocked = true;
    document.documentElement.classList.add('inventory-locked');
    document.addEventListener('touchmove', blockScrollEvent, { passive: false });
    document.addEventListener('wheel', blockScrollEvent, { passive: false });
    document.addEventListener('focusin', scrollFocusedFieldIntoView);
  }

  function disableScrollLock() {
    if (!scrollLocked) return;
    scrollLocked = false;
    document.documentElement.classList.remove('inventory-locked');
    document.removeEventListener('touchmove', blockScrollEvent, { passive: false });
    document.removeEventListener('wheel', blockScrollEvent, { passive: false });
    document.removeEventListener('focusin', scrollFocusedFieldIntoView);
  }

  function isUnlocked() {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== '1') return false;
      var ts = parseInt(localStorage.getItem(STORAGE_TS), 10);
      if (!ts || isNaN(ts)) return true;
      return Date.now() - ts < TTL_MS;
    } catch (err) {
      return false;
    }
  }

  function persistUnlock() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
      localStorage.setItem(STORAGE_TS, String(Date.now()));
      sessionStorage.setItem(STORAGE_KEY + '_session', '1');
    } catch (err) { /* ignore */ }
  }

  function trackUnlock() {
    var eventName = (STORAGE_KEY.indexOf('rrvf') !== -1 || STORAGE_KEY.indexOf('statefair') !== -1) ? 'fair_inventory_unlock' : 'inventory_unlock';
    if (typeof gtag === 'function') {
      gtag('event', eventName, {
        event_category: 'engagement',
        page_path: window.location.pathname || '/'
      });
    }
    if (typeof clarity === 'function') {
      clarity('event', eventName);
    }
  }

  function applyUnlocked(skipTrack) {
    var unlockedPath = body.getAttribute('data-gate-unlocked-path');
    if (unlockedPath) {
      var targetPath = unlockedPath.split('?')[0].replace(/\/$/, '');
      var currentPath = (window.location.pathname || '').replace(/\/$/, '');
      if (currentPath !== targetPath) {
        if (!skipTrack) trackUnlock();
        window.location.replace(unlockedPath);
        return;
      }
    }

    disableScrollLock();
    document.body.classList.remove('inventory-locked');
    document.body.classList.add('inventory-unlocked');
    window.scrollTo(0, scrollY);
    var gate = document.getElementById('inventory-gate');
    if (gate) gate.hidden = true;
    if (!skipTrack) trackUnlock();
  }

  function applyLocked() {
    scrollY = window.scrollY || 0;
    document.body.classList.add('inventory-locked');
    document.body.classList.remove('inventory-unlocked');
    var gate = document.getElementById('inventory-gate');
    if (gate) gate.hidden = false;
    enableScrollLock();
  }

  function init() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('inventory_unlocked') === '1') {
      persistUnlock();
      applyUnlocked(true);
      if (window.history && window.history.replaceState) {
        var cleanPath = window.location.pathname;
        window.history.replaceState({}, '', cleanPath);
      }
      return;
    }

    if (isUnlocked()) {
      applyUnlocked(true);
    } else {
      applyLocked();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.ParadiseInventoryGate = {
    unlock: function () {
      persistUnlock();
      applyUnlocked();
    },
    isUnlocked: isUnlocked,
    storageKey: STORAGE_KEY,
    returnPath: RETURN_PATH
  };
})();
