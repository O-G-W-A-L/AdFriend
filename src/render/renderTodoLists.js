export function renderTodoLists(content, width, height, onComplete) {
  const container = document.createElement("div");
  container.style.cssText = `
    width: ${width}px;
    height: ${height}px;
    padding: 20px;
    overflow-y: auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    color: #333;
    border: 1px solid #e0e0e0;
  `;

  if (!content || content.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.textContent = "All to-do online today is done, just don't forget to do some exercises";
    emptyMessage.style.cssText = `
      text-align: center;
      font-size: 1.2em;
      color: #888;
      margin-top: 20px;
    `;
    container.appendChild(emptyMessage);
    return container;
  }

  const ul = document.createElement("ul");
  ul.style.cssText = `
    padding-left: 0;
    margin: 0;
    list-style-type: none;
  `;

  content.forEach(task => {
    const li = document.createElement("li");
    li.style.cssText = `
      margin: 10px 0;
      font-size: 1em;
      display: flex;
      align-items: center;
      background: #f9f9f9;
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: background 0.3s ease;
    `;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.style.cssText = `
      margin-right: 12px;
      width: 18px;
      height: 18px;
      cursor: pointer;
    `;

    checkbox.addEventListener("change", () => {
      chrome.storage.local.get(['todo'], (result) => {
        const todos = result.todo || [];
        const updatedTodos = todos.filter(t => t.text !== task.text);
        chrome.storage.local.set({ todo: updatedTodos }, () => {
          if (onComplete) onComplete(); // Refresh the content
        });
      });
    });

    const taskText = document.createElement("span");
    taskText.textContent = `${task.text}${task.time ? " (" + task.time + ")" : ""}`;
    taskText.style.cssText = `flex: 1;`;

    li.appendChild(checkbox);
    li.appendChild(taskText);
    ul.appendChild(li);
  });

  container.appendChild(ul);
  return container;
}