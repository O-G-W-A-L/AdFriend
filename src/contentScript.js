console.log("AdFriend content script loaded!");

import { renderQuote } from "./render/renderQuote.js";
import { renderReminder } from "./render/renderReminder.js";

// --- Ad Detection Configuration ---
const AD_CONFIG = {
  minSize: { width: 100, height: 50 },
  // Only flag if the iframe/src comes from one of these known ad domains.
  adDomains: [
    "doubleclick.net",
    "googlesyndication.com",
    "adservice.google.com",
    "adnxs.com",
    "adform.net",
    "taboola.com",
    "outbrain.com"
  ]
};

function isElementVisible(el) {
  try {
    const style = window.getComputedStyle(el);
    return (style.display !== "none" && style.visibility !== "hidden");
  } catch(e) {
    return false;
  }
}

function isAdElement(el) {
  if (!el || !el.matches || el.dataset.adfriendProcessed) return false;
  if (el.closest("header, nav, footer, aside")) return false;

  // Check minimum size.
  try {
    const rect = el.getBoundingClientRect();
    if (rect.width < AD_CONFIG.minSize.width || rect.height < AD_CONFIG.minSize.height) return false;
  } catch (e) {
    return false;
  }
  if (!isElementVisible(el)) return false;

  const tag = el.tagName;

  // --- IFRAME Ads: Only if the src URL is from a known ad network.
  if (tag === "IFRAME" && el.src) {
    const src = el.src.toLowerCase();
    for (const domain of AD_CONFIG.adDomains) {
      if (src.includes(domain)) return true;
    }
  }

  // --- Standard Ad Markers.
  if (el.matches("ins.adsbygoogle")) return true;
  if (el.hasAttribute("data-ad-client")) return true;

  // --- Flash Ads.
  if (tag === "OBJECT" || tag === "EMBED") {
    const src = (el.getAttribute("data") || el.getAttribute("src") || "").toLowerCase();
    if (src.endsWith(".swf") || src.includes("flash")) return true;
  }

  // --- GIF Ads.
  if (tag === "IMG" && el.src && el.src.toLowerCase().endsWith(".gif")) {
    const alt = el.getAttribute("alt") || "";
    const title = el.getAttribute("title") || "";
    // Only flag if there’s little descriptive text.
    if ((alt + title).trim() === "") return true;
    // Alternatively, if the immediate container clearly identifies as an ad.
    const parent = el.closest("a, div, span, section");
    if (parent) {
      const parentIdClass = (parent.id + " " + parent.className).toLowerCase();
      if (/^\s*(ad|ads)\s*$/i.test(parentIdClass)) return true;
    }
  }

  // --- Container Elements: DIV, SECTION, SPAN.
  // Only flag if the id or class exactly equals "ad" or "ads" and there’s minimal inner text.
  if (tag === "DIV" || tag === "SECTION" || tag === "SPAN") {
    const idClass = (el.id + " " + el.className).toLowerCase().trim();
    if (/^(ad|ads)$/.test(idClass)) {
      const text = el.innerText.trim();
      const wordCount = text ? text.split(/\s+/).length : 0;
      // If there's very little text or few child elements, assume it's an ad container.
      if (wordCount < 10 || el.childElementCount < 3) return true;
    }
  }

  return false;
}

class ReplacementManager {
  constructor() {
    this.types = ['quote', 'reminder'];
    this.counter = 0;
  }
  
  async getUserContent(type) {
    try {
      const storage = await chrome.storage.local.get([type]);
      if (storage[type] && Array.isArray(storage[type]) && storage[type].length > 0) {
        return storage[type];
      }
    } catch (error) {
      console.error("Error accessing user content:", error);
    }
    return null;
  }
  
  async replaceAd(el) {
    if (!el || !el.parentNode || el.dataset.adfriendProcessed) return;
    el.dataset.adfriendProcessed = "true";
    
    const rect = el.getBoundingClientRect();
    const w = rect.width || AD_CONFIG.minSize.width;
    const h = rect.height || AD_CONFIG.minSize.height;
    
    // Create a container that exactly matches the ad's dimensions.
    const container = document.createElement("div");
    Object.assign(container.style, {
      width: `${w}px`,
      height: `${h}px`,
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f3f3f3",
      border: "1px solid #ccc",
      overflow: "hidden"
    });
    el.replaceWith(container);
    
    const type = this.types[this.counter % this.types.length];
    this.counter++;
    
    try {
      const userContent = await this.getUserContent(type);
      let contentElement;
      if (type === 'quote') {
        contentElement = await renderQuote(userContent, w, h);
      } else {
        contentElement = await renderReminder(userContent, w, h);
      }
      if (contentElement) {
        container.innerHTML = "";
        container.appendChild(contentElement);
      }
    } catch (error) {
      console.error("Error rendering content:", error);
    }
  }
}

const manager = new ReplacementManager();

function initialScan() {
  // Query a broad set of elements but rely on the strict isAdElement() check.
  const selectors = [
    "ins.adsbygoogle",
    "iframe",
    "object",
    "embed",
    "img",
    "div",
    "section",
    "span"
  ].join(", ");
  
  document.querySelectorAll(selectors).forEach(el => {
    if (isAdElement(el)) {
      manager.replaceAd(el);
    }
  });
}

const observer = new MutationObserver(mutations => {
  mutations.forEach(({ addedNodes }) => {
    addedNodes.forEach(node => {
      (function scan(el) {
        if (el.nodeType === Node.ELEMENT_NODE) {
          if (isAdElement(el)) {
            manager.replaceAd(el);
          }
          el.childNodes.forEach(scan);
        }
      })(node);
    });
  });
});

function initialize() {
  initialScan();
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("beforeunload", () => observer.disconnect());
}

if (document.readyState === "complete") initialize();
else window.addEventListener("load", initialize);
