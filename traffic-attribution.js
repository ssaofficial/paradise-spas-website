/**
 * First-touch traffic attribution for the session.
 * Used by lead-form.js -> /api/lead -> GHL source/location/offer tags.
 */
(function () {
  var KEY = 'paradise_traffic_channel';
  var ATTR_KEY = 'paradise_traffic_attribution';

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

  function readAttribution() {
    var params = new URLSearchParams(window.location.search);
    return {
      traffic_channel: classifyTraffic(),
      landing_page_url: window.location.href,
      referrer_url: document.referrer || '',
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || '',
      fbclid: params.get('fbclid') || '',
      gclid: params.get('gclid') || '',
      msclkid: params.get('msclkid') || ''
    };
  }

  function storedAttribution() {
    try {
      var raw = sessionStorage.getItem(ATTR_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function captureTraffic() {
    try {
      if (!sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, classifyTraffic());
      }
      if (!sessionStorage.getItem(ATTR_KEY)) {
        sessionStorage.setItem(ATTR_KEY, JSON.stringify(readAttribution()));
      }
    } catch (err) { /* ignore */ }
  }

  function getChannel() {
    try {
      var stored = sessionStorage.getItem(KEY);
      if (stored) return stored;
    } catch (err) { /* ignore */ }
    return classifyTraffic();
  }

  function getAttribution() {
    var stored = storedAttribution();
    if (stored) return stored;
    return readAttribution();
  }

  captureTraffic();

  window.ParadiseTraffic = {
    getChannel: getChannel,
    getAttribution: getAttribution,
    capture: captureTraffic
  };
})();
