import React from "react";
import { FiSun, FiMoon, FiMonitor, FiToggleRight, FiToggleLeft } from "react-icons/fi";

const Header = ({ theme, extensionEnabled, toggleExtension, changeTheme }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        AdFriend
      </h1>
      <div className="flex items-center gap-2">
        {/* Extension Toggle */}
        <button
          onClick={toggleExtension}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
            extensionEnabled
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {extensionEnabled ? (
            <FiToggleRight className="text-purple-500" size={18} />
          ) : (
            <FiToggleLeft size={18} />
          )}
          <span>{extensionEnabled ? "Enabled" : "Disabled"}</span>
        </button>

        {/* Theme Toggles */}
        <div className="flex gap-1">
          {[
            { mode: "light", icon: FiSun },
            { mode: "dark", icon: FiMoon },
            { mode: "system", icon: FiMonitor },
          ].map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => changeTheme(mode)}
              className={`p-2 rounded-lg ${theme === mode ? "bg-purple-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Header;
