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
  Object.assign(container.style, {
    width: `${width}px`,
    height: `${height}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    background: `linear-gradient(135deg, ${displaySettings.backgroundColor}f0, ${displaySettings.backgroundColor}e0)`,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    color: displaySettings.textColor,
    fontFamily: displaySettings.fontFamily,
    fontSize: displaySettings.fontSize,
    textAlign: 'center',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden'
  });

  // Add subtle gradient overlay
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
    pointerEvents: 'none',
    borderRadius: '24px'
  });
  container.appendChild(overlay);

  // Quote icon
  const quoteIcon = document.createElement("div");
  quoteIcon.innerHTML = '"';
  Object.assign(quoteIcon.style, {
    fontSize: `${parseInt(displaySettings.fontSize) * 3}px`,
    opacity: '0.2',
    fontFamily: 'Georgia, serif',
    fontWeight: 'bold',
    position: 'absolute',
    top: '20px',
    left: '24px',
    lineHeight: '1',
    pointerEvents: 'none',
    zIndex: '1'
  });
  container.appendChild(quoteIcon);

  const contentWrapper = document.createElement("div");
  Object.assign(contentWrapper.style, {
    position: 'relative',
    zIndex: '2',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px'
  });

  const quoteText = document.createElement("blockquote");
  Object.assign(quoteText.style, {
    margin: '0',
    lineHeight: '1.7',
    fontStyle: 'italic',
    fontWeight: '400',
    maxWidth: '90%',
    opacity: '0',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    fontSize: `${parseInt(displaySettings.fontSize) * 1.1}px`,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    letterSpacing: '0.3px',
    position: 'relative'
  });

  const author = document.createElement("div");
  Object.assign(author.style, {
    fontSize: `${parseInt(displaySettings.fontSize) * 0.9}px`,
    opacity: '0',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    fontWeight: '500',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    position: 'relative'
  });

  // Add decorative line before author
  const decorativeLine = document.createElement("div");
  Object.assign(decorativeLine.style, {
    width: '40px',
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${displaySettings.textColor}60, transparent)`,
    margin: '0 auto 12px',
    borderRadius: '1px'
  });

  const authorWrapper = document.createElement("div");
  authorWrapper.appendChild(decorativeLine);
  authorWrapper.appendChild(author);

  contentWrapper.appendChild(quoteText);
  contentWrapper.appendChild(authorWrapper);

  const navContainer = document.createElement("div");
  Object.assign(navContainer.style, {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '8px'
  });

  function createNavButton(symbol, isDisabled = false) {
    const btn = document.createElement("button");
    btn.innerHTML = symbol;
    Object.assign(btn.style, {
      width: '48px',
      height: '48px',
      fontSize: '20px',
      fontWeight: '600',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: displaySettings.textColor,
      borderRadius: '14px',
      cursor: 'pointer',
      opacity: isDisabled ? '0.3' : '1',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    });
    btn.disabled = isDisabled;

    // Add subtle inner glow
    const innerGlow = document.createElement("div");
    Object.assign(innerGlow.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
      borderRadius: '14px',
      pointerEvents: 'none'
    });
    btn.appendChild(innerGlow);

    const buttonText = document.createElement("span");
    buttonText.innerHTML = symbol;
    Object.assign(buttonText.style, {
      position: 'relative',
      zIndex: '1'
    });
    btn.appendChild(buttonText);

    btn.addEventListener('mouseenter', () => {
      if (!btn.disabled) {
        Object.assign(btn.style, {
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(76, 175, 80, 0.1))',
          borderColor: 'rgba(76, 175, 80, 0.5)',
          transform: 'translateY(-3px) scale(1.05)',
          boxShadow: '0 12px 30px rgba(76, 175, 80, 0.25)'
        });
      }
    });

    btn.addEventListener('mouseleave', () => {
      Object.assign(btn.style, {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        transform: 'translateY(0) scale(1)',
        boxShadow: 'none'
      });
    });

    btn.addEventListener('mousedown', () => {
      btn.style.transform = 'translateY(-1px) scale(0.98)';
    });

    btn.addEventListener('mouseup', () => {
      btn.style.transform = 'translateY(-3px) scale(1.05)';
    });

    return btn;
  }

  const prevBtn = createNavButton("‹");
  const nextBtn = createNavButton("›");

  navContainer.appendChild(prevBtn);
  navContainer.appendChild(nextBtn);
  contentWrapper.appendChild(navContainer);
  container.appendChild(contentWrapper);

  function updateQuote() {
    quoteText.style.opacity = 0;
    author.style.opacity = 0;
    quoteText.style.transform = 'translateY(20px)';
    author.style.transform = 'translateY(20px)';

    setTimeout(() => {
      const list = getQuotesList();

      if (currentIndex >= list.length) {
        if (isUsingCustom) {
          isUsingCustom = false;
          currentIndex = 0;
        }
      }

      const currentQuotes = getQuotesList();
      const quote = currentQuotes[currentIndex];

      quoteText.textContent = `"${quote.text}"`;
      author.textContent = quote.author ? `${quote.author}` : "";

      setTimeout(() => {
        quoteText.style.opacity = 1;
        author.style.opacity = quote.author ? 0.8 : 0;
        quoteText.style.transform = 'translateY(0)';
        author.style.transform = 'translateY(0)';
      }, 100);
    }, 250);
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
        isUsingCustom = false;
        currentIndex = 0;
      } else {
        currentIndex = 0;
      }
    }
    updateQuote();
  };

  container.addEventListener('mouseenter', () => {
    Object.assign(container.style, {
      transform: 'translateY(-6px) scale(1.02)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), 0 8px 20px rgba(0, 0, 0, 0.15)'
    });
  });
  
  container.addEventListener('mouseleave', () => {
    Object.assign(container.style, {
      transform: 'translateY(0) scale(1)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)'
    });
  });

  updateQuote();
  return container;
}