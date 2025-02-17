console.log("AdFriend content script loaded!");

import { renderQuote } from "./render/renderQuote.js";
import { renderReminder } from "./render/renderReminder.js";

// --- Ad Detection Configuration ---
const AD_CONFIG = {
  adKeywords: [
    "\\bad\\b", "\\bads\\b", "\\badvert\\b", "\\badvertisement\\b",
    "\\bsponsored\\b", "\\bpromoted\\b", "\\bbanner\\b",
    "\\bbannerad\\b", "\\brecommended\\b"
  ],
  blocklist: [
    "\\badd\\b", "\\baddress\\b", "\\badmin\\b", "\\badvance\\b",
    "\\bavatar\\b", "\\bbadge\\b", "\\bcard\\b", "\\bcloud\\b"
  ],
  attributes: ["data-ad", "data-ad-type", "role", "id", "class", "aria-label"],
  minSize: { width: 100, height: 50 }
};

const adRegex = new RegExp(AD_CONFIG.adKeywords.join("|"), "i");
const blockRegex = new RegExp(AD_CONFIG.blocklist.join("|"), "i");

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
    const w = rect.width || 300;
    const h = rect.height || 250;

    // Create a container that exactly matches the intercepted ad's dimensions.
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

function isAdElement(el) {
  if (!el || !el.matches || el.dataset.adfriendProcessed || el.closest("header, nav, footer, aside"))
    return false;
  if (el.classList.contains("adsbygoogle") || el.hasAttribute("data-ad-client"))
    return true;
  try {
    const { width, height } = el.getBoundingClientRect();
    if (width < AD_CONFIG.minSize.width || height < AD_CONFIG.minSize.height ||
        window.getComputedStyle(el).visibility === "hidden")
      return false;
  } catch (e) {
    return false;
  }
  const attr = AD_CONFIG.attributes.map(a => (el.getAttribute(a) || "").toLowerCase()).join(" ");
  return adRegex.test(attr) && !blockRegex.test(attr);
}

const manager = new ReplacementManager();

function initialScan() {
  const selectors = "ins.adsbygoogle, iframe[src*='ad'], div[id*='ad'], div[class*='ad']";
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