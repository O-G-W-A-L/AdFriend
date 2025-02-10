export function renderQuote(content, width, height) {
  console.log("Rendering Quote:", content);
  if (!content || content.length === 0) return document.createElement('div');

  const container = document.createElement('div');
  container.style.cssText = `
    width: ${width}px;
    height: ${height}px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-style: italic;
    text-align: center;
    font-family: 'Georgia', serif;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    color: #2c3e50;
    border: 1px solid rgba(255, 255, 255, 0.3);
  `;

  const quoteText = document.createElement('blockquote');
  quoteText.style.cssText = `
    margin: 0;
    font-size: 1.4em;
    line-height: 1.6;
    position: relative;
    padding-left: 30px;
  `;

  // Add a fancy quote mark
  quoteText.innerHTML = `
    <span style="position: absolute; left: 0; top: -10px; font-size: 3em; color: rgba(44, 62, 80, 0.2);">“</span>
    ${content.join("<br>")}
  `;

  container.appendChild(quoteText);
  return container;
}