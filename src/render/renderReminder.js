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
    padding: '24px',
    background: `linear-gradient(135deg, ${displaySettings.backgroundColor}f0, ${displaySettings.backgroundColor}e0)`,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: displaySettings.textColor,
    fontFamily: displaySettings.fontFamily,
    fontSize: displaySettings.fontSize,
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    position: 'relative'
  });

  // Add subtle gradient overlay
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
    pointerEvents: 'none',
    borderRadius: '20px'
  });
  container.appendChild(overlay);

  const contentWrapper = document.createElement("div");
  Object.assign(contentWrapper.style, {
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    position: 'relative',
    zIndex: '2'
  });

  const iconElement = document.createElement("div");
  iconElement.textContent = "⏰";
  Object.assign(iconElement.style, {
    fontSize: `${parseInt(displaySettings.fontSize) * 2}px`,
    marginBottom: '4px',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
    animation: 'pulse 2s ease-in-out infinite'
  });

  const textElement = document.createElement("div");
  textElement.textContent = reminder.text;
  Object.assign(textElement.style, {
    fontSize: displaySettings.fontSize,
    lineHeight: '1.6',
    fontWeight: '500',
    wordWrap: 'break-word',
    maxHeight: `${height * 0.6}px`,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-line-clamp': '4',
    '-webkit-box-orient': 'vertical',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    letterSpacing: '0.3px'
  });

  contentWrapper.appendChild(iconElement);
  contentWrapper.appendChild(textElement);

  if (reminder.timestamp || reminder.priority) {
    const metaElement = document.createElement("div");
    metaElement.textContent = reminder.timestamp || 
      (reminder.priority ? `Priority: ${reminder.priority}` : '');
    Object.assign(metaElement.style, {
      fontSize: `${parseInt(displaySettings.fontSize) * 0.85}px`,
      opacity: '0.7',
      marginTop: '4px',
      padding: '4px 12px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.05)'
    });
    contentWrapper.appendChild(metaElement);
  }

  const doneBtn = document.createElement("button");
  doneBtn.textContent = "✓ Complete";
  Object.assign(doneBtn.style, {
    marginTop: '20px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1))',
    border: '1px solid rgba(76, 175, 80, 0.3)',
    borderRadius: '50px',
    color: displaySettings.textColor,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    letterSpacing: '0.5px',
    position: 'relative',
    overflow: 'hidden'
  });

  doneBtn.addEventListener('mouseenter', () => {
    Object.assign(doneBtn.style, {
      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.4), rgba(76, 175, 80, 0.2))',
      borderColor: 'rgba(76, 175, 80, 0.6)',
      transform: 'translateY(-2px) scale(1.02)',
      boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
    });
  });

  doneBtn.addEventListener('mouseleave', () => {
    Object.assign(doneBtn.style, {
      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1))',
      borderColor: 'rgba(76, 175, 80, 0.3)',
      transform: 'translateY(0) scale(1)',
      boxShadow: 'none'
    });
  });

  doneBtn.addEventListener('click', async () => {
    try {
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
          let currentIndex = 0;

          function renderCSV(index) {
            container.innerHTML = "";
            
            const overlay = document.createElement("div");
            Object.assign(overlay.style, {
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              pointerEvents: 'none',
              borderRadius: '20px'
            });
            container.appendChild(overlay);

            const contentWrapper = document.createElement("div");
            Object.assign(contentWrapper.style, {
              width: '100%',
              textAlign: 'center',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              position: 'relative',
              zIndex: '2'
            });

            const reminderText = document.createElement("div");
            reminderText.textContent = csvReminders[index];
            Object.assign(reminderText.style, {
              fontSize: displaySettings.fontSize,
              lineHeight: '1.6',
              fontWeight: '500',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              letterSpacing: '0.3px'
            });

            const navWrapper = document.createElement("div");
            Object.assign(navWrapper.style, {
              display: 'flex',
              gap: '16px',
              marginTop: '8px'
            });

            const makeNavBtn = (label, isDisabled) => {
              const btn = document.createElement("button");
              btn.textContent = label;
              Object.assign(btn.style, {
                width: '44px',
                height: '44px',
                fontSize: '18px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: displaySettings.textColor,
                borderRadius: '12px',
                cursor: 'pointer',
                opacity: isDisabled ? '0.3' : '1',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              });
              btn.disabled = isDisabled;

              btn.addEventListener('mouseenter', () => {
                if (!btn.disabled) {
                  Object.assign(btn.style, {
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(76, 175, 80, 0.1))',
                    borderColor: 'rgba(76, 175, 80, 0.5)',
                    transform: 'translateY(-2px) scale(1.05)',
                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.2)'
                  });
                }
              });

              btn.addEventListener('mouseleave', () => {
                Object.assign(btn.style, {
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(0) scale(1)',
                  boxShadow: 'none'
                });
              });

              return btn;
            };

            const prevBtn = makeNavBtn("‹", index === 0);
            const nextBtn = makeNavBtn("›", index === csvReminders.length - 1);

            prevBtn.onclick = () => renderCSV(Math.max(0, index - 1));
            nextBtn.onclick = () => renderCSV(Math.min(csvReminders.length - 1, index + 1));

            navWrapper.appendChild(prevBtn);
            navWrapper.appendChild(nextBtn);

            contentWrapper.appendChild(reminderText);
            contentWrapper.appendChild(navWrapper);
            container.appendChild(contentWrapper);
          }

          renderCSV(currentIndex);
        } else {
          container.innerHTML = `
            <div style="text-align: center; color: ${displaySettings.textColor}; position: relative; z-index: 2;">
              <div style="font-size: 48px; margin-bottom: 16px; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));">🎉</div>
              <div style="font-size: ${displaySettings.fontSize}; font-weight: 600; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">All caught up!</div>
              <div style="font-size: ${parseInt(displaySettings.fontSize) * 0.85}px; opacity: 0.7; margin-top: 8px;">Great job staying on top of things!</div>
            </div>
          `;
        }
      }

      await fadeIn(container, 300);
    } catch (error) {
      console.error('Error handling reminder completion:', error);
    }
  });

  contentWrapper.appendChild(doneBtn);
  container.appendChild(contentWrapper);

  container.addEventListener('mouseenter', () => {
    Object.assign(container.style, {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.18), 0 8px 16px rgba(0, 0, 0, 0.12)'
    });
  });
  
  container.addEventListener('mouseleave', () => {
    Object.assign(container.style, {
      transform: 'translateY(0) scale(1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)'
    });
  });

  return container;
}