"use client";

import { useState } from "react";
import { saveToStorage } from "./utils/chromeStorage";

const Popup = () => {
  const [state, setState] = useState({ content: "", type: "quote", saved: false });

  const handleChange = (e) =>
    setState({ ...state, [e.target.name]: e.target.value });

  const saveContent = async () => {
    try {
      console.log(`Saving content type: ${state.type}, content: ${state.content}`);
      // Save the custom content under the key corresponding to the type.
      await saveToStorage(state.type, state.content);
      // Optionally, also save the selected type.
      await saveToStorage("contentType", state.type);
      setState({ ...state, saved: true });
      setTimeout(() => setState((s) => ({ ...s, saved: false })), 2000);
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white rounded-lg shadow-2xl">
      <h1 className="text-3xl font-bold mb-6">Personalize Your Ad Space</h1>
      <select
        name="type"
        value={state.type}
        onChange={handleChange}
        className="w-full p-2 mb-4 bg-white bg-opacity-20 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
      >
        <option value="quote">Inspirational Quote</option>
        <option value="reminder">Activity Prompt</option>
        <option value="todo">Task List</option>
      </select>
      <textarea
        name="content"
        value={state.content}
        onChange={handleChange}
        placeholder="Your custom content here..."
        className="w-full h-32 p-2 mb-4 bg-white bg-opacity-20 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-white"
      />
      <button
        onClick={saveContent}
        className="w-full py-2 bg-white text-purple-600 rounded-md hover:bg-opacity-90 transition-colors duration-300"
      >
        Save it, never forget
      </button>
      {state.saved && <p className="mt-4 text-lg font-semibold"> saved!</p>}
    </div>
  );
};

export default Popup;
