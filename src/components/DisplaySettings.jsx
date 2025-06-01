import React from "react";
import { FiSettings, FiChevronUp, FiChevronDown } from "react-icons/fi";

const DisplaySettings = ({
  showDisplaySettings,
  toggleDisplaySettings,
  displaySettings,
  updateDisplaySetting,
  saveDisplaySettings,
  isDark,
  type,
  previewItem,
  activeItems,
}) => {
  // Ensure displaySettings is defined and has the expected structure
  const currentSettings = displaySettings?.[type] || {
    textColor: "#000000",
    backgroundColor: "#ffffff",
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
  };

  return (
    <div className="mb-4">
      <button
        onClick={toggleDisplaySettings}
        className={`w-full flex justify-between items-center p-2 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
      >
        <h2 className="text-lg font-semibold flex items-center">
          <FiSettings className="mr-2" size={18} />
          Display Settings
        </h2>
        {showDisplaySettings ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </button>

      {showDisplaySettings && (
        <div className={`mt-2 p-3 border rounded-lg ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Text Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={currentSettings.textColor}
                  onChange={(e) => updateDisplaySetting(type, "textColor", e.target.value)}
                  className="w-10 h-8 rounded cursor-pointer mr-2"
                />
                <input
                  type="text"
                  value={currentSettings.textColor}
                  onChange={(e) => updateDisplaySetting(type, "textColor", e.target.value)}
                  className={`flex-1 p-2 text-sm rounded ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"} border`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Background Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={currentSettings.backgroundColor}
                  onChange={(e) => updateDisplaySetting(type, "backgroundColor", e.target.value)}
                  className="w-10 h-8 rounded cursor-pointer mr-2"
                />
                <input
                  type="text"
                  value={currentSettings.backgroundColor}
                  onChange={(e) => updateDisplaySetting(type, "backgroundColor", e.target.value)}
                  className={`flex-1 p-2 text-sm rounded ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"} border`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Font Size</label>
              <select
                value={currentSettings.fontSize}
                onChange={(e) => updateDisplaySetting(type, "fontSize", e.target.value)}
                className={`w-full p-2 rounded ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"} border`}
              >
                <option value="12px">Small</option>
                <option value="16px">Medium</option>
                <option value="20px">Large</option>
                <option value="24px">Extra Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Font Style</label>
              <select
                value={currentSettings.fontFamily}
                onChange={(e) => updateDisplaySetting(type, "fontFamily", e.target.value)}
                className={`w-full p-2 rounded ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"} border`}
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
              </select>
            </div>
          </div>

          {/* Preview */}
          <div
            className="my-3 p-3 border rounded"
            style={{
              color: currentSettings.textColor,
              backgroundColor: currentSettings.backgroundColor,
              fontSize: currentSettings.fontSize,
              fontFamily: currentSettings.fontFamily,
            }}
          >
            {type === "quote" ? (
              <>
                <p>{previewItem ? previewItem.text : "Preview quote text"}</p>
                <p style={{ fontSize: "0.875em", opacity: 0.75, marginTop: "4px" }}>
                  - {previewItem ? previewItem.author : "Author"}
                </p>
              </>
            ) : type === "reminder" && (
              <>
              <p>{previewItem ? previewItem.text : "Preview reminder text"}</p>
              </>
            )}
          </div>

          <button
            onClick={saveDisplaySettings}
            className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            Save Display Settings
          </button>
        </div>
      )}
    </div>
  );
};

const ReminderSettings = ({ settings, updateSetting, isDark }) => {
  return (
    <div className={`space-y-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="flex flex-col gap-2">
        <label>Text Color</label>
        <input
          type="color"
          value={settings.textColor}
          onChange={(e) => updateSetting('reminder', 'textColor', e.target.value)}
          className="w-full h-8 rounded cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label>Background Color</label>
        <input
          type="color"
          value={settings.backgroundColor}
          onChange={(e) => updateSetting('reminder', 'backgroundColor', e.target.value)}
          className="w-full h-8 rounded cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label>Font Size</label>
        <select
          value={settings.fontSize}
          onChange={(e) => updateSetting('reminder', 'fontSize', e.target.value)}
          className={`w-full p-2 rounded ${
            isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'
          }`}
        >
          <option value="12px">Small</option>
          <option value="14px">Medium</option>
          <option value="16px">Large</option>
          <option value="18px">Extra Large</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label>Font Family</label>
        <select
          value={settings.fontFamily}
          onChange={(e) => updateSetting('reminder', 'fontFamily', e.target.value)}
          className={`w-full p-2 rounded ${
            isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'
          }`}
        >
          <option value="Arial, sans-serif">Arial</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Roboto', sans-serif">Roboto</option>
          <option value="'Open Sans', sans-serif">Open Sans</option>
        </select>
      </div>
    </div>
  );
};

export default DisplaySettings;