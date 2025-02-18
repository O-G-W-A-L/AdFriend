// Helper functions for fade animations
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

// Confetti effect
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

// Load reminders from CSV
async function loadCSVReminders() {
  try {
    console.log("Fetching reminders from CSV...");
    const response = await fetch(chrome.runtime.getURL("reminders.csv"));
    const text = await response.text();
    return text.split("\n").map(line => line.trim()).filter(line => line);
  } catch (error) {
    console.error("Error loading reminders from CSV:", error);
    return [];
  }
}

export async function renderReminder(userContent, width, height) {
  let customReminders = userContent && Array.isArray(userContent) && userContent.length
    ? [...userContent]
    : [];

  let csvReminders = await loadCSVReminders();
  
  function getNextReminder() {
    let reminder;
    if (customReminders.length) {
      reminder = customReminders.splice(Math.floor(Math.random() * customReminders.length), 1)[0];
    } else if (csvReminders.length) {
      reminder = csvReminders.splice(Math.floor(Math.random() * csvReminders.length), 1)[0];
    }

    // Extract text properly if it's an object
    return reminder && typeof reminder === "object" ? reminder.text : reminder;
  }

  let activeReminder = getNextReminder();
  if (!activeReminder) return null;

  // Create the container
  const container = document.createElement("div");
  container.style.cssText = `
    position: relative;
    width: ${width}px;
    min-height: ${height}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: #2C3E50;
    border-radius: 12px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
    font-family: 'Poppins', sans-serif;
    color: #FFFFFF;
    text-align: center;
    transition: transform 0.2s ease, opacity 0.3s ease;
  `;

  container.onmouseenter = () => (container.style.transform = "scale(1.05)");
  container.onmouseleave = () => (container.style.transform = "scale(1)");

  // Create text element
  const textEl = document.createElement("div");
  textEl.textContent = activeReminder;
  textEl.style.cssText = `
    font-size: 1.4rem;
    font-weight: bold;
    margin-bottom: 20px;
    max-width: 90%;
    opacity: 1;
  `;

  // Create "Mark Completed" button
  const completeButton = document.createElement("button");
  completeButton.textContent = "✔ Done!";
  completeButton.style.cssText = `
    padding: 12px 28px;
    font-size: 1rem;
    background: #4A90E2;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.1s ease, background 0.2s ease;
    box-shadow: 0 3px 6px rgba(0,0,0,0.15);
  `;

  completeButton.onmouseenter = () => (completeButton.style.background = "#3778C2");
  completeButton.onmouseleave = () => (completeButton.style.background = "#4A90E2");
  completeButton.onmousedown = () => (completeButton.style.transform = "scale(0.95)");
  completeButton.onmouseup = () => (completeButton.style.transform = "scale(1)");

  completeButton.addEventListener("click", async () => {
    await fadeOut(textEl, 300);
    textEl.innerHTML = `✅ <span style="text-decoration: line-through; opacity: 0.7;">${activeReminder}</span>`;
    completeButton.remove();

    // Fun motivational messages
    const messages = [
      "🔥 Keep going! You're amazing!",
      "🚀 Great job! More wins ahead!",
      "👏 Fantastic! Keep it up!",
      "🌟 You're unstoppable!",
      "🎯 Boom! Task completed!",
    ];
    const motivatePopup = document.createElement("div");
    motivatePopup.textContent = messages[Math.floor(Math.random() * messages.length)];
    motivatePopup.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.9);
      color: #3778C2;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: bold;
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

    // Launch confetti
    launchConfetti();

    // Notify background script
    chrome.runtime.sendMessage({ action: "reminderCompleted", reminderText: activeReminder }, async () => {
      setTimeout(async () => {
        if (customReminders.length === 0 && csvReminders.length === 0) {
          csvReminders = await loadCSVReminders();
        }

        let newReminder = getNextReminder();
        if (newReminder) {
          textEl.textContent = newReminder;
          textEl.style.opacity = "0";
          container.appendChild(completeButton);
          setTimeout(() => fadeIn(textEl, 300), 50);
        } else {
          textEl.textContent = "You're all caught up! 🎉";
        }
      }, 2000);
    });
  });

  container.append(textEl, completeButton);
  return container;
}
