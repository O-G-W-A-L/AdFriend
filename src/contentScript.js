import React from "react";
import ReactDOM from "react-dom/client";
import AdReplacer from "./components/AdReplacer";

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1 && isAdElement(node)) {
        replaceAd(node);
      }
    });
  });
});

function isAdElement(element) {
  // Implement actual ad detection logic here
  return (
    element.classList.contains("ad-class") ||
    element.id.includes("ad") ||
    element.querySelector("[data-ad]")
  );
}

function replaceAd(adElement) {
  const replacement = document.createElement("div");
  replacement.className = "adfriend-replacement";
  adElement.parentNode.replaceChild(replacement, adElement);

  // Render React component without using JSX
  const root = document.createElement("div");
  replacement.appendChild(root);
  ReactDOM.createRoot(root).render(React.createElement(AdReplacer));
}

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
});
