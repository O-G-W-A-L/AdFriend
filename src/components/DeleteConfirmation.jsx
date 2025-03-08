import React from "react";

const DeleteConfirmation = ({ type, deleteType, onCancel, onDelete, isDark }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`p-6 rounded-xl max-w-sm w-full ${isDark ? "bg-gray-800" : "bg-white"}`}>
        <p className="mb-4">Delete this {type} permanently?</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;

