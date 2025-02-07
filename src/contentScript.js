console.log("AdFriend content script loaded!");

// --- Configuration ---
const AD_CONFIG = {
  adKeywords: [
    "\\bad\\b",
    "\\bads\\b",
    "\\badvert\\b",
    "\\badvertisement\\b",
    "\\bsponsored\\b",
    "\\bpromoted\\b",
    "\\bbanner\\b",
    "\\bbannerad\\b",
    "\\brecommended\\b"
  ],
  blocklist: [
    "\\badd\\b",
    "\\baddress\\b",
    "\\badmin\\b",
    "\\badvance\\b",
    "\\bavatar\\b",
    "\\bbadge\\b",
    "\\bcard\\b",
    "\\bcloud\\b"
  ],
  attributes: ["data-ad", "data-ad-type", "role", "id", "class", "aria-label"],
  minSize: { width: 100, height: 50 }
};

const adRegex = new RegExp(AD_CONFIG.adKeywords.join("|"), "i");
const blockRegex = new RegExp(AD_CONFIG.blocklist.join("|"), "i");

// --- Ad Detection ---
function isAdElement(element) {
  if (!element || !element.matches || element.dataset.adfriendProcessed) return false;
  if (element.closest("header, nav, footer, aside")) return false;
  if (element.classList.contains("adsbygoogle") || element.hasAttribute("data-ad-client")) {
    return true;
  }

  let rect;
  try {
    rect = element.getBoundingClientRect();
  } catch (e) {
    return false;
  }
  if (rect.width < AD_CONFIG.minSize.width || rect.height < AD_CONFIG.minSize.height) return false;
  if (window.getComputedStyle(element).visibility === "hidden") return false;

  const attributeContent = AD_CONFIG.attributes
    .map(attr => (element.getAttribute(attr) || "").toLowerCase())
    .join(" ");

  return adRegex.test(attributeContent) && !blockRegex.test(attributeContent);
}

// --- Replacement Manager ---
class ReplacementManager {
  replaceAd(adElement) {
    if (!adElement || !adElement.parentNode || adElement.dataset.adfriendProcessed) return;

    adElement.dataset.adfriendProcessed = "true";
    console.log("🔄 Replacing ad:", adElement);

    const { width, height } = adElement.getBoundingClientRect();
    const adWidth = width || 300;
    const adHeight = height || 250;

    const replacement = document.createElement("div");
    replacement.className = "adfriend-replacement";
    Object.assign(replacement.style, {
      width: `${adWidth}px`,
      height: `${adHeight}px`,
      position: "relative",
      zIndex: 99999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f3f3f3",
      border: "1px solid #ccc"
    });

    adElement.style.display = "none";
    adElement.parentNode.insertBefore(replacement, adElement.nextSibling);

    // --- Random Content Generation ---
    const contentOptions = ['quote', 'reminder', 'todo']; // Content types to choose from
    const randomContentType = contentOptions[Math.floor(Math.random() * contentOptions.length)];

    // Retrieve content from storage based on randomContentType
    chrome.storage.local.get([randomContentType], (result) => {
      const customContent = result[randomContentType] || 'This is a custom ad replacement!';
      console.log(`Custom content from storage for ${randomContentType}:`, customContent);

      // Display the content based on the random selection
      if (randomContentType === 'quote') {
        replacement.innerHTML = `<p>"${customContent}"</p>`;
      } else if (randomContentType === 'reminder') {
        replacement.innerHTML = `<p>"${customContent}"</p>`;
      } else if (randomContentType === 'todo') {
        replacement.innerHTML = `<ul><li>${customContent}</li></ul>`;
      } else {
        // Default custom content
        replacement.innerHTML = customContent;
      }
    });
  }
}

const manager = new ReplacementManager();

// --- Initial Scan ---
function initialScan() {
  console.log("🔍 Initial ad scan...");
  const selectors = "ins.adsbygoogle, iframe[src*='ad'], div[id*='ad'], div[class*='ad']";
  document.querySelectorAll(selectors).forEach(element => {
    if (isAdElement(element)) {
      manager.replaceAd(element);
    }
  });
}

// --- Mutation Observer ---
const observer = new MutationObserver(mutations => {
  mutations.forEach(({ addedNodes }) => {
    addedNodes.forEach(node => {
      if (node.nodeType === 1 && isAdElement(node)) {
        manager.replaceAd(node);
      }
    });
  });
});

// --- Initialization ---
function initialize() {
  initialScan();
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

if (document.readyState === "complete") {
  initialize();
} else {
  window.addEventListener("load", initialize);
}

window.addEventListener("beforeunload", () => observer.disconnect());
