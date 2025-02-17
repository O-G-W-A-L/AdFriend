"use client";

import { useState, useEffect } from "react";
import { saveToStorage, getFromStorage } from "./utils/chromeStorage";
import { FiSun, FiMoon, FiMonitor, FiEdit2, FiCheck, FiTrash2, FiMessageSquare, FiBell, FiMail, FiChevronDown, FiChevronUp } from "react-icons/fi";

const Popup = () => {
  const [state, setState] = useState({
    type: "quote",
    items: { quote: [], reminder: [] }, // Active items
    completedItems: { quote: [], reminder: [] }, // Completed items
    currentInput: { text: "", author: "" },
    theme: "light",
    showNotification: null,
    deleteIndex: null,
    deleteType: null, // Track whether deleting from active or completed
    editingIndex: null,
    showFeedback: false,
    feedbackText: "",
    activeSectionExpanded: true,
    completedSectionExpanded: true,
  });

  // Load data from storage on mount
  useEffect(() => {
    (async () => {
      const [quotes, reminders, completedQuotes, completedReminders, theme] = await Promise.all([
        getFromStorage("quote") || [],
        getFromStorage("reminder") || [],
        getFromStorage("completedQuotes") || [], // Load completed quotes
        getFromStorage("completedReminders") || [], // Load completed reminders
        getFromStorage("theme") || "light",
      ]);
      setState(s => ({ 
        ...s, 
        items: { quote: quotes, reminder: reminders }, 
        completedItems: { quote: completedQuotes, reminder: completedReminders }, 
        theme 
      }));
      document.documentElement.className = theme === "system" ? "light" : theme;
    })();
  }, []);

  // Show notifications
  const notify = (message, type) => {
    setState(s => ({ ...s, showNotification: { message, type }}));
    setTimeout(() => setState(s => ({ ...s, showNotification: null })), 2000);
  };

  // Save new item
  const handleSave = async () => {
    const { text, author } = state.currentInput;
    if (!text.trim()) return;
    
    const newItem = { text, author, completed: false };
    const updated = [...state.items[state.type], newItem];
    await saveToStorage(state.type, updated);
    setState(s => ({ ...s, items: { ...s.items, [state.type]: updated }, currentInput: { text: "", author: "" }}));
    notify(`${state.type} saved!`, 'success');
  };

  // Move item to completed
  const toggleCompleted = async (index) => {
    const item = state.items[state.type][index];
    const updatedItems = state.items[state.type].filter((_, i) => i !== index);
    const updatedCompleted = [...state.completedItems[state.type], item];

    // Update storage
    await saveToStorage(state.type, updatedItems); // Remove from active
    await saveToStorage(`completed${state.type.charAt(0).toUpperCase() + state.type.slice(1)}s`, updatedCompleted); // Add to completed

    setState(s => ({ 
      ...s, 
      items: { ...s.items, [state.type]: updatedItems }, 
      completedItems: { ...s.completedItems, [state.type]: updatedCompleted } 
    }));
    notify(`${state.type} marked as completed!`, 'success');
  };

  // Re-save completed item to active
  const reSaveCompleted = async (index) => {
    const item = state.completedItems[state.type][index];
    const updatedCompleted = state.completedItems[state.type].filter((_, i) => i !== index);
    const updatedItems = [...state.items[state.type], { ...item, completed: false }];

    // Update storage
    await saveToStorage(state.type, updatedItems); // Add to active
    await saveToStorage(`completed${state.type.charAt(0).toUpperCase() + state.type.slice(1)}s`, updatedCompleted); // Remove from completed

    setState(s => ({ 
      ...s, 
      items: { ...s.items, [state.type]: updatedItems }, 
      completedItems: { ...s.completedItems, [state.type]: updatedCompleted } 
    }));
    notify(`${state.type} re-saved!`, 'success');
  };

  // Delete item (active or completed)
  const deleteItem = async (index, type) => {
    if (type === "active") {
      const updatedItems = state.items[state.type].filter((_, i) => i !== index);
      await saveToStorage(state.type, updatedItems);
      setState(s => ({ ...s, items: { ...s.items, [state.type]: updatedItems }, deleteIndex: null, deleteType: null }));
    } else if (type === "completed") {
      const updatedCompleted = state.completedItems[state.type].filter((_, i) => i !== index);
      await saveToStorage(`completed${state.type.charAt(0).toUpperCase() + state.type.slice(1)}s`, updatedCompleted);
      setState(s => ({ ...s, completedItems: { ...s.completedItems, [state.type]: updatedCompleted }, deleteIndex: null, deleteType: null }));
    }
    notify(`${state.type} deleted!`, 'error');
  };

  // Send feedback
  const sendFeedback = () => {
    const mailtoLink = `mailto:huntertest02@gmail.com?subject=AdFriend Feedback&body=${encodeURIComponent(state.feedbackText)}`;
    window.location.href = mailtoLink;
    setState(s => ({ ...s, feedbackText: "", showFeedback: false }));
    notify("Feedback sent! Thank you!", 'success');
  };

  return (
    <div className={`min-w-[400px] h-[700px] flex flex-col p-4 transition-colors ${state.theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          AdFriend
        </h1>
        <div className="flex gap-2">
          {[FiSun, FiMoon, FiMonitor].map((Icon, i) => (
            <button
              key={i}
              onClick={() => setState(s => ({ ...s, theme: ['light', 'dark', 'system'][i]}))}
              className={`p-2 rounded-lg ${state.theme === ['light', 'dark', 'system'][i] ? 'bg-purple-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        {['quote', 'reminder'].map(tab => (
          <button
            key={tab}
            onClick={() => setState(s => ({ ...s, type: tab }))}
            className={`px-4 py-2 -mb-px font-medium ${state.type === tab ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="space-y-3 mb-4">
        <input
          value={state.currentInput.text}
          onChange={e => setState(s => ({ ...s, currentInput: { ...s.currentInput, text: e.target.value }}))}
          placeholder={`Add ${state.type}...`}
          className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500"
        />
        {state.type === 'quote' && (
          <input
            value={state.currentInput.author}
            onChange={e => setState(s => ({ ...s, currentInput: { ...s.currentInput, author: e.target.value }}))}
            placeholder="Author"
            className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500"
          />
        )}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          Save {state.type.charAt(0).toUpperCase() + state.type.slice(1)}
        </button>
      </div>

      {/* Active Items Section */}
      <div className="mb-4">
        <button
          onClick={() => setState(s => ({ ...s, activeSectionExpanded: !s.activeSectionExpanded }))}
          className="w-full flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
        >
          <h2 className="text-lg font-semibold">Active {state.type.charAt(0).toUpperCase() + state.type.slice(1)}s</h2>
          {state.activeSectionExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </button>
        {state.activeSectionExpanded && (
          <div className="mt-2 space-y-2">
            {state.items[state.type]?.map((item, i) => (
              <div key={i} className={`group relative p-4 rounded-lg border ${
                state.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-2 rounded-full ${state.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {state.type === 'quote' ? <FiMessageSquare size={18} /> : <FiBell size={18} />}
                  </div>
                  <div className="flex-1">
                    {state.editingIndex === i ? (
                      <input
                        value={state.editingText}
                        onChange={e => setState(s => ({ ...s, editingText: e.target.value }))}
                        onBlur={() => modifyItem('edit', i, state.editingText)}
                        className="w-full p-2 bg-transparent border-b focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <p>
                        {item.text}
                        {item.author && <span className="block mt-1 text-sm opacity-75">- {item.author}</span>}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {state.type === 'reminder' && (
                      <button
                        onClick={() => toggleCompleted(i)}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
                      >
                        <FiCheck size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => setState(s => ({ ...s, editingIndex: i, editingText: item.text }))}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => setState(s => ({ ...s, deleteIndex: i, deleteType: 'active' }))}
                      className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-md"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Items Section */}
      <div>
        <button
          onClick={() => setState(s => ({ ...s, completedSectionExpanded: !s.completedSectionExpanded }))}
          className="w-full flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
        >
          <h2 className="text-lg font-semibold">Completed {state.type.charAt(0).toUpperCase() + state.type.slice(1)}s</h2>
          {state.completedSectionExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </button>
        {state.completedSectionExpanded && (
          <div className="mt-2 space-y-2">
            {state.completedItems[state.type]?.map((item, i) => (
              <div key={i} className={`group relative p-4 rounded-lg border ${
                state.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-2 rounded-full ${state.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {state.type === 'quote' ? <FiMessageSquare size={18} /> : <FiBell size={18} />}
                  </div>
                  <div className="flex-1">
                    <p>
                      {item.text}
                      {item.author && <span className="block mt-1 text-sm opacity-75">- {item.author}</span>}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => reSaveCompleted(i)}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
                    >
                      <FiCheck size={16} />
                    </button>
                    <button
                      onClick={() => setState(s => ({ ...s, deleteIndex: i, deleteType: 'completed' }))}
                      className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-md"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Popup */}
      {state.showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className={`p-6 rounded-xl max-w-sm w-full ${state.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-lg font-semibold mb-4">Talk to Us</h2>
            <textarea
              value={state.feedbackText}
              onChange={e => setState(s => ({ ...s, feedbackText: e.target.value }))}
              placeholder="Your feedback..."
              className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setState(s => ({ ...s, showFeedback: false }))}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={sendFeedback}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Button */}
      <button
        onClick={() => setState(s => ({ ...s, showFeedback: true }))}
        className="fixed bottom-4 right-4 p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg transition-transform transform hover:scale-110"
      >
        <FiMail size={20} />
      </button>

      {/* Delete Confirmation */}
      {state.deleteIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className={`p-6 rounded-xl max-w-sm w-full ${state.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <p className="mb-4">Delete this {state.type} permanently?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setState(s => ({ ...s, deleteIndex: null, deleteType: null }))}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteItem(state.deleteIndex, state.deleteType)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {state.showNotification && (
        <div className={`fixed bottom-4 left-4 px-4 py-2 rounded-lg ${
          state.showNotification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white animate-slideIn`}>
          {state.showNotification.message}
        </div>
      )}
    </div>
  );
};

export default Popup;