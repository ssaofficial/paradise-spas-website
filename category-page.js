(function() {
  var inventorySection = document.getElementById('shop-inventory');
  var stickyBar = document.getElementById('categoryStickyCta');
  if (!inventorySection || !stickyBar) return;

  var stickyLink = stickyBar.querySelector('.category-sticky-cta-btn');

  function updateStickyCta() {
    var passed = inventorySection.getBoundingClientRect().bottom < 0;
    stickyBar.classList.toggle('is-visible', passed);
    stickyBar.setAttribute('aria-hidden', passed ? 'false' : 'true');
  }

  if (stickyLink && stickyLink.getAttribute('href') === '#shop-inventory') {
    stickyLink.addEventListener('click', function(e) {
      e.preventDefault();
      inventorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  window.addEventListener('scroll', updateStickyCta, { passive: true });
  window.addEventListener('resize', updateStickyCta);
  updateStickyCta();
})();
