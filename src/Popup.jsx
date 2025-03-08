"use client";
import React, { useState, useEffect } from "react";
import { saveToStorage, getFromStorage } from "./utils/chromeStorage";

// Import components from the components folder
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

const Popup = () => {
  const [state, setState] = useState({
    type: "quote",
    items: { quote: [], reminder: [] },
    completedItems: { quote: [], reminder: [] },
    currentInput: { text: "", author: "" },
    theme: "light",
    showNotification: null,
    deleteIndex: null,
    deleteType: null,
    editingIndex: null,
    editingText: "",
    showFeedback: false,
    feedbackText: "",
    activeSectionExpanded: true,
    completedSectionExpanded: true,
    extensionEnabled: true,
    showDisplaySettings: false,
    displaySettings: {
      textColor: "#000000",
      backgroundColor: "#ffffff",
      fontSize: "16px",
      fontFamily: "Arial, sans-serif",
    },
  });

  // Destructure for convenience and compute derived values
  const { type, items, completedItems, currentInput, theme, showNotification, deleteIndex, deleteType, editingIndex, editingText, showFeedback, feedbackText, activeSectionExpanded, completedSectionExpanded, extensionEnabled, showDisplaySettings, displaySettings } = state;
  const isDark = theme === "dark";
  const previewItem =
    type === "quote"
      ? items.quote.length > 0
        ? items.quote[0]
        : null
      : items.reminder.length > 0
      ? items.reminder[0]
      : null;

  // Initial load: retrieve stored values
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
          getFromStorage("displaySettings") || {
            textColor: "#000000",
            backgroundColor: "#ffffff",
            fontSize: "16px",
            fontFamily: "Arial, sans-serif",
          },
        ]);
      setState((s) => ({
        ...s,
        items: { quote: quotes, reminder: reminders },
        completedItems: { quote: compQuotes, reminder: compReminders },
        theme: storedTheme,
        extensionEnabled: extEnabled,
        displaySettings: storedDisplaySettings,
      }));
      document.documentElement.className = storedTheme === "system" ? "light" : storedTheme;
    })();
  }, []);

  // Update theme changes
  useEffect(() => {
    if (theme) {
      saveToStorage("theme", theme);
      document.documentElement.className = theme === "system" ? "light" : theme;
    }
  }, [theme]);

  // Helper: show notification message
  const notify = (message, type) => {
    setState((s) => ({ ...s, showNotification: { message, type } }));
    setTimeout(() => setState((s) => ({ ...s, showNotification: null })), 2000);
  };

  // Update currentInput (for the InputArea component)
  const updateCurrentInput = (newInput) => {
    setState((s) => ({ ...s, currentInput: newInput }));
  };

  // Change the current type (quote or reminder)
  const changeType = (newType) => {
    setState((s) => ({ ...s, type: newType }));
  };

  // Change the theme (passed to Header)
  const changeTheme = (newTheme) => {
    setState((s) => ({ ...s, theme: newTheme }));
  };

  // Save a new item
  const handleSave = async () => {
    const { text, author } = currentInput;
    if (!text.trim()) return;
    const newItem = { text, author, completed: false };
    const updated = [...items[type], newItem];
    await saveToStorage(type, updated);
    setState((s) => ({
      ...s,
      items: { ...s.items, [type]: updated },
      currentInput: { text: "", author: "" },
    }));
    notify(`${type} saved!`, "success");
  };

  // Mark an active item as completed
  const toggleCompleted = async (index) => {
    const item = items[type][index];
    const updatedItems = items[type].filter((_, i) => i !== index);
    const updatedCompleted = [...completedItems[type], item];
    await saveToStorage(type, updatedItems);
    await saveToStorage(`completed${type.charAt(0).toUpperCase() + type.slice(1)}s`, updatedCompleted);
    setState((s) => ({
      ...s,
      items: { ...s.items, [type]: updatedItems },
      completedItems: { ...s.completedItems, [type]: updatedCompleted },
    }));
    notify(`${type} marked as completed!`, "success");
  };

  // Restore a completed item back to active
  const reSaveCompleted = async (index) => {
    const item = completedItems[type][index];
    const updatedCompleted = completedItems[type].filter((_, i) => i !== index);
    const updatedItems = [...items[type], { ...item, completed: false }];
    await saveToStorage(type, updatedItems);
    await saveToStorage(`completed${type.charAt(0).toUpperCase() + type.slice(1)}s`, updatedCompleted);
    setState((s) => ({
      ...s,
      items: { ...s.items, [type]: updatedItems },
      completedItems: { ...s.completedItems, [type]: updatedCompleted },
    }));
    notify(`${type} re-saved!`, "success");
  };

  // Delete an item (active or completed)
  const deleteItem = async (index, delType) => {
    if (delType === "active") {
      const updatedItems = items[type].filter((_, i) => i !== index);
      await saveToStorage(type, updatedItems);
      setState((s) => ({
        ...s,
        items: { ...s.items, [type]: updatedItems },
        deleteIndex: null,
        deleteType: null,
      }));
    } else {
      const updatedCompleted = completedItems[type].filter((_, i) => i !== index);
      await saveToStorage(`completed${type.charAt(0).toUpperCase() + type.slice(1)}s`, updatedCompleted);
      setState((s) => ({
        ...s,
        completedItems: { ...s.completedItems, [type]: updatedCompleted },
        deleteIndex: null,
        deleteType: null,
      }));
    }
    notify(`${type} deleted!`, "error");
  };

  // Send feedback via mailto
  const sendFeedback = () => {
    const mailtoLink = `mailto:huntertest02@gmail.com?subject=AdFriend Feedback&body=${encodeURIComponent(feedbackText)}`;
    window.location.href = mailtoLink;
    setState((s) => ({ ...s, feedbackText: "", showFeedback: false }));
    notify("Feedback sent! Thank you!", "success");
  };

  // Modify an item (e.g. update its text)
  const modifyItem = async (action, index, newText) => {
    if (action === "edit") {
      const updatedItems = items[type].map((item, i) => (i === index ? { ...item, text: newText } : item));
      await saveToStorage(type, updatedItems);
      setState((s) => ({
        ...s,
        items: { ...s.items, [type]: updatedItems },
        editingIndex: null,
        editingText: "",
      }));
      notify(`${type} updated!`, "success");
    }
  };

  // Toggle extension on/off
  const toggleExtension = async () => {
    const newState = !extensionEnabled;
    await saveToStorage("extensionEnabled", newState);
    setState((s) => ({ ...s, extensionEnabled: newState }));
    notify(`Extension ${newState ? "enabled" : "disabled"}!`, "success");
  };

  // Update display setting values
  const updateDisplaySetting = (key, value) => {
    setState((s) => ({
      ...s,
      displaySettings: { ...s.displaySettings, [key]: value },
    }));
  };

  // Save display settings
  const saveDisplaySettings = async () => {
    await saveToStorage("displaySettings", displaySettings);
    notify("Display settings saved!", "success");
  };

  // Toggle sections
  const toggleActiveSection = () => {
    setState((s) => ({ ...s, activeSectionExpanded: !s.activeSectionExpanded }));
  };

  const toggleCompletedSection = () => {
    setState((s) => ({ ...s, completedSectionExpanded: !s.completedSectionExpanded }));
  };

  // Set editing mode for an item
  const startEditing = (index, text) => {
    setState((s) => ({ ...s, editingIndex: index, editingText: text }));
  };

  // Set delete confirmation (for active or completed)
  const openDeleteConfirmation = (index, delType) => {
    setState((s) => ({ ...s, deleteIndex: index, deleteType: delType }));
  };

  return (
    <div
      className={`min-w-[400px] flex flex-col p-4 transition-colors ${
        isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      {/* Header */}
      <Header theme={theme} extensionEnabled={extensionEnabled} toggleExtension={toggleExtension} changeTheme={changeTheme} />

      {/* Disabled view */}
      {!extensionEnabled ? (
        <DisabledView toggleExtension={toggleExtension} isDark={isDark} />
      ) : (
        <>
          {/* Tabs */}
          <Tabs type={type} setType={changeType} />

          {/* Input Area */}
          <InputArea
            type={type}
            currentInput={currentInput}
            setCurrentInput={updateCurrentInput}
            handleSave={handleSave}
            isDark={isDark}
          />

          {/* Active Items Section */}
          <ActiveItems
            activeSectionExpanded={activeSectionExpanded}
            toggleActiveSection={toggleActiveSection}
            items={items[type]}
            type={type}
            isDark={isDark}
            editingIndex={editingIndex}
            editingText={editingText}
            startEditing={startEditing}
            modifyItem={modifyItem}
            toggleCompleted={toggleCompleted}
            openDeleteConfirmation={(index) => openDeleteConfirmation(index, "active")}
          />

          {/* Completed Items Section */}
          <CompletedItems
            completedSectionExpanded={completedSectionExpanded}
            toggleCompletedSection={toggleCompletedSection}
            completedItems={completedItems[type]}
            type={type}
            isDark={isDark}
            reSaveCompleted={reSaveCompleted}
            openDeleteConfirmation={(index) => openDeleteConfirmation(index, "completed")}
          />

          {/* Display Settings Section */}
          <DisplaySettings
            showDisplaySettings={showDisplaySettings}
            toggleDisplaySettings={() => setState((s) => ({ ...s, showDisplaySettings: !s.showDisplaySettings }))}
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
        onClick={() => setState((s) => ({ ...s, showFeedback: true }))}
        className="fixed bottom-4 right-4 p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg transition-transform transform hover:scale-110"
      >
        {/* Using FiMail icon from react-icons */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 4H8m-4 4h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Feedback Popup */}
      {showFeedback && (
        <FeedbackPopup
          feedbackText={feedbackText}
          setFeedbackText={(txt) => setState((s) => ({ ...s, feedbackText: txt }))}
          closeFeedback={() => setState((s) => ({ ...s, showFeedback: false }))}
          sendFeedback={sendFeedback}
          isDark={isDark}
        />
      )}

      {/* Delete Confirmation */}
      {deleteIndex !== null && (
        <DeleteConfirmation
          type={type}
          deleteType={deleteType}
          onCancel={() => setState((s) => ({ ...s, deleteIndex: null, deleteType: null }))}
          onDelete={() => deleteItem(deleteIndex, deleteType)}
          isDark={isDark}
        />
      )}

      {/* Notification */}
      {showNotification && <Notification notification={showNotification} />}
    </div>
  );
};

export default Popup;
