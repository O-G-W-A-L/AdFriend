let customPool = [];
let customInitialized = false;
let csvPool = [];

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
    pointer-events: none;
    z-index: 9999;
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

async function getStoredReminders() {
  return new Promise((resolve) =>
    chrome.storage.local.get("activeReminders", (s) =>
      resolve(s.activeReminders || [])
    )
  );
}

async function saveStoredReminders(reminders) {
  return new Promise((resolve) =>
    chrome.storage.local.set({ activeReminders: reminders }, resolve)
  );
}

export async function renderReminder(userContent, width, height, displaySettings, containerEl = null) {
  let reminders = await getStoredReminders();
  if (!reminders.length && userContent?.length > 0) {
    reminders = userContent;
    await saveStoredReminders(reminders);
  }

  if (!reminders.length) return null;

  const reminder = reminders[Math.floor(Math.random() * reminders.length)];

  const container = containerEl || document.createElement("div");
  container.innerHTML = "";
  Object.assign(container.style, {
    width: `${width}px`,
    height: `${height}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '15px',
    background: displaySettings.backgroundColor,
    color: displaySettings.textColor,
    fontFamily: displaySettings.fontFamily,
    fontSize: displaySettings.fontSize,
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    overflow: 'hidden'
  });

  const contentWrapper = document.createElement("div");
  Object.assign(contentWrapper.style, {
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  });

  const iconElement = document.createElement("div");
  iconElement.textContent = "⏰";
  Object.assign(iconElement.style, {
    fontSize: `${parseInt(displaySettings.fontSize) * 1.5}px`,
    marginBottom: '8px'
  });

  const textElement = document.createElement("div");
  textElement.textContent = reminder.text;
  Object.assign(textElement.style, {
    fontSize: displaySettings.fontSize,
    lineHeight: '1.4',
    fontWeight: '500',
    wordWrap: 'break-word',
    maxHeight: `${height * 0.7}px`,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-line-clamp': '4',
    '-webkit-box-orient': 'vertical'
  });

  contentWrapper.appendChild(iconElement);
  contentWrapper.appendChild(textElement);

  if (reminder.timestamp || reminder.priority) {
    const metaElement = document.createElement("div");
    metaElement.textContent = reminder.timestamp || 
      (reminder.priority ? `Priority: ${reminder.priority}` : '');
    Object.assign(metaElement.style, {
      fontSize: `${parseInt(displaySettings.fontSize) * 0.8}px`,
      opacity: '0.8',
      marginTop: '8px'
    });
    contentWrapper.appendChild(metaElement);
  }

  // DONE BUTTON
  const doneBtn = document.createElement("button");
  doneBtn.textContent = "✓ Complete";
  Object.assign(doneBtn.style, {
    marginTop: '15px',
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(76, 175, 80, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  });

  doneBtn.addEventListener('mouseenter', () => {
    Object.assign(doneBtn.style, {
      backgroundColor: '#45a049',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)'
    });
  });

  doneBtn.addEventListener('mouseleave', () => {
    Object.assign(doneBtn.style, {
      backgroundColor: '#4CAF50',
      transform: 'translateY(0)',
      boxShadow: '0 2px 4px rgba(76, 175, 80, 0.2)'
    });
  });

  doneBtn.addEventListener('click', async () => {
    try {
      // Remove current reminder from storage
      const updated = reminders.filter(r => r.text !== reminder.text);
      await saveStoredReminders(updated);

      launchConfetti();
      await fadeOut(container, 300);

      const remainingStored = await getStoredReminders();
      
      if (remainingStored.length > 0) {
        await renderReminder(userContent, width, height, displaySettings, container);
      } else {
        const csvReminders = await loadCSVReminders();
        if (csvReminders.length > 0) {
          const randomIndex = Math.floor(Math.random() * csvReminders.length);
          const csvReminder = csvReminders[randomIndex];

          csvPool = csvPool.filter((_, i) => i !== randomIndex);

          container.innerHTML = "";
          const contentWrapper = document.createElement("div");
          Object.assign(contentWrapper.style, {
            width: '100%',
            textAlign: 'center',
            padding: '20px'
          });
          
          contentWrapper.innerHTML = `
            <div style="font-size: ${displaySettings.fontSize}; margin-bottom: 15px;">
              ${csvReminder}
            </div>
          `;
          
          container.appendChild(contentWrapper);
        } else {
          container.innerHTML = `
            <div style="text-align: center; color: ${displaySettings.textColor}">
              <div style="font-size: 24px; margin-bottom: 10px">🎉</div>
              <div style="font-size: ${displaySettings.fontSize}">All caught up!</div>
            </div>
          `;
        }
      }
      await fadeIn(container, 300);
    } catch (error) {
      console.error('Error handling reminder completion:', error);
    }
  });

  container.addEventListener('mouseenter', () => {
    container.style.transform = 'scale(1.02)';
    container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
  });
  container.addEventListener('mouseleave', () => {
    container.style.transform = 'scale(1)';
    container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  });

  contentWrapper.appendChild(doneBtn);
  container.appendChild(contentWrapper);

  return container;
}
