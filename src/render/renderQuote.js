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

export async function renderQuote(userContent, width, height, displaySettings) {
  const storedQuotes = await new Promise((resolve) =>
    chrome.storage.local.get("activeQuotes", (s) =>
      resolve(s.activeQuotes || [])
    )
  );

  const customQuotes =
    storedQuotes.length > 0
      ? storedQuotes
      : userContent?.length > 0
      ? userContent
      : [];

  const fallbackQuotes = await loadQuotes();

  if (customQuotes.length === 0 && fallbackQuotes.length === 0) return null;

  let isUsingCustom = customQuotes.length > 0;
  let currentIndex = 0;

  const getQuotesList = () => (isUsingCustom ? customQuotes : fallbackQuotes);

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
    transition: all 0.3s ease;
  `;

  const quoteText = document.createElement("blockquote");
  quoteText.style.cssText = `
    margin: 0;
    line-height: 1.6;
    font-style: italic;
    max-width: 90%;
  `;

  const author = document.createElement("div");
  author.style.cssText = `
    margin-top: 15px;
    font-size: 0.85em;
    opacity: 0.8;
  `;

  container.appendChild(quoteText);
  container.appendChild(author);

  // Navigation Buttons
  const navContainer = document.createElement("div");
  navContainer.style.cssText = `
    margin-top: 20px;
    display: flex;
    gap: 10px;
  `;

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "← Prev";
  prevBtn.style.cssText = `
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    background-color: #444;
    color: white;
    cursor: pointer;
    font-size: 0.85em;
  `;

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next →";
  nextBtn.style.cssText = `
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    background-color: #444;
    color: white;
    cursor: pointer;
    font-size: 0.85em;
  `;

  navContainer.appendChild(prevBtn);
  navContainer.appendChild(nextBtn);
  container.appendChild(navContainer);

  function updateQuote() {
    const currentQuotes = getQuotesList();

    if (currentIndex >= currentQuotes.length) {
      if (isUsingCustom) {
        // Switch to fallback quotes
        isUsingCustom = false;
        currentIndex = 0;
      }
    }

    const list = getQuotesList();
    const quote = list[currentIndex];

    quoteText.textContent = `“${quote.text}”`;
    author.textContent = quote.author ? `— ${quote.author}` : "";
  }

  prevBtn.onclick = () => {
    const list = getQuotesList();
    currentIndex = (currentIndex - 1 + list.length) % list.length;
    updateQuote();
  };

  nextBtn.onclick = () => {
    currentIndex++;
    const list = getQuotesList();
    if (currentIndex >= list.length) {
      if (isUsingCustom) {
        // Switch to CSV
        isUsingCustom = false;
        currentIndex = 0;
      } else {
        currentIndex = 0;
      }
    }
    updateQuote();
  };

  // Initial render
  updateQuote();

  return container;
}
