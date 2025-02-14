"use client";

import { useState, useEffect } from "react";
import { saveToStorage, getFromStorage } from "./utils/chromeStorage";
import { FiSun, FiMoon, FiMonitor, FiEdit2, FiX, FiCheck, FiTrash2 } from "react-icons/fi";

const Popup = () => {
  const [state, setState] = useState({
    type: "quote",
    items: { quote: [], reminder: [] },
    currentInput: { text: "", author: "" },
    theme: "light",
    showNotification: { type: "", message: "" },
    showDeleteConfirmation: false,
    deleteIndex: null,
    showFeedback: false,
    feedbackText: "",
    editingIndex: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const quoteData = await getFromStorage("quote");
        const reminderData = await getFromStorage("reminder");

        const items = {
          quote: Array.isArray(quoteData) ? quoteData : [],
          reminder: Array.isArray(reminderData) ? reminderData : [],
        };

        const theme = (await getFromStorage("theme")) || "light";
        setState((s) => ({ ...s, items, theme }));
        document.body.className = theme;
      } catch (error) {
        console.error("Error fetching from storage:", error);
      }
    })();
  }, []);

  const updateState = (updates) => setState((s) => ({ ...s, ...updates }));

  const showNotification = (type, message) => {
    updateState({ showNotification: { type, message } });
    setTimeout(() => updateState({ showNotification: { type: "", message: "" } }), 2000);
  };

  const handleSave = async () => {
    if (!state.currentInput.text.trim()) return;

    const updatedList = [
      ...(Array.isArray(state.items[state.type]) ? state.items[state.type] : []),
      { text: state.currentInput.text, author: state.currentInput.author },
    ];

    await saveToStorage(state.type, updatedList);

    updateState({ items: { ...state.items, [state.type]: updatedList }, currentInput: { text: "", author: "" } });
    showNotification("success", "Saved successfully!");
  };

  const handleEdit = (index, value) => {
    const updatedList = [...state.items[state.type]];
    updatedList[index].text = value;
    saveToStorage(state.type, updatedList);
    updateState({ items: { ...state.items, [state.type]: updatedList } });
  };

  const confirmDelete = async () => {
    if (state.deleteIndex === null) return;
    const updatedList = state.items[state.type].filter((_, i) => i !== state.deleteIndex);
    await saveToStorage(state.type, updatedList);
    updateState({ items: { ...state.items, [state.type]: updatedList }, showDeleteConfirmation: false, deleteIndex: null });
    showNotification("error", "Deleted successfully!");
  };

  const submitFeedback = async () => {
    if (!state.feedbackText.trim()) return;
    const email = "huntertest05@gmail.com";
    const mailtoLink = `mailto:${email}?subject=AdFriend Feedback&body=${encodeURIComponent(state.feedbackText)}`;
    window.location.href = mailtoLink;
    updateState({ feedbackText: "", showFeedback: false });
    showNotification("success", "Feedback sent! Thank you!");
  };

  return (
    <div className={`max-w-md mx-auto p-5 rounded-xl shadow-lg space-y-4 text-base ${state.theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
      <h1 className="text-3xl font-bold text-indigo-600 text-center">AdFriend</h1>

      <div className="flex space-x-2 absolute top-0 right-1">
        {[
          ["light", FiSun],
          ["dark", FiMoon],
          ["system", FiMonitor],
        ].map(([t, Icon]) => (
          <button key={t} onClick={() => updateState({ theme: t })} className={`p-1 rounded ${state.theme === t ? "bg-indigo-600 text-white" : ""}`}>
            <Icon size={16} />
          </button>
        ))}
      </div>

      <div className="flex justify-center space-x-4">
        {["quote", "reminder"].map((tab) => (
          <button key={tab} onClick={() => updateState({ type: tab })} className={`px-4 py-2 rounded-full text-sm ${state.type === tab ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-indigo-100"}`}>
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={state.currentInput.text}
          onChange={(e) => updateState({ currentInput: { ...state.currentInput, text: e.target.value } })}
          placeholder={`Add a new ${state.type}`}
          className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
        />
        {state.type === "quote" && (
          <input
            type="text"
            value={state.currentInput.author}
            onChange={(e) => updateState({ currentInput: { ...state.currentInput, author: e.target.value } })}
            placeholder="Author (optional)"
            className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
          />
        )}
        <button onClick={handleSave} className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
      </div>

      {state.showNotification.message && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg ${state.showNotification.type === "error" ? "bg-red-500" : "bg-green-500"} text-white`}>
          {state.showNotification.message}
        </div>
      )}

      <ul className="space-y-2">
        {state.items[state.type]?.map((item, i) => (
          <li key={i} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <span>{item.text}</span>
            <div>
              <button onClick={() => updateState({ editingIndex: i })} className="mr-2 text-indigo-500"><FiEdit2 size={18} /></button>
              <button onClick={() => updateState({ showDeleteConfirmation: true, deleteIndex: i })} className="text-red-500"><FiTrash2 size={18} /></button>
            </div>
            {state.showDeleteConfirmation && state.deleteIndex === i && (
              <div className="absolute bg-white dark:bg-gray-800 p-3 shadow-lg rounded-lg">
                <p>Are you sure?</p>
                <button onClick={confirmDelete} className="bg-red-500 text-white px-3 py-1 rounded-lg">Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <button onClick={() => updateState({ showFeedback: true })} className="w-full py-2 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400">Provide Feedback</button>
    </div>
  );
};

export default Popup;
