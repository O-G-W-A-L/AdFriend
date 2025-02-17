let remindersCache = null;

const loadReminders = async () => {
  if (remindersCache) return remindersCache;
  try {
    const res = await fetch(chrome.runtime.getURL("reminders.csv"));
    const csv = await res.text();
    return (remindersCache = csv
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => line.replace(/^"|"$/g, ""))
    );
  } catch (err) {
    console.error("Failed to load reminders:", err);
    return [];
  }
};

const getNextReminder = async () =>
  new Promise(resolve =>
    chrome.storage.local.get(["reminders"], async result => {
      let rems = (result.reminders || []).map(r =>
        typeof r === "object" ? r.text : r
      );
      if (!rems.length) rems = await loadReminders();
      resolve(rems.length ? rems[Math.floor(Math.random() * rems.length)] : null);
    })
  );

export async function renderReminder(userContent, width, height) {
  const reminders =
    userContent && Array.isArray(userContent) && userContent.length
      ? userContent
      : await loadReminders();
  if (!reminders?.length) return null;
  const active = reminders[Math.floor(Math.random() * reminders.length)];
  const reminderText = typeof active === "object" ? active.text : active;

  // Check if the page is using dark theme.
  const isDark =
    document.documentElement.classList.contains("dark") ||
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const container = document.createElement("div");
  container.style.cssText = `
    position: relative;
    width: ${width}px;
    min-height: ${height}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 25px;
    background: ${isDark ? "#2D3748" : "#FFF"};
    border: 1px solid ${isDark ? "#4A5568" : "#E2E8F0"};
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    font-family: 'Segoe UI', system-ui, sans-serif;
    color: ${isDark ? "#E2E8F0" : "#2D3748"};
    text-align: center;
    transition: transform 0.2s ease;
    overflow: hidden;
  `;
  container.onmouseenter = () => (container.style.transform = "translateY(-2px)");
  container.onmouseleave = () => (container.style.transform = "none");

  const text = document.createElement("div");
  text.textContent = reminderText;
  text.style.cssText = `
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 20px;
    line-height: 1.5;
    max-width: 90%;
  `;

  const completeButton = document.createElement("button");
  completeButton.textContent = "Mark Completed";
  completeButton.style.cssText = `
    padding: 8px 20px;
    font-size: 0.95rem;
    background: #48BB78;
    color: #FFF;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.1s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;
  completeButton.onmouseenter = () => (completeButton.style.background = "#38A169");
  completeButton.onmouseleave = () => (completeButton.style.background = "#48BB78");
  completeButton.onmousedown = () => (completeButton.style.transform = "scale(0.95)");
  completeButton.onmouseup = () => (completeButton.style.transform = "scale(1)");
  completeButton.onmouseout = () => (completeButton.style.transform = "scale(1)");

  completeButton.addEventListener("click", async () => {
    text.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#48BB78">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
        </svg>
        <span style="text-decoration: line-through; color: ${isDark ? "#A0AEC0" : "#718096"};">
          ${reminderText}
        </span>
      </div>
    `;
    completeButton.remove();

    // Show motivational popup
    const motivatePopup = document.createElement("div");
    motivatePopup.textContent = "Great job! Keep up the good work!";
    motivatePopup.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(72,187,120,0.9);
      color: #FFF;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 1rem;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    container.appendChild(motivatePopup);
    setTimeout(() => (motivatePopup.style.opacity = "1"), 50);
    setTimeout(() => {
      motivatePopup.style.opacity = "0";
      setTimeout(() => motivatePopup.remove(), 300);
    }, 1500);

    // Notify the background script and then load a new reminder.
    chrome.runtime.sendMessage({ action: "reminderCompleted", reminderText }, () => {
      if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError.message);
      setTimeout(async () => {
        const newReminder = await getNextReminder();
        if (newReminder) {
          text.textContent = typeof newReminder === "object" ? newReminder.text : newReminder;
          container.appendChild(completeButton);
        } else {
          text.textContent = "You're all caught up! 🎉";
        }
      }, 2000);
    });
  });

  container.append(text, completeButton);
  return container;
}
