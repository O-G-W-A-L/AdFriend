"use client";
import React, { useState, useEffect, useCallback } from "react";
import { saveToStorage, getFromStorage } from "./utils/chromeStorage";

// Import components
import Header from "./components/Header";
import DisabledView from "./components/DisabledView";
import Tabs from "./components/Tabs";
import InputArea from "./components/InputArea";
import ActiveItems from "./components/ActiveItems";
import CompletedItems from "./components/CompletedItems";
import DisplaySettings from "./components/DisplaySettings";
import FeedbackPopup from "./components/FeedbackPopup";
import DeleteConfirmation from "./components/DeleteConfirmation";
import Notification from "./components/Notification";

// Default settings
const DEFAULT_DISPLAY_SETTINGS = {
  quote: {
    textColor: "#000000",
    backgroundColor: "#ffffff",
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
  },
  reminder: {
    textColor: "#333333",
    backgroundColor: "#f0f0f0",
    fontSize: "14px",
    fontFamily: "Georgia, serif",
  },
};

const Popup = () => {
  const [type, setType] = useState("quote");
  const [items, setItems] = useState({ quote: [], reminder: [] });
  const [completedItems, setCompletedItems] = useState({ quote: [], reminder: [] });
  const [currentInput, setCurrentInput] = useState({ text: "", author: "" });
  const [theme, setTheme] = useState("light");
  const [notification, setNotification] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ index: null, type: null });
  const [editing, setEditing] = useState({ index: null, text: "" });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [sectionsExpanded, setSectionsExpanded] = useState({ active: true, completed: true });
  const [extensionEnabled, setExtensionEnabled] = useState(true);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [displaySettings, setDisplaySettings] = useState(DEFAULT_DISPLAY_SETTINGS);

  // Derived values
  const isDark = theme === "dark";
  const previewItem = items[type]?.[0] || null;

  // Load stored data on initial render
  useEffect(() => {
    (async () => {
      const [quotes, reminders, compQuotes, compReminders, storedTheme, extEnabled, storedDisplaySettings] =
        await Promise.all([
          getFromStorage("quote") || [],
          getFromStorage("reminder") || [],
          getFromStorage("completedQuotes") || [],
          getFromStorage("completedReminders") || [],
          getFromStorage("theme") || "light",
          getFromStorage("extensionEnabled") !== false,
          getFromStorage("displaySettings") || DEFAULT_DISPLAY_SETTINGS,
        ]);
      
      setItems({ quote: quotes, reminder: reminders });
      setCompletedItems({ quote: compQuotes, reminder: compReminders });
      setTheme(storedTheme);
      setExtensionEnabled(extEnabled);
      setDisplaySettings(storedDisplaySettings);
      
      document.documentElement.className = storedTheme === "system" ? "light" : storedTheme;
    })();
  }, []);

  // Update theme when changed
  useEffect(() => {
    if (theme) {
      saveToStorage("theme", theme);
      document.documentElement.className = theme === "system" ? "light" : theme;
    }
  }, [theme]);

  // Notification helper
  const notify = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  }, []);

  // Save a new item
  const handleSave = useCallback(async () => {
    const { text, author } = currentInput;
    if (!text.trim()) return;
    
    const newItem = { text, author, completed: false };
    const updated = [...items[type], newItem];
    
    await saveToStorage(type, updated);
    setItems(prev => ({ ...prev, [type]: updated }));
    setCurrentInput({ text: "", author: "" });
    notify(`${type} saved!`, "success");
  }, [currentInput, items, type, notify]);

  // Mark item as completed
  const toggleCompleted = useCallback(async (index) => {
    const item = items[type][index];
    const updatedItems = items[type].filter((_, i) => i !== index);
    const updatedCompleted = [...completedItems[type], item];
    
    await saveToStorage(type, updatedItems);
    await saveToStorage(`completed${type.charAt(0).toUpperCase() + type.slice(1)}s`, updatedCompleted);
    
    setItems(prev => ({ ...prev, [type]: updatedItems }));
    setCompletedItems(prev => ({ ...prev, [type]: updatedCompleted }));
    notify(`${type} marked as completed!`, "success");
  }, [items, completedItems, type, notify]);

  // Restore completed item
  const reSaveCompleted = useCallback(async (index) => {
    const item = completedItems[type][index];
    const updatedCompleted = completedItems[type].filter((_, i) => i !== index);
    const updatedItems = [...items[type], { ...item, completed: false }];
    
    await saveToStorage(type, updatedItems);
    await saveToStorage(`completed${type.charAt(0).toUpperCase() + type.slice(1)}s`, updatedCompleted);
    
    setItems(prev => ({ ...prev, [type]: updatedItems }));
    setCompletedItems(prev => ({ ...prev, [type]: updatedCompleted }));
    notify(`${type} re-saved!`, "success");
  }, [completedItems, items, type, notify]);

  // Delete an item
  const deleteItem = useCallback(async () => {
    const { index, type: delType } = deleteConfirm;
    
    if (delType === "active") {
      const updatedItems = items[type].filter((_, i) => i !== index);
      await saveToStorage(type, updatedItems);
      setItems(prev => ({ ...prev, [type]: updatedItems }));
    } else {
      const updatedCompleted = completedItems[type].filter((_, i) => i !== index);
      await saveToStorage(`completed${type.charAt(0).toUpperCase() + type.slice(1)}s`, updatedCompleted);
      setCompletedItems(prev => ({ ...prev, [type]: updatedCompleted }));
    }
    
    setDeleteConfirm({ index: null, type: null });
    notify(`${type} deleted!`, "error");
  }, [deleteConfirm, items, completedItems, type, notify]);

  // Send feedback
  const sendFeedback = useCallback(() => {
    const mailtoLink = `mailto:huntertest02@gmail.com?subject=AdFriend Feedback&body=${encodeURIComponent(feedbackText)}`;
    window.location.href = mailtoLink;
    setFeedbackText("");
    setShowFeedback(false);
    notify("Feedback sent! Thank you!", "success");
  }, [feedbackText, notify]);

  // Modify an item
  const modifyItem = useCallback(async () => {
    const { index, text } = editing;
    if (index === null) return;
    
    const updatedItems = items[type].map((item, i) => 
      i === index ? { ...item, text } : item
    );
    
    await saveToStorage(type, updatedItems);
    setItems(prev => ({ ...prev, [type]: updatedItems }));
    setEditing({ index: null, text: "" });
    notify(`${type} updated!`, "success");
  }, [editing, items, type, notify]);

  // Toggle extension
  const toggleExtension = useCallback(async () => {
    const newState = !extensionEnabled;
    await saveToStorage("extensionEnabled", newState);
    setExtensionEnabled(newState);
    notify(`Extension ${newState ? "enabled" : "disabled"}!`, "success");
  }, [extensionEnabled, notify]);

  // Update display settings
  const updateDisplaySetting = useCallback((settingType, key, value) => {
    setDisplaySettings(prev => ({
      ...prev,
      [settingType]: {
        ...prev[settingType],
        [key]: value,
      },
    }));
  }, []);

  // Save display settings
  const saveDisplaySettings = useCallback(async () => {
    await saveToStorage("displaySettings", displaySettings);
    
    // Notify content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "updateDisplaySettings"
      });
    });
    
    notify("Display settings saved!", "success");
  }, [displaySettings, notify]);

  // Toggle section expansion
  const toggleSection = useCallback((section) => {
    setSectionsExpanded(prev => ({ 
      ...prev, 
      [section]: !prev[section] 
    }));
  }, []);

  return (
    <div className={`min-w-[400px] flex flex-col p-4 transition-colors ${
      isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
    }`}>
      <Header 
        theme={theme} 
        extensionEnabled={extensionEnabled} 
        toggleExtension={toggleExtension} 
        changeTheme={setTheme} 
      />

      {!extensionEnabled ? (
        <DisabledView toggleExtension={toggleExtension} isDark={isDark} />
      ) : (
        <>
          <Tabs type={type} setType={setType} />

          <InputArea
            type={type}
            currentInput={currentInput}
            setCurrentInput={setCurrentInput}
            handleSave={handleSave}
            isDark={isDark}
          />

          <ActiveItems
            activeSectionExpanded={sectionsExpanded.active}
            toggleActiveSection={() => toggleSection('active')}
            items={items[type]}
            type={type}
            isDark={isDark}
            editingIndex={editing.index}
            editingText={editing.text}
            startEditing={(index, text) => setEditing({ index, text })}
            modifyItem={modifyItem}
            toggleCompleted={toggleCompleted}
            openDeleteConfirmation={(index) => setDeleteConfirm({ index, type: "active" })}
            displaySettings={displaySettings[type]}
          />

          <CompletedItems
            completedSectionExpanded={sectionsExpanded.completed}
            toggleCompletedSection={() => toggleSection('completed')}
            completedItems={completedItems[type]}
            type={type}
            isDark={isDark}
            reSaveCompleted={reSaveCompleted}
            openDeleteConfirmation={(index) => setDeleteConfirm({ index, type: "completed" })}
            displaySettings={displaySettings[type]}
          />

          <DisplaySettings
            showDisplaySettings={showDisplaySettings}
            toggleDisplaySettings={() => setShowDisplaySettings(prev => !prev)}
            displaySettings={displaySettings}
            updateDisplaySetting={updateDisplaySetting}
            saveDisplaySettings={saveDisplaySettings}
            isDark={isDark}
            type={type}
            previewItem={previewItem}
            activeItems={items}
          />
        </>
      )}

      {/* Feedback Button */}
      <button
        onClick={() => setShowFeedback(true)}
        className="fixed bottom-4 right-4 p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg transition-transform transform hover:scale-110"
        aria-label="Send Feedback"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 4H8m-4 4h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Modals */}
      {showFeedback && (
        <FeedbackPopup
          feedbackText={feedbackText}
          setFeedbackText={setFeedbackText}
          closeFeedback={() => setShowFeedback(false)}
          sendFeedback={sendFeedback}
          isDark={isDark}
        />
      )}

      {deleteConfirm.index !== null && (
        <DeleteConfirmation
          type={type}
          deleteType={deleteConfirm.type}
          onCancel={() => setDeleteConfirm({ index: null, type: null })}
          onDelete={deleteItem}
          isDark={isDark}
        />
      )}

      {notification && <Notification notification={notification} />}
    </div>
  );
};

export default Popup;