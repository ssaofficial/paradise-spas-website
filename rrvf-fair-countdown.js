(function () {
  var END = new Date('2026-07-13T23:59:59-05:00');
  var el = document.getElementById('rrvfCountdown');
  if (!el) return;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function render() {
    var diff = END.getTime() - Date.now();
    if (diff <= 0) {
      el.innerHTML =
        '<span class="rrvf-countdown-num">00</span> d : ' +
        '<span class="rrvf-countdown-num">00</span> h : ' +
        '<span class="rrvf-countdown-num">00</span> m : ' +
        '<span class="rrvf-countdown-num">00</span> s';
      return;
    }

    var totalSec = Math.floor(diff / 1000);
    var days = Math.floor(totalSec / 86400);
    totalSec %= 86400;
    var hours = Math.floor(totalSec / 3600);
    totalSec %= 3600;
    var mins = Math.floor(totalSec / 60);
    var secs = totalSec % 60;

    el.innerHTML =
      '<span class="rrvf-countdown-num">' + pad(days) + '</span> d : ' +
      '<span class="rrvf-countdown-num">' + pad(hours) + '</span> h : ' +
      '<span class="rrvf-countdown-num">' + pad(mins) + '</span> m : ' +
      '<span class="rrvf-countdown-num">' + pad(secs) + '</span> s';
  }

  render();
  setInterval(render, 1000);
})();
