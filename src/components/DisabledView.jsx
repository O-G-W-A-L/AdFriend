import React from "react";
import { FiToggleLeft } from "react-icons/fi";

const DisabledView = ({ toggleExtension, isDark }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <div className="text-center p-6 rounded-lg bg-gray-100 dark:bg-gray-800 max-w-sm">
      <FiToggleLeft size={48} className="mx-auto mb-4 text-gray-400" />
      <p className="text-xl font-bold mb-4">AdFriend is disabled</p>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Enable AdFriend to manage your quotes and reminders
      </p>
      <button
        onClick={toggleExtension}
        className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors shadow-md"
      >
        Enable AdFriend
      </button>
    </div>
  </div>
);

export default DisabledView;
