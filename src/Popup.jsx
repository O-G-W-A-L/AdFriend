"use client"

import { useState, useEffect } from "react"
import { saveToStorage, getFromStorage } from "./utils/chromeStorage"
import {
  FiSun,
  FiMoon,
  FiMonitor,
  FiEdit2,
  FiCheck,
  FiTrash2,
  FiMessageSquare,
  FiBell,
  FiMail,
  FiChevronDown,
  FiChevronUp,
  FiToggleLeft,
  FiToggleRight,
  FiSettings,
} from "react-icons/fi"

const Popup = () => {
  const [state, setState] = useState({
    type: "quote",
    items: { quote: [], reminder: [] },
    completedItems: { quote: [], reminder: [] },
    currentInput: { text: "", author: "" },
    theme: "light",
    showNotification: null,
    deleteIndex: null,
    deleteType: null,
    editingIndex: null,
    editingText: "",
    showFeedback: false,
    feedbackText: "",
    activeSectionExpanded: true,
    completedSectionExpanded: true,
    extensionEnabled: true,
    showDisplaySettings: false,
    displaySettings: {
      textColor: "#000000",
      backgroundColor: "#ffffff",
      fontSize: "16px",
      fontFamily: "Arial, sans-serif",
    },
  })

  useEffect(() => {
    ;(async () => {
      const [quotes, reminders, compQuotes, compReminders, theme, extensionEnabled, displaySettings] =
        await Promise.all([
          getFromStorage("quote") || [],
          getFromStorage("reminder") || [],
          getFromStorage("completedQuotes") || [],
          getFromStorage("completedReminders") || [],
          getFromStorage("theme") || "light",
          getFromStorage("extensionEnabled") !== false,
          getFromStorage("displaySettings") || {
            textColor: "#000000",
            backgroundColor: "#ffffff",
            fontSize: "16px",
            fontFamily: "Arial, sans-serif",
          },
        ])
      setState((s) => ({
        ...s,
        items: { quote: quotes, reminder: reminders },
        completedItems: { quote: compQuotes, reminder: compReminders },
        theme,
        extensionEnabled,
        displaySettings,
      }))
      document.documentElement.className = theme === "system" ? "light" : theme
    })()
  }, [])

  useEffect(() => {
    if (state.theme) {
      saveToStorage("theme", state.theme)
      document.documentElement.className = state.theme === "system" ? "light" : state.theme
    }
  }, [state.theme])

  const notify = (message, type) => {
    setState((s) => ({ ...s, showNotification: { message, type } }))
    setTimeout(() => setState((s) => ({ ...s, showNotification: null })), 2000)
  }

  const handleSave = async () => {
    const { text, author } = state.currentInput
    if (!text.trim()) return
    const newItem = { text, author, completed: false }
    const updated = [...state.items[state.type], newItem]
    await saveToStorage(state.type, updated)
    setState((s) => ({
      ...s,
      items: { ...s.items, [state.type]: updated },
      currentInput: { text: "", author: "" },
    }))
    notify(`${state.type} saved!`, "success")
  }

  const toggleCompleted = async (index) => {
    const item = state.items[state.type][index]
    const updatedItems = state.items[state.type].filter((_, i) => i !== index)
    const updatedCompleted = [...state.completedItems[state.type], item]
    await saveToStorage(state.type, updatedItems)
    await saveToStorage(`completed${state.type.charAt(0).toUpperCase() + state.type.slice(1)}s`, updatedCompleted)
    setState((s) => ({
      ...s,
      items: { ...s.items, [state.type]: updatedItems },
      completedItems: { ...s.completedItems, [state.type]: updatedCompleted },
    }))
    notify(`${state.type} marked as completed!`, "success")
  }

  const reSaveCompleted = async (index) => {
    const item = state.completedItems[state.type][index]
    const updatedCompleted = state.completedItems[state.type].filter((_, i) => i !== index)
    const updatedItems = [...state.items[state.type], { ...item, completed: false }]
    await saveToStorage(state.type, updatedItems)
    await saveToStorage(`completed${state.type.charAt(0).toUpperCase() + state.type.slice(1)}s`, updatedCompleted)
    setState((s) => ({
      ...s,
      items: { ...s.items, [state.type]: updatedItems },
      completedItems: { ...s.completedItems, [state.type]: updatedCompleted },
    }))
    notify(`${state.type} re-saved!`, "success")
  }

  const deleteItem = async (index, delType) => {
    if (delType === "active") {
      const updatedItems = state.items[state.type].filter((_, i) => i !== index)
      await saveToStorage(state.type, updatedItems)
      setState((s) => ({
        ...s,
        items: { ...s.items, [state.type]: updatedItems },
        deleteIndex: null,
        deleteType: null,
      }))
    } else {
      const updatedCompleted = state.completedItems[state.type].filter((_, i) => i !== index)
      await saveToStorage(`completed${state.type.charAt(0).toUpperCase() + state.type.slice(1)}s`, updatedCompleted)
      setState((s) => ({
        ...s,
        completedItems: { ...s.completedItems, [state.type]: updatedCompleted },
        deleteIndex: null,
        deleteType: null,
      }))
    }
    notify(`${state.type} deleted!`, "error")
  }

  const sendFeedback = () => {
    const mailtoLink = `mailto:huntertest02@gmail.com?subject=AdFriend Feedback&body=${encodeURIComponent(state.feedbackText)}`
    window.location.href = mailtoLink
    setState((s) => ({ ...s, feedbackText: "", showFeedback: false }))
    notify("Feedback sent! Thank you!", "success")
  }

  const modifyItem = async (action, index, newText) => {
    if (action === "edit") {
      const updatedItems = state.items[state.type].map((item, i) => (i === index ? { ...item, text: newText } : item))
      await saveToStorage(state.type, updatedItems)
      setState((s) => ({
        ...s,
        items: { ...s.items, [state.type]: updatedItems },
        editingIndex: null,
        editingText: "",
      }))
      notify(`${state.type} updated!`, "success")
    }
  }

  const toggleExtension = async () => {
    const newState = !state.extensionEnabled
    await saveToStorage("extensionEnabled", newState)
    setState((s) => ({ ...s, extensionEnabled: newState }))
    notify(`Extension ${newState ? "enabled" : "disabled"}!`, "success")
  }

  const updateDisplaySetting = (key, value) => {
    setState((s) => ({
      ...s,
      displaySettings: { ...s.displaySettings, [key]: value },
    }))
  }

  const saveDisplaySettings = async () => {
    await saveToStorage("displaySettings", state.displaySettings)
    notify("Display settings saved!", "success")
  }

  const isDark = state.theme === "dark"

  // Determine the preview quote (if available) when type is "quote"
  const previewQuote =
    state.type === "quote" && state.items.quote.length > 0 ? state.items.quote[0] : null

  return (
    <div
      className={`min-w-[400px] flex flex-col p-4 transition-colors ${isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          AdFriend
        </h1>
        <div className="flex items-center gap-2">
          {/* Extension Toggle */}
          <button
            onClick={toggleExtension}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
              state.extensionEnabled
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {state.extensionEnabled ? (
              <FiToggleRight className="text-purple-500" size={18} />
            ) : (
              <FiToggleLeft size={18} />
            )}
            <span>{state.extensionEnabled ? "Enabled" : "Disabled"}</span>
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
                onClick={() => setState((s) => ({ ...s, theme: mode }))}
                className={`p-2 rounded-lg ${state.theme === mode ? "bg-purple-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {!state.extensionEnabled ? (
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
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            {["quote", "reminder"].map((tab) => (
              <button
                key={tab}
                onClick={() => setState((s) => ({ ...s, type: tab }))}
                className={`px-4 py-2 -mb-px font-medium ${
                  state.type === tab ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="space-y-3 mb-4">
            <input
              value={state.currentInput.text}
              onChange={(e) => setState((s) => ({ ...s, currentInput: { ...s.currentInput, text: e.target.value } }))}
              placeholder={`Add ${state.type}...`}
              className={`w-full p-3 rounded-lg ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border focus:ring-2 focus:ring-purple-500`}
            />
            {state.type === "quote" && (
              <input
                value={state.currentInput.author}
                onChange={(e) =>
                  setState((s) => ({ ...s, currentInput: { ...s.currentInput, author: e.target.value } }))
                }
                placeholder="Author"
                className={`w-full p-3 rounded-lg ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border focus:ring-2 focus:ring-purple-500`}
              />
            )}
            <button
              onClick={handleSave}
              className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors shadow-sm"
            >
              Save {state.type.charAt(0).toUpperCase() + state.type.slice(1)}
            </button>
          </div>

          {/* Active Items Section */}
          <div className="mb-4">
            <button
              onClick={() => setState((s) => ({ ...s, activeSectionExpanded: !s.activeSectionExpanded }))}
              className={`w-full flex justify-between items-center p-2 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
            >
              <h2 className="text-lg font-semibold">
                Active {state.type.charAt(0).toUpperCase() + state.type.slice(1)}s
              </h2>
              {state.activeSectionExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>
            {state.activeSectionExpanded && (
              <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
                {state.items[state.type]?.length > 0 ? (
                  state.items[state.type].map((item, i) => (
                    <div
                      key={i}
                      className={`group relative p-4 rounded-lg border ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                          {state.type === "quote" ? <FiMessageSquare size={18} /> : <FiBell size={18} />}
                        </div>
                        <div className="flex-1">
                          {state.editingIndex === i ? (
                            <input
                              value={state.editingText}
                              onChange={(e) => setState((s) => ({ ...s, editingText: e.target.value }))}
                              onBlur={() => modifyItem("edit", i, state.editingText)}
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
                          {state.type === "reminder" && (
                            <button
                              onClick={() => toggleCompleted(i)}
                              className={`p-1.5 rounded-md ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                            >
                              <FiCheck size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => setState((s) => ({ ...s, editingIndex: i, editingText: item.text }))}
                            className={`p-1.5 rounded-md ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => setState((s) => ({ ...s, deleteIndex: i, deleteType: "active" }))}
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
                    className={`p-4 text-center rounded-lg border ${
                      isDark ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-white border-gray-200 text-gray-500"
                    }`}
                  >
                    No active {state.type}s. Add one above!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Completed Items Section */}
          <div className="mb-4">
            <button
              onClick={() => setState((s) => ({ ...s, completedSectionExpanded: !s.completedSectionExpanded }))}
              className={`w-full flex justify-between items-center p-2 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
            >
              <h2 className="text-lg font-semibold">
                Completed {state.type.charAt(0).toUpperCase() + state.type.slice(1)}s
              </h2>
              {state.completedSectionExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>
            {state.completedSectionExpanded && (
              <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
                {state.completedItems[state.type]?.length > 0 ? (
                  state.completedItems[state.type].map((item, i) => (
                    <div
                      key={i}
                      className={`group relative p-4 rounded-lg border ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                          {state.type === "quote" ? <FiMessageSquare size={18} /> : <FiBell size={18} />}
                        </div>
                        <div className="flex-1">
                          <p>
                            {item.text}
                            {item.author && <span className="block mt-1 text-sm opacity-75">- {item.author}</span>}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => reSaveCompleted(i)}
                            className={`p-1.5 rounded-md ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                          >
                            <FiCheck size={16} />
                          </button>
                          <button
                            onClick={() => setState((s) => ({ ...s, deleteIndex: i, deleteType: "completed" }))}
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
                    className={`p-4 text-center rounded-lg border ${
                      isDark ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-white border-gray-200 text-gray-500"
                    }`}
                  >
                    No completed {state.type}s yet.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Display Settings Section */}
          <div className="mb-4">
            <button
              onClick={() => setState((s) => ({ ...s, showDisplaySettings: !s.showDisplaySettings }))}
              className={`w-full flex justify-between items-center p-2 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
            >
              <h2 className="text-lg font-semibold flex items-center">
                <FiSettings className="mr-2" size={18} />
                Display Settings
              </h2>
              {state.showDisplaySettings ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>

            {state.showDisplaySettings && (
              <div
                className={`mt-2 p-3 border rounded-lg ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Text Color</label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={state.displaySettings.textColor}
                        onChange={(e) => updateDisplaySetting("textColor", e.target.value)}
                        className="w-10 h-8 rounded cursor-pointer mr-2"
                      />
                      <input
                        type="text"
                        value={state.displaySettings.textColor}
                        onChange={(e) => updateDisplaySetting("textColor", e.target.value)}
                        className={`flex-1 p-2 text-sm rounded ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"} border`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Background Color</label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={state.displaySettings.backgroundColor}
                        onChange={(e) => updateDisplaySetting("backgroundColor", e.target.value)}
                        className="w-10 h-8 rounded cursor-pointer mr-2"
                      />
                      <input
                        type="text"
                        value={state.displaySettings.backgroundColor}
                        onChange={(e) => updateDisplaySetting("backgroundColor", e.target.value)}
                        className={`flex-1 p-2 text-sm rounded ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"} border`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Font Size</label>
                    <select
                      value={state.displaySettings.fontSize}
                      onChange={(e) => updateDisplaySetting("fontSize", e.target.value)}
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
                      value={state.displaySettings.fontFamily}
                      onChange={(e) => updateDisplaySetting("fontFamily", e.target.value)}
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
                    color: state.displaySettings.textColor,
                    backgroundColor: state.displaySettings.backgroundColor,
                    fontSize: state.displaySettings.fontSize,
                    fontFamily: state.displaySettings.fontFamily,
                  }}
                >
                  {state.type === "quote" ? (
                    <>
                      <p>{previewQuote ? previewQuote.text : "Preview quote text"}</p>
                      <p style={{ fontSize: "0.875em", opacity: 0.75, marginTop: "4px" }}>
                        - {previewQuote ? previewQuote.author : "Author"}
                      </p>
                    </>
                  ) : (
                    <p>{state.items.reminder.length > 0 ? state.items.reminder[0].text : "Preview reminder text"}</p>
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
        </>
      )}

      {/* Feedback Button */}
      <button
        onClick={() => setState((s) => ({ ...s, showFeedback: true }))}
        className="fixed bottom-4 right-4 p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg transition-transform transform hover:scale-110"
      >
        <FiMail size={20} />
      </button>

      {/* Feedback Popup */}
      {state.showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`p-6 rounded-xl max-w-sm w-full ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <h2 className="text-lg font-semibold mb-4">Talk to Us</h2>
            <textarea
              value={state.feedbackText}
              onChange={(e) => setState((s) => ({ ...s, feedbackText: e.target.value }))}
              placeholder="Your feedback..."
              className={`w-full p-3 rounded-lg ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"} border focus:ring-2 focus:ring-purple-500 mb-4`}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setState((s) => ({ ...s, showFeedback: false }))}
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

      {/* Delete Confirmation */}
      {state.deleteIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`p-6 rounded-xl max-w-sm w-full ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <p className="mb-4">Delete this {state.type} permanently?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setState((s) => ({ ...s, deleteIndex: null, deleteType: null }))}
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
        <div
          className={`fixed bottom-4 left-4 px-4 py-2 rounded-lg ${
            state.showNotification.type === "error" ? "bg-red-500" : "bg-green-500"
          } text-white`}
        >
          {state.showNotification.message}
        </div>
      )}
    </div>
  )
}

export default Popup
