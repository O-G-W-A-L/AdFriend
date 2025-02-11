"use client"

import { useState, useEffect } from "react"
import { saveToStorage, getFromStorage } from "./utils/chromeStorage"
import { FiSun, FiMoon, FiMonitor, FiEdit2, FiX, FiCheck } from "react-icons/fi"

const Popup = () => {
  const [state, setState] = useState({
    type: "quote",
    items: {},
    currentInput: "",
    theme: "light",
    showSaveNotification: false,
    showDeleteConfirmation: false,
    deleteIndex: null,
    showFeedback: false,
    feedbackText: "",
    editingIndex: null,
    showFeedbackSentNotification: false,
  })

  useEffect(() => {
    ;(async () => {
      const items = Object.fromEntries(
        await Promise.all(
          ["quote", "reminder", "todo"].map(async (k) => [k, JSON.parse((await getFromStorage(k)) || "[]")]),
        ),
      )
      const theme = (await getFromStorage("theme")) || "light"
      setState((s) => ({ ...s, items, theme }))
      document.body.className = theme
    })()
  }, [])

  const updateState = (updates) => setState((s) => ({ ...s, ...updates }))
  const handleSave = async () => {
    if (!state.currentInput.trim()) return
    const updatedList = [
      ...state.items[state.type],
      state.type === "todo" ? { text: state.currentInput, time: "" } : state.currentInput,
    ]
    await saveToStorage(state.type, JSON.stringify(updatedList))
    updateState({ items: { ...state.items, [state.type]: updatedList }, currentInput: "", showSaveNotification: true })
    setTimeout(() => updateState({ showSaveNotification: false }), 2000)
  }
  const handleEdit = (index, value, field = null) => {
    const updatedList = [...state.items[state.type]]
    if (state.type === "todo") updatedList[index] = { ...updatedList[index], [field]: value }
    else updatedList[index] = value
    saveToStorage(state.type, JSON.stringify(updatedList))
    updateState({ items: { ...state.items, [state.type]: updatedList } })
  }
  const confirmDelete = () => {
    const updatedList = state.items[state.type].filter((_, i) => i !== state.deleteIndex)
    saveToStorage(state.type, JSON.stringify(updatedList))
    updateState({ items: { ...state.items, [state.type]: updatedList }, showDeleteConfirmation: false })
  }
  const submitFeedback = () => {
    console.log("Feedback submitted to huntertest02@gmail.com:", state.feedbackText)
    updateState({ feedbackText: "", showFeedback: false, showFeedbackSentNotification: true })
    setTimeout(() => updateState({ showFeedbackSentNotification: false }), 2000)
  }

  return (
    <div
      className={`max-w-md mx-auto p-5 rounded-xl shadow-lg space-y-4 text-base ${state.theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
    >
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-indigo-600">AdFriend</h1>
        <p className="text-sm text-gray-500">Your personal ad management assistant, get more productive</p>
      </div>

      <div className="flex space-x-2 absolute top-0 right-1">
        {[
          ["light", FiSun],
          ["dark", FiMoon],
          ["system", FiMonitor],
        ].map(([t, Icon]) => (
          <button
            key={t}
            onClick={() => updateState({ theme: t })}
            className={`p-1 rounded ${state.theme === t ? "bg-indigo-600 text-white" : ""}`}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      <div className="flex justify-center space-x-4">
        {["quote", "reminder", "todo"].map((tab) => (
          <button
            key={tab}
            onClick={() => updateState({ type: tab })}
            className={`px-4 py-2 rounded-full text-sm ${state.type === tab ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-indigo-100"}`}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex space-x-2 mt-4">
        <input
          type="text"
          value={state.currentInput}
          onChange={(e) => updateState({ currentInput: e.target.value })}
          placeholder={`Add a new ${state.type}`}
          className={`flex-grow p-3 border rounded-full text-sm ${state.theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-800"}`}
        />
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700"
        >
          Save
        </button>
      </div>

      {state.showSaveNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded">Saved successfully!</div>
      )}

      {state.showFeedbackSentNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded">Feedback sent successfully!</div>
      )}

      <div className={`p-4 rounded-lg shadow-inner ${state.theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
        <ul className="space-y-2">
          {state.items[state.type]?.map((item, i) => (
            <li key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
              {state.editingIndex === i ? (
                <>
                  <input
                    type="text"
                    value={state.type === "todo" ? item.text : item}
                    onChange={(e) => handleEdit(i, e.target.value, state.type === "todo" ? "text" : null)}
                    className={`flex-grow p-1 border rounded ${state.theme === "dark" ? "bg-gray-600 text-white" : "bg-white text-gray-800"}`}
                  />
                  {state.type === "todo" && (
                    <input
                      type="time"
                      value={item.time}
                      onChange={(e) => handleEdit(i, e.target.value, "time")}
                      className={`ml-2 p-1 border rounded ${state.theme === "dark" ? "bg-gray-600 text-white" : "bg-white text-gray-800"}`}
                    />
                  )}
                  <button onClick={() => updateState({ editingIndex: null })} className="ml-2">
                    <FiCheck size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span>{state.type === "todo" ? `${item.text} ${item.time}` : item}</span>
                  <div>
                    <button
                      onClick={() => updateState({ editingIndex: i })}
                      className="mr-2 p-1 hover:bg-gray-200 rounded"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => updateState({ showDeleteConfirmation: true, deleteIndex: i })}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        {(!state.items[state.type] || state.items[state.type].length === 0) && (
          <p className={`text-center ${state.theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
            No content saved yet.
          </p>
        )}
      </div>

      <button
        onClick={() => updateState({ showFeedback: true })}
        className="w-full py-3 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600"
      >
        Give Feedback
      </button>

      {state.showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div
            className={`p-4 rounded-lg ${state.theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
          >
            <p>Are you sure you want to delete this item?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => updateState({ showDeleteConfirmation: false })}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 text-white rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {state.showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div
            className={`p-4 rounded-lg ${state.theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
          >
            <textarea
              value={state.feedbackText}
              onChange={(e) => updateState({ feedbackText: e.target.value })}
              placeholder="Enter your feedback here"
              className={`w-full p-2 border rounded ${state.theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-800"}`}
              rows="4"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => updateState({ showFeedback: false })} className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
              <button onClick={submitFeedback} className="px-4 py-2 bg-green-500 text-white rounded">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Popup

