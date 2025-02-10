export function renderReminder(content, width, height) {
  console.log("Rendering Reminder:", content);
  if (!content || content.length === 0) return document.createElement('div');

  const container = document.createElement('div');
  container.style.cssText = `
    width: ${width}px;
    min-height: ${height}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 25px;
    background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
    border-radius: 16px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #fff;
    text-align: center;
  `;

  const icon = document.createElement('div');
  icon.style.cssText = `
    font-size: 2.5em;
    margin-bottom: 15px;
  `;
  icon.textContent = "⏰";

  const text = document.createElement('div');
  text.style.cssText = `
    font-size: 1.2em;
    font-weight: 500;
    margin-bottom: 20px;
  `;
  text.textContent = content.join(" ");

  // Add "Task Completed" button
  const completeButton = document.createElement('button');
  completeButton.textContent = "Task Completed";
  completeButton.style.cssText = `
    padding: 10px 20px;
    font-size: 1em;
    color: #ff9a9e;
    background: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease;
  `;
  completeButton.addEventListener('click', () => {
    container.style.transform = 'scale(0.9)';
    setTimeout(() => {
      container.style.display = 'none';
    }, 200);
  });

  completeButton.addEventListener('mouseenter', () => {
    completeButton.style.background = '#f5f5f5';
  });
  completeButton.addEventListener('mouseleave', () => {
    completeButton.style.background = '#fff';
  });

  container.appendChild(icon);
  container.appendChild(text);
  container.appendChild(completeButton);
  return container;
}