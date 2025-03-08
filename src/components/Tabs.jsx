import React from "react";

const Tabs = ({ type, setType }) => (
  <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
    {["quote", "reminder"].map((tab) => (
      <button
        key={tab}
        onClick={() => setType(tab)}
        className={`px-4 py-2 -mb-px font-medium ${
          type === tab ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </button>
    ))}
  </div>
);

export default Tabs;
