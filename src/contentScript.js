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
    this.displaySettings = null;
  }

  async initialize() {
    // Load display settings on initialization
    await this.loadDisplaySettings();
    // Listen for settings changes
    chrome.storage.onChanged.addListener(this.handleStorageChange.bind(this));
  }

  async loadDisplaySettings() {
    try {
      const storage = await chrome.storage.local.get('displaySettings');
      this.displaySettings = storage.displaySettings || {
        quote: {
          textColor: "#000000",
          backgroundColor: "#ffffff",
          fontSize: "16px",
          fontFamily: "Arial, sans-serif",
        },
        reminder: {
          textColor: "#333333",
          backgroundColor: "#f0f0f0",
          fontSize: "14px",
          fontFamily: "Georgia, serif",
        }
      };
    } catch (error) {
      console.error('Failed to load display settings:', error);
    }
  }

  handleStorageChange(changes) {
    if (changes.displaySettings) {
      this.displaySettings = changes.displaySettings.newValue;
      this.refreshAllReplacements();
    }
  }

  async refreshAllReplacements() {
    const processedElements = document.querySelectorAll('[data-adfriend-processed]');
    processedElements.forEach(async (el) => {
      const type = el.dataset.adfriendType;
      if (type) {
        const content = await this.getUserContent(type);
        await this.updateContent(el, type, content);
      }
    });
  }

  async getUserContent(type) {
    try {
      const storage = await chrome.storage.local.get([type]);
      const items = storage[type];
      return Array.isArray(items) && items.length ? items : null;
    } catch (error) {
      console.error(`Failed to get ${type}:`, error);
      return null;
    }
  }

  async replaceAd(el) {
    if (!el || !el.parentNode || el.dataset.adfriendProcessed) return;
    
    const rect = el.getBoundingClientRect();
    const width = rect.width || AD_CONFIG.minSize.width;
    const height = rect.height || AD_CONFIG.minSize.height;

    const container = document.createElement("div");
    Object.assign(container.style, {
      width: `${width}px`,
      height: `${height}px`,
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden"
    });

    const type = this.types[this.counter % this.types.length];
    container.dataset.adfriendProcessed = "true";
    container.dataset.adfriendType = type;
    this.counter++;

    el.replaceWith(container);

    try {
      const content = await this.getUserContent(type);
      await this.updateContent(container, type, content);
    } catch (error) {
      console.error("Error rendering content:", error);
    }
  }

  async updateContent(container, type, content) {
    const settings = this.displaySettings?.[type];
    if (!settings) return;

    try {
      const rendered = type === "quote"
        ? await renderQuote(content, parseInt(container.style.width), parseInt(container.style.height), settings)
        : await renderReminder(content, parseInt(container.style.width), parseInt(container.style.height), settings);

      if (rendered) {
        container.innerHTML = "";
        container.appendChild(rendered);
      }
    } catch (error) {
      console.error("Error updating content:", error);
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

async function initialize() {
  await manager.initialize(); // Initialize settings first
  initialScan();
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("beforeunload", () => observer.disconnect());
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateDisplaySettings') {
    manager.loadDisplaySettings().then(() => {
      manager.refreshAllReplacements();
      sendResponse({ success: true });
    });
    return true; // Keep the message channel open for async response
  }
});

if (document.readyState === "complete") initialize();
else window.addEventListener("load", initialize);