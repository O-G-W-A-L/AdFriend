import React from "react";

const InputArea = ({ type, currentInput, setCurrentInput, handleSave, isDark }) => (
  <div className="space-y-3 mb-4">
    <input
      value={currentInput.text}
      onChange={(e) => setCurrentInput({ ...currentInput, text: e.target.value })}
      placeholder={`Add ${type}...`}
      className={`w-full p-3 rounded-lg ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border focus:ring-2 focus:ring-purple-500`}
    />
    {type === "quote" && (
      <input
        value={currentInput.author}
        onChange={(e) => setCurrentInput({ ...currentInput, author: e.target.value })}
        placeholder="Author"
        className={`w-full p-3 rounded-lg ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border focus:ring-2 focus:ring-purple-500`}
      />
    )}
    <button
      onClick={handleSave}
      className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors shadow-sm"
    >
      Save {type.charAt(0).toUpperCase() + type.slice(1)}
    </button>
  </div>
);

export default InputArea;

