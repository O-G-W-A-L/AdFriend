import React from "react";
import ReactDOM from "react-dom/client";
import AdReplacer from "./components/AdReplacer";

function isAdElement(element) {
  // Enhanced ad detection logic
  return (
    element.classList.contains("ad-class") ||
    /ad(s?)-?[0-9]*/i.test(element.id) ||
    element.querySelector("[data-ad], .ad, .ads, [id*='ad'], [class*='ad']")
  );
}

function replaceAd(adElement) {
  const replacement = document.createElement("div");
  replacement.className = "adfriend-replacement";
  adElement.parentNode.replaceChild(replacement, adElement);

  const root = document.createElement("div");
  root.className = "w-full h-full";
  replacement.appendChild(root);
  
  ReactDOM.createRoot(root).render(
    React.createElement(AdReplacer, { originalElement: adElement })
  );
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1 && isAdElement(node)) {
        replaceAd(node);
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
});

// Cleanup observer on page unload
window.addEventListener("beforeunload", () => {
  observer.disconnect();
});