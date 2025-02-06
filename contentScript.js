console.log("🚀 AdFriend content script loaded!");

import React from "react";
import ReactDOM from "react-dom/client";
import AdReplacer from "./src/components/AdReplacer";

// Configuration
const AD_CONFIG = {
  keywords: new Set(['ad', 'ads', 'advert', 'sponsored', 'promoted', 'bannerad']),
  blocklist: new Set(['add', 'address', 'admin', 'advance', 'avatar', 'badge', 'card', 'cloud']),
  attributes: ['data-ad', 'data-ad-type', 'role', 'id', 'class', 'aria-label'],
  minSize: { width: 100, height: 50 }
};

// Enhanced ad detection
function isAdElement(element) {
  if (!element?.matches?.('*') || 
      element.closest('.adfriend-replacement') ||
      element.dataset.adfriendProcessed) {
    return false;
  }

  // Check visibility and size
  const rect = element.getBoundingClientRect();
  if (rect.width < AD_CONFIG.minSize.width || 
      rect.height < AD_CONFIG.minSize.height ||
      window.getComputedStyle(element).visibility === 'hidden') {
    return false;
  }

  // Analyze element attributes
  const attributeContent = AD_CONFIG.attributes
    .map(attr => element.getAttribute(attr)?.toLowerCase() || '')
    .join(' ');

  // Check for valid ad patterns
  const hasAdKeyword = [...AD_CONFIG.keywords].some(kw => 
    attributeContent.includes(kw) && 
    !AD_CONFIG.blocklist.has(kw)
  );

  // Check for common ad patterns
  const isGoogleAd = element.classList.contains('adsbygoogle');
  const hasAdDataAttr = element.hasAttribute('data-ad-client');

  return (hasAdKeyword || isGoogleAd || hasAdDataAttr) &&
         !attributeContent.match(/(user|profile|button|nav|menu)/i);
}

// Replacement manager
class ReplacementManager {
  constructor() {
    this.isReplacing = false;
  }

  replaceAd(adElement) {
    if (this.isReplacing || !adElement?.parentNode) return;

    this.isReplacing = true;
    try {
      console.log("🔄 Replacing ad:", adElement);
      adElement.dataset.adfriendProcessed = "true";

      // Preserve positioning
      const { width, height } = adElement.getBoundingClientRect();
      const replacement = document.createElement('div');
      Object.assign(replacement.style, {
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        zIndex: 99999
      });
      replacement.className = 'adfriend-replacement';

      // Clone and hide original
      const clone = adElement.cloneNode(true);
      clone.style.display = 'none';
      adElement.parentNode.replaceChild(clone, adElement);
      clone.parentNode.insertBefore(replacement, clone.nextSibling);

      // Render React component
      ReactDOM.createRoot(replacement).render(
        React.createElement(AdReplacer, { 
          originalElement: clone,
          width,
          height
        })
      );
    } finally {
      this.isReplacing = false;
    }
  }
}

// Main execution
const manager = new ReplacementManager();
const observer = new MutationObserver(mutations => {
  mutations.forEach(({ addedNodes }) => {
    addedNodes.forEach(node => {
      if (node.nodeType === 1 && isAdElement(node)) {
        manager.replaceAd(node);
      }
    });
  });
});

// Initialize
function initialize() {
  // Initial scan
  document.querySelectorAll('*').forEach(element => {
    if (isAdElement(element)) manager.replaceAd(element);
  });

  // Observe DOM changes
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributeFilter: AD_CONFIG.attributes
  });
}

document.readyState === 'complete' 
  ? initialize() 
  : window.addEventListener('load', initialize);

// Cleanup
window.addEventListener('beforeunload', () => observer.disconnect());