/**
 * First-touch traffic channel for the session (stored in sessionStorage).
 * Used by lead-form.js → /api/lead → GHL tag "organic" when channel is organic.
 */
(function () {
  var KEY = 'paradise_traffic_channel';

  function referrerHost() {
    var ref = document.referrer || '';
    if (!ref) return '';
    try {
      return new URL(ref).hostname.toLowerCase();
    } catch (err) {
      return '';
    }
  }

  function isSiteHost(host) {
    return host.indexOf('paradisespas.com') !== -1;
  }

  function isSearchEngine(host) {
    return (
      host.indexOf('google.') !== -1 ||
      host.indexOf('bing.') !== -1 ||
      host.indexOf('duckduckgo.') !== -1 ||
      host.indexOf('yahoo.') !== -1 ||
      host.indexOf('search.') !== -1 ||
      host.indexOf('ecosia.') !== -1 ||
      host.indexOf('ask.com') !== -1
    );
  }

  function isPaidSocialHost(host) {
    return (
      host.indexOf('facebook.com') !== -1 ||
      host.indexOf('instagram.com') !== -1 ||
      host.indexOf('fb.com') !== -1
    );
  }

  function classifyTraffic() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('fbclid') || params.get('gclid') || params.get('msclkid')) {
      return 'paid';
    }

    var medium = (params.get('utm_medium') || '').toLowerCase();
    var source = (params.get('utm_source') || '').toLowerCase();

    if (
      medium === 'cpc' ||
      medium === 'ppc' ||
      medium === 'paid' ||
      medium === 'paidsocial' ||
      medium === 'paid-social' ||
      medium === 'cpm' ||
      medium === 'display'
    ) {
      return 'paid';
    }

    if (medium === 'organic') {
      return 'organic';
    }

    if (
      (source === 'facebook' || source === 'fb' || source === 'instagram' || source === 'ig') &&
      (!medium || medium === 'paid' || medium === 'cpc' || medium === 'paidsocial' || medium === 'social')
    ) {
      return 'paid';
    }

    var refHost = referrerHost();
    if (refHost && isSiteHost(refHost)) {
      return 'internal';
    }

    if (refHost && isSearchEngine(refHost)) {
      return 'organic';
    }

    if (refHost && isPaidSocialHost(refHost)) {
      return 'paid';
    }

    if (!refHost) {
      return 'direct';
    }

    return 'referral';
  }

  function captureTraffic() {
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, classifyTraffic());
    } catch (err) { /* ignore */ }
  }

  function getChannel() {
    try {
      var stored = sessionStorage.getItem(KEY);
      if (stored) return stored;
    } catch (err) { /* ignore */ }
    return classifyTraffic();
  }

  captureTraffic();

  window.ParadiseTraffic = {
    getChannel: getChannel,
    capture: captureTraffic
  };
})();
