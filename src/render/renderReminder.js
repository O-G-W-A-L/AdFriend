let customPool = [];
let customInitialized = false;
let csvPool = [];

// Helper functions for animations
function fadeOut(el, duration) {
  return new Promise(resolve => {
    el.style.transition = `opacity ${duration}ms ease`;
    el.style.opacity = 0;
    setTimeout(resolve, duration);
  });
}

function fadeIn(el, duration) {
  return new Promise(resolve => {
    el.style.transition = `opacity ${duration}ms ease`;
    el.style.opacity = 1;
    setTimeout(resolve, duration);
  });
}

function launchConfetti() {
  const confettiEl = document.createElement("div");
  confettiEl.innerHTML = "🎉";
  confettiEl.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 3rem;
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
    animation: popEffect 0.8s ease-out forwards;
  `;
  document.body.appendChild(confettiEl);
  setTimeout(() => confettiEl.remove(), 800);
}

async function loadCSVReminders() {
  if (csvPool.length) return csvPool;
  try {
    const response = await fetch(chrome.runtime.getURL("reminders.csv"));
    csvPool = (await response.text())
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l);
  } catch (e) {
    console.error("Error loading CSV:", e);
  }
  return csvPool;
}

export async function renderReminder(userContent, width, height) {
  // First, check for active reminders saved in Chrome storage
  let storedReminders = await new Promise((resolve) =>
    chrome.storage.local.get("activeReminders", (s) =>
      resolve(s.activeReminders || [])
    )
  );

  // Initialize customPool from userContent (only once) if provided
  if (!customInitialized && userContent?.length) {
    customPool = [...userContent];
    customInitialized = true;
  }

  // Load reminders from available sources
  let reminders = [];
  if (storedReminders.length > 0) {
    reminders = [...storedReminders];
  } else if (customPool.length > 0) {
    reminders = [...customPool];
  } else {
    reminders = await loadCSVReminders();
  }

  if (!reminders.length) return null;

  // Get display settings
  const displaySettings = await new Promise((resolve) =>
    chrome.storage.local.get("displaySettings", (s) =>
      resolve(s.displaySettings || {
        textColor: "#000000",
        backgroundColor: "#ffffff",
        fontSize: "16px",
        fontFamily: "Arial, sans-serif",
      })
    )
  );

  const container = document.createElement("div");
  container.style.cssText = `
    width: ${width}px;
    min-height: ${height}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: ${displaySettings.backgroundColor};
    border-radius: 8px;
    color: ${displaySettings.textColor};
    font-family: ${displaySettings.fontFamily};
    font-size: ${displaySettings.fontSize};
    text-align: center;
    transition: transform 0.2s ease;
    position: relative;
  `;

  let currentReminderIndex = Math.floor(Math.random() * reminders.length);
  let currentReminder = reminders[currentReminderIndex];

  // Create text element
  const textEl = document.createElement("div");
  textEl.textContent = typeof currentReminder === "object" 
    ? currentReminder.text 
    : currentReminder;
  textEl.style.cssText = `
    margin-bottom: 15px;
    font-weight: 500;
    max-width: 90%;
    opacity: 1;
    transition: opacity 0.3s ease;
  `;

  // Create action button
  const button = document.createElement("button");
  button.textContent = "✔ Done!";
  button.style.cssText = `
    padding: 8px 20px;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: opacity 0.2s ease;
  `;

  // Click handler with new logic
  button.addEventListener("click", async () => {
    // Fade out current reminder
    await fadeOut(textEl, 300);
    
    // Mark as completed
    textEl.innerHTML = `✅ <span style="text-decoration: line-through; opacity: 0.7;">
      ${typeof currentReminder === "object" ? currentReminder.text : currentReminder}
    </span>`;
    
    // Remove the button
    button.remove();

    // Show confetti
    launchConfetti();

    // Show motivational message
    const messages = [
      "Great job! 🎉",
      "Well done! 👏",
      "Task completed! ✅",
      "You're awesome! 💪",
      "Keep it up! 🚀"
    ];
    const motivation = document.createElement("div");
    motivation.textContent = messages[Math.floor(Math.random() * messages.length)];
    motivation.style.cssText = `
      position: absolute;
      bottom: 20px;
      font-size: 0.9em;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    container.appendChild(motivation);
    
    setTimeout(() => {
      motivation.style.opacity = "1";
      setTimeout(() => motivation.style.opacity = "0", 1500);
    }, 100);

    // Prepare next reminder after delay
    setTimeout(async () => {
      // Remove completed reminder from appropriate source
      if (storedReminders.length > 0) {
        storedReminders = storedReminders.filter((_, i) => i !== currentReminderIndex);
        await chrome.storage.local.set({ activeReminders: storedReminders });
      } else if (customPool.length > 0) {
        customPool = customPool.filter((_, i) => i !== currentReminderIndex);
      } else {
        csvPool = csvPool.filter((_, i) => i !== currentReminderIndex);
      }

      // Reload reminders
      const newReminders = storedReminders.length > 0 
        ? storedReminders 
        : customPool.length > 0 
        ? customPool 
        : await loadCSVReminders();

      if (newReminders.length > 0) {
        // Get new random reminder
        currentReminderIndex = Math.floor(Math.random() * newReminders.length);
        currentReminder = newReminders[currentReminderIndex];
        
        // Update text element
        textEl.style.opacity = "0";
        textEl.innerHTML = typeof currentReminder === "object" 
          ? currentReminder.text 
          : currentReminder;
        
        // Re-add button
        container.appendChild(button);
        await fadeIn(textEl, 300);
      } else {
        textEl.innerHTML = "All caught up! 🎉";
        textEl.style.opacity = "1";
      }
    }, 2000);
  });

  container.append(textEl, button);
  return container;
}