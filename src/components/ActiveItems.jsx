import React from "react";
import { FiMessageSquare, FiBell, FiCheck, FiEdit2, FiTrash2, FiChevronUp, FiChevronDown } from "react-icons/fi";

const ActiveItems = ({
  activeSectionExpanded,
  toggleActiveSection,
  items,
  type,
  isDark,
  editingIndex,
  editingText,
  startEditing,
  modifyItem,
  toggleCompleted,
  openDeleteConfirmation,
}) => {
  return (
    <div className="mb-4">
      <button
        onClick={toggleActiveSection}
        className={`w-full flex justify-between items-center p-2 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
      >
        <h2 className="text-lg font-semibold">
          Active {type.charAt(0).toUpperCase() + type.slice(1)}s
        </h2>
        {activeSectionExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </button>
      {activeSectionExpanded && (
        <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
          {items?.length > 0 ? (
            items.map((item, i) => (
              <div
                key={i}
                className={`group relative p-4 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                    {type === "quote" ? <FiMessageSquare size={18} /> : <FiBell size={18} />}
                  </div>
                  <div className="flex-1">
                    {editingIndex === i ? (
                      <input
                        value={editingText}
                        onChange={(e) => modifyItem("edit", i, e.target.value)}
                        onBlur={() => modifyItem("edit", i, editingText)}
                        className={`w-full p-2 bg-transparent border-b ${isDark ? "border-gray-700" : "border-gray-300"} focus:outline-none`}
                        autoFocus
                      />
                    ) : (
                      <p>
                        {item.text}
                        {item.author && <span className="block mt-1 text-sm opacity-75">- {item.author}</span>}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {type === "reminder" && (
                      <button
                        onClick={() => toggleCompleted(i)}
                        className={`p-1.5 rounded-md ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                      >
                        <FiCheck size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => startEditing(i, item.text)}
                      className={`p-1.5 rounded-md ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteConfirmation(i)}
                      className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-md"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              className={`p-4 text-center rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-white border-gray-200 text-gray-500"}`}
            >
              No active {type}s. Add one above!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveItems;
