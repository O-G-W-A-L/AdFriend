export function renderTodoLists(content, width, height) {
  console.log("Rendering Todo List:", content);
  const container = document.createElement("div");
  container.style.cssText = `
    width: ${width}px;
    height: ${height}px;
    padding: 20px;
    overflow-y: auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    color: #2c3e50;
  `;

  if (!content || content.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.textContent = "No tasks to display. Add some!";
    emptyMessage.style.cssText = `
      text-align: center;
      font-size: 1.2em;
      color: rgba(44, 62, 80, 0.7);
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
      color: #2c3e50;
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.8);
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
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
      if (checkbox.checked) {
        li.style.textDecoration = "line-through";
        li.style.color = "#999";
        li.style.transform = 'translateX(10px)';
      } else {
        li.style.textDecoration = "none";
        li.style.color = "#2c3e50";
        li.style.transform = 'translateX(0)';
      }
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