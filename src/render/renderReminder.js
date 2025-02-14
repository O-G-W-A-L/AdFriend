let remindersCache = null;

async function loadReminders() {
  if (remindersCache) return remindersCache;
  try {
    const response = await fetch(chrome.runtime.getURL("reminders.csv"));
    const csvText = await response.text();
    remindersCache = csvText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.replace(/^"|"$/g, ""));
    return remindersCache;
  } catch (error) {
    console.error("Failed to load reminders:", error);
    return [];
  }
}

// Fix: Ensure we correctly retrieve and convert reminders
async function getNextReminder() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["reminders"], async (result) => {
      let reminders = result.reminders || [];

      // Fix: Convert stored objects into strings if needed
      reminders = reminders.map((reminder) => 
        typeof reminder === "object" && reminder.text ? reminder.text : String(reminder)
      );

      if (reminders.length === 0) {
        reminders = await loadReminders(); // Load default reminders if storage is empty
      }

      const nextReminder = reminders.length > 0 ? reminders[Math.floor(Math.random() * reminders.length)] : null;
      resolve(nextReminder);
    });
  });
}

export async function renderReminder(userContent, width, height) {
  let reminders;
  if (userContent && Array.isArray(userContent) && userContent.length > 0) {
    reminders = userContent;
  } else {
    reminders = await loadReminders();
  }
  if (!reminders || reminders.length === 0) return null;

  let activeReminder = reminders[Math.floor(Math.random() * reminders.length)];

  // Fix: Ensure activeReminder is always a string
  activeReminder = typeof activeReminder === "object" && activeReminder.text ? activeReminder.text : String(activeReminder);

  // Set up container to match intercepted ad dimensions.
  const container = document.createElement("div");
  container.style.cssText = `
    width: ${width}px;
    min-height: ${height}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 25px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-family: 'Segoe UI', system-ui, sans-serif;
    color: #2d3748;
    text-align: center;
    border: 1px solid #e2e8f0;
    transition: transform 0.2s ease;
    overflow: hidden;
  `;
  container.onmouseenter = () => (container.style.transform = "translateY(-2px)");
  container.onmouseleave = () => (container.style.transform = "none");

  const text = document.createElement("div");
  text.textContent = activeReminder;
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
    background: #48bb78;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  `;
  completeButton.onmouseenter = () => (completeButton.style.background = "#38a169");
  completeButton.onmouseleave = () => (completeButton.style.background = "#48bb78");

  completeButton.addEventListener("click", async () => {
    text.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#48bb78">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
        </svg>
        <span style="text-decoration: line-through; color: #718096">
          ${activeReminder}
        </span>
      </div>
    `;
    completeButton.remove();

    chrome.storage.local.get(["reminders"], async (result) => {
      let updatedReminders = (result.reminders || []).filter((r) => {
        const reminderText = typeof r === "object" && r.text ? r.text : String(r);
        return reminderText !== activeReminder;
      });

      chrome.storage.local.set({ reminders: updatedReminders }, async () => {
        // Wait 2 seconds and replace with a new reminder
        setTimeout(async () => {
          const newReminder = await getNextReminder();
          if (newReminder) {
            text.textContent = newReminder;
            container.appendChild(completeButton);
          } else {
            text.textContent = "You're all caught up! 🎉";
          }
        }, 2000);
      });
    });
  });

  container.appendChild(text);
  container.appendChild(completeButton);
  return container;
}
