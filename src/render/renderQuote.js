// renderQuote.js
let quotesCache = null;

async function loadQuotes() {
  if (quotesCache) return quotesCache;
  try {
    const response = await fetch(chrome.runtime.getURL("quotes.csv"));
    const csvText = await response.text();
    let lines = csvText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    // Remove header if present.
    if (
      lines.length > 0 &&
      (lines[0].toLowerCase().includes("quote") ||
        lines[0].toLowerCase().includes("author"))
    ) {
      lines.shift();
    }
    quotesCache = lines
      .map((line) => {
        if (line.indexOf(",") === -1) {
          return { text: line.replace(/^"|"$/g, ""), author: "" };
        } else {
          const idx = line.indexOf(",");
          return {
            text: line.substring(0, idx).replace(/^"|"$/g, "").trim(),
            author: line.substring(idx + 1).replace(/^"|"$/g, "").trim(),
          };
        }
      })
      .filter((item) => item && item.text);
    return quotesCache;
  } catch (error) {
    console.error("Failed to load quotes:", error);
    return [];
  }
}

export async function renderQuote(userContent, width, height) {
  // First, check for active quotes stored in Chrome storage.
  const storedQuotes = await new Promise((resolve) =>
    chrome.storage.local.get("activeQuotes", (s) =>
      resolve(s.activeQuotes || [])
    )
  );
  // Use stored quotes if available; else use userContent if provided; otherwise, load from CSV.
  let quotes =
    storedQuotes.length > 0
      ? storedQuotes
      : userContent?.length > 0
      ? userContent.map((q) =>
          typeof q === "string" ? { text: q, author: "" } : q
        )
      : await loadQuotes();
  if (!quotes.length) return null;

  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  // Get display settings (with default values if none are saved)
  const displaySettings = await new Promise((resolve) =>
    chrome.storage.local.get("displaySettings", (s) =>
      resolve(
        s.displaySettings || {
          textColor: "#000000",
          backgroundColor: "#ffffff",
          fontSize: "16px",
          fontFamily: "Arial, sans-serif",
        }
      )
    )
  );

  const container = document.createElement("div");
  container.style.cssText = `
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: ${displaySettings.backgroundColor};
    border-radius: 8px;
    color: ${displaySettings.textColor};
    font-family: ${displaySettings.fontFamily};
    font-size: ${displaySettings.fontSize};
    text-align: center;
    transition: transform 0.2s ease;
  `;

  const quoteText = document.createElement("blockquote");
  quoteText.textContent = `“${quote.text}”`;
  quoteText.style.cssText = `
    margin: 0;
    line-height: 1.6;
    font-style: italic;
    max-width: 90%;
  `;
  container.appendChild(quoteText);

  if (quote.author) {
    const author = document.createElement("div");
    author.textContent = `— ${quote.author}`;
    author.style.cssText = `
      margin-top: 15px;
      font-size: 0.85em;
      opacity: 0.8;
    `;
    container.appendChild(author);
  }

  return container;
}
