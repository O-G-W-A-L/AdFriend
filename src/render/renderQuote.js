export function renderQuote(content, width, height) {
  if (!content || content.length === 0) return document.createElement('div');

  const container = document.createElement('div');
  container.style.cssText = `
    width: ${width}px;
    height: ${height}px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    color: #333;
    font-family: 'Georgia', serif;
    text-align: center;
    border: 1px solid #e0e0e0;
  `;

  const quoteText = document.createElement('blockquote');
  quoteText.style.cssText = `
    margin: 0;
    font-size: 1.4em;
    line-height: 1.6;
    font-style: italic;
  `;
  quoteText.textContent = `“${content.join(" ")}”`;

  container.appendChild(quoteText);
  return container;
}