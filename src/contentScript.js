console.log("AdFriend content script loaded!");

import { renderQuote } from "./render/renderQuote.js";
import { renderReminder } from "./render/renderReminder.js";
import { renderTodoLists } from "./render/renderTodoLists.js";

// --- Configuration ---
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

// --- Ad Detection ---
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

// --- Replacement Manager ---
class ReplacementManager {
  constructor() {
    this.types = ['quote', 'reminder', 'todo'];
    this.counter = 0;
    this.quoteIndex = 0; // Track current quote index
    this.reminderIndex = 0; // Track current reminder index
  }

  replaceAd(el) {
    if (!el || !el.parentNode || el.dataset.adfriendProcessed) return;
    el.dataset.adfriendProcessed = "true";
    console.log("🔄 Replacing ad:", el);

    const { width, height } = el.getBoundingClientRect();
    const w = width || 300, h = height || 250;

    // Create replacement container
    const container = document.createElement("div");
    container.className = "adfriend-replacement";
    Object.assign(container.style, {
      width: `${w}px`,
      height: `${h}px`,
      position: "relative",
      zIndex: 99999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f3f3f3",
      border: "1px solid #ccc"
    });

    el.replaceWith(container);

    // Select content type in sequence
    const type = this.types[this.counter % this.types.length];
    this.counter++;

    chrome.storage.local.get([type], res => {
      let content = res[type];
      
      // Handle missing content
      if (!content) {
        console.warn(`⚠️ No stored content for ${type}, using default.`);
        content = getDefaultContent(type);
      } 
      // Parse string content
      else if (typeof content === 'string') {
        try {
          content = JSON.parse(content);
        } catch (e) {
          console.warn(`⚠️ Error parsing ${type} content, using default.`);
          content = getDefaultContent(type);
        }
      }

      // Validate content structure
      switch (type) {
        case 'quote':
        case 'reminder':
          if (!Array.isArray(content)) {
            console.warn(`⚠️ Content for ${type} invalid, using default.`);
            content = getDefaultContent(type);
          }
          break;
        case 'todo':
          if (!Array.isArray(content)) {
            console.warn(`⚠️ Todo content invalid, using default.`);
            content = getDefaultContent(type);
          }
          break;
      }

      // Render content
      let contentElement;
      switch (type) {
        case 'quote':
          // Render one quote at a time
          const currentQuote = content[this.quoteIndex % content.length];
          contentElement = renderQuote([currentQuote], w, h);
          this.quoteIndex++; // Move to the next quote
          break;
        case 'reminder':
          // Render one reminder at a time
          const currentReminder = content[this.reminderIndex % content.length];
          contentElement = renderReminder([currentReminder], w, h);
          this.reminderIndex++; // Move to the next reminder
          break;
        case 'todo':
          contentElement = renderTodoLists(content, w, h);
          break;
        default:
          contentElement = createDefaultText("Content not available");
      }

      container.appendChild(contentElement);
    });
  }
}

// --- Default Content ---
function getDefaultContent(type) {
  const defaults = {
    quote: ["Stay positive and keep pushing forward!"],
    reminder: ["Remember to take a break!"],
    todo: [{ text: "Sample Task", time: "00:00" }]
  };
  return defaults[type] || [];
}

// --- Create Default Fallback Text ---
function createDefaultText(message) {
  const div = document.createElement("div");
  div.textContent = message;
  div.style.cssText = "font-size: 16px; text-align: center; color: #666;";
  return div;
}

const manager = new ReplacementManager();

// --- Initial Scan ---
function initialScan() {
  console.log("🔍 Initial ad scan...");
  const selectors = "ins.adsbygoogle, iframe[src*='ad'], div[id*='ad'], div[class*='ad']";
  document.querySelectorAll(selectors).forEach(el => {
    if (isAdElement(el)) manager.replaceAd(el);
  });
}

// --- Mutation Observer ---
const observer = new MutationObserver(mutations => {
  mutations.forEach(({ addedNodes }) => {
    addedNodes.forEach(node => {
      (function scan(el) {
        if (el.nodeType === Node.ELEMENT_NODE) {
          if (isAdElement(el)) manager.replaceAd(el);
          el.childNodes.forEach(scan);
        }
      })(node);
    });
  });
});

// --- Initialization ---
function initialize() {
  initialScan();
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === "complete") initialize();
else window.addEventListener("load", initialize);
window.addEventListener("beforeunload", () => observer.disconnect());