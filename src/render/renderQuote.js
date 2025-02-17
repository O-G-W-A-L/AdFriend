let quotesCache = null;

async function loadQuotes() {
  if (quotesCache) return quotesCache;
  try {
    const response = await fetch(chrome.runtime.getURL("quotes.csv"));
    const csvText = await response.text();
    let lines = csvText.split("\n").map((line) => line.trim()).filter((line) => line);
    if (lines.length > 0 && (lines[0].toLowerCase().includes("quote") || lines[0].toLowerCase().includes("author"))) {
      lines.shift();
    }
    quotesCache = lines.map((line) => {
      if (line.indexOf(",") === -1) {
        return { text: line.replace(/^"|"$/g, ""), author: "" };
      } else {
        const idx = line.indexOf(",");
        return {
          text: line.substring(0, idx).replace(/^"|"$/g, "").trim(),
          author: line.substring(idx + 1).replace(/^"|"$/g, "").trim(),
        };
      }
    }).filter((item) => item && item.text);
    console.log("Loaded quotes:", quotesCache);
    return quotesCache;
  } catch (error) {
    console.error("Failed to load quotes:", error);
    return [];
  }
}

export async function renderQuote(userContent, width, height) {
  let quotes;

  // If user added quotes, use them first
  if (userContent && Array.isArray(userContent) && userContent.length > 0) {
    quotes = userContent.map((quote) => (typeof quote === "string" ? { text: quote, author: "" } : quote));
  } else {
    quotes = await loadQuotes();
  }

  if (!quotes || quotes.length === 0) {
    console.error("No quotes available");
    return null;
  }

  // Randomly select a quote and log for debugging
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  console.log("Selected quote index:", randomIndex, "Quote:", quote);

  // Check if the page is using dark theme.
  const isDark =
    document.documentElement.classList.contains("dark") ||
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Set up container using intercepted ad dimensions.
  const container = document.createElement("div");
  container.style.cssText = `
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    background: ${isDark ? "#2D3748" : "#FFF"};
    border: 1px solid ${isDark ? "#4A5568" : "#E2E8F0"};
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    color: ${isDark ? "#E2E8F0" : "#2D3748"};
    text-align: center;
    transition: transform 0.2s ease;
    overflow: hidden;
  `;
  container.onmouseenter = () => (container.style.transform = "scale(1.02)");
  container.onmouseleave = () => (container.style.transform = "none");

  const quoteText = document.createElement("blockquote");
  quoteText.textContent = `“${quote.text}”`;
  quoteText.style.cssText = `
    margin: 0;
    font-size: 1.3rem;
    line-height: 1.6;
    font-style: italic;
    font-family: 'Georgia', serif;
    max-width: 90%;
    padding: 0 30px;
  `;

  container.appendChild(quoteText);
  if (quote.author) {
    const author = document.createElement("div");
    author.textContent = `— ${quote.author}`;
    author.style.cssText = `
      margin-top: 20px;
      font-size: 1rem;
      color: ${isDark ? "#A0AEC0" : "#718096"};
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-weight: 500;
    `;
    container.appendChild(author);
  }
  return container;
}