(function() {
  // Shared product-page behavior: defer GHL chat until pricing modal is closed.
  var chatWidgetLoaded = false;
  var navHamburger = document.getElementById('navHamburger');
  var navMobileMenu = document.getElementById('navMobileMenu');

  function loadChatWidget() {
    if (chatWidgetLoaded) return;
    chatWidgetLoaded = true;
    document.body.classList.remove('ghl-modal-open');

    var chatScript = document.createElement('script');
    chatScript.src = 'https://widgets.leadconnectorhq.com/loader.js';
    chatScript.setAttribute('data-resources-url', 'https://widgets.leadconnectorhq.com/chat-widget/loader.js');
    chatScript.setAttribute('data-widget-id', '6a428113cf2c64bbfadc2891');
    document.body.appendChild(chatScript);
  }

  function closeGhlModal() {
    if (window.ParadiseGhlModal) {
      ParadiseGhlModal.close();
    }
    loadChatWidget();
  }

  function openGhlModal() {
    if (window.ParadiseGhlModal) {
      ParadiseGhlModal.open();
    }
  }

  if (navHamburger && navMobileMenu) {
    navHamburger.addEventListener('click', function() {
      navMobileMenu.classList.toggle('open');
    });
  }

  if (new URLSearchParams(window.location.search).get('open') === 'price') {
    openGhlModal();
  } else {
    loadChatWidget();
  }

  if (window.ParadiseGhlModal) {
    var originalClose = ParadiseGhlModal.close;
    ParadiseGhlModal.close = function() {
      originalClose();
      loadChatWidget();
    };
  }
})();
