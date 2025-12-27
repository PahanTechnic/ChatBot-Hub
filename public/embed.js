(function() {
  'use strict';

  // Get the script tag that loaded this file to extract bot ID and options
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  
  // Get configuration from data attributes
  const botId = currentScript.getAttribute('data-bot-id');
  
  if (!botId) {
    console.error('ChatBot Widget: data-bot-id attribute is required');
    return;
  }

  // Load React-based widget
  function loadReactWidget() {
    // Create container div for the widget iframe
    const container = document.createElement('div');
    container.id = 'chatbot-widget-react-root';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
    `;
    document.body.appendChild(container);

    // Get base URL
    let baseUrl = window.location.origin;
    if (currentScript.src) {
      const scriptSrc = currentScript.src;
      baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
    }

    // Create an iframe that loads the FloatingChatButton component
    const iframe = document.createElement('iframe');
    iframe.id = 'chatbot-widget-iframe';
    iframe.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
      pointer-events: auto;
      z-index: 999999;
    `;
    
    iframe.src = `${baseUrl}/widget-embed?botId=${botId}`;
    
    // Handle iframe load
    iframe.onload = function() {
      console.log('ChatBot Widget loaded successfully');
    };

    iframe.onerror = function() {
      console.error('Failed to load ChatBot Widget');
    };

    container.appendChild(iframe);
  }

  // Initialize widget when DOM is ready
  function initWidget() {
    loadReactWidget();
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();