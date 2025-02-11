export function renderReminder(content, width, height) {
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
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
    text-align: center;
    border: 1px solid #e0e0e0;
  `;

  const icon = document.createElement('div');
  icon.style.cssText = `
    font-size: 2.5em;
    margin-bottom: 15px;
    color: #666;
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
  completeButton.textContent = "Mark as Completed";
  completeButton.style.cssText = `
    padding: 10px 20px;
    font-size: 1em;
    color: #fff;
    background: #4CAF50;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease;
  `;

  completeButton.addEventListener('click', () => {
    // Update the task to "Completed"
    text.innerHTML = `
      <span style="text-decoration: line-through; color: #888;">${content.join(" ")}</span>
      <div style="margin-top: 10px; color: #4CAF50; font-weight: bold;">✅ Task Completed!</div>
    `;
    completeButton.style.display = 'none'; // Hide the button after completion

    // Save the completed state to storage
    chrome.storage.local.get(['reminder'], (result) => {
      const reminders = result.reminder || [];
      const updatedReminders = reminders.map(reminder => 
        reminder === content.join(" ") ? `✅ ${reminder}` : reminder
      );
      chrome.storage.local.set({ reminder: updatedReminders });
    });
  });

  container.appendChild(icon);
  container.appendChild(text);
  container.appendChild(completeButton);
  return container;
}