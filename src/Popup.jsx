import React, { useState, useEffect } from "react";
import { saveToStorage, getFromStorage } from "./utils/chromeStorage";

const Popup = () => {
  const [type, setType] = useState("quote");
  const [items, setItems] = useState({ quote: [], reminder: [], todo: [] });
  const [currentInput, setCurrentInput] = useState("");
  const [currentList, setCurrentList] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const q = JSON.parse(await getFromStorage("quote") || "[]");
      const r = JSON.parse(await getFromStorage("reminder") || "[]");
      const t = JSON.parse(await getFromStorage("todo") || "[]");
      setItems({ quote: q, reminder: r, todo: t });
      setCurrentList(type === "todo" ? t : (type === "quote" ? q : r));
    };
    fetchItems();
  }, [type]);

  const handleSave = async () => {
    if (!currentInput.trim()) return;
    const updatedList = [...currentList, type === "todo" ? { text: currentInput, time: "" } : currentInput];
    const updatedItems = { ...items, [type]: updatedList };

    setItems(updatedItems);
    setCurrentList(updatedList);
    setCurrentInput("");

    await saveToStorage(type, JSON.stringify(updatedList));
    chrome.runtime.sendMessage({ type: "CONTENT_UPDATE" });
  };

  const handleEdit = (index, value, field = null) => {
    const updatedList = [...currentList];
    if (type === "todo") updatedList[index] = { ...updatedList[index], [field]: value };
    else updatedList[index] = value;

    setCurrentList(updatedList);
    setItems({ ...items, [type]: updatedList });
    saveToStorage(type, JSON.stringify(updatedList));
  };

  const handleDelete = (index) => {
    const updatedList = currentList.filter((_, i) => i !== index);
    setCurrentList(updatedList);
    setItems({ ...items, [type]: updatedList });
    saveToStorage(type, JSON.stringify(updatedList));
  };

  return (
    <div className="max-w-md mx-auto p-5 bg-white rounded-xl shadow-lg space-y-4">
      <h1 className="text-2xl font-bold text-center text-indigo-600">MindBoost Dashboard</h1>
      
      <div className="flex justify-center space-x-4">
        {["quote", "reminder", "todo"].map((tab) => (
          <button key={tab} onClick={() => setType(tab)} 
            className={`px-4 py-2 rounded-full ${type === tab ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-indigo-400 hover:text-white"}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={currentInput}
        onChange={(e) => setCurrentInput(e.target.value)}
        placeholder={`Add a new ${type}`}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-300"
      />
      <button onClick={handleSave} className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        Save {type.charAt(0).toUpperCase() + type.slice(1)}
      </button>

      <div className="p-4 mt-2 bg-gray-100 rounded shadow-inner">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Live Preview</h3>
        {currentList.length > 0 ? (
          <ul className="list-disc pl-5 text-gray-800">
            {currentList.map((item, i) => (
              <li key={i} className="flex items-center space-x-2">
                {type === "todo" ? (
                  <>
                    <input type="text" value={item.text} onChange={(e) => handleEdit(i, e.target.value, "text")} className="flex-1 p-1 border rounded"/>
                    <input type="time" value={item.time} onChange={(e) => handleEdit(i, e.target.value, "time")} className="p-1 border rounded"/>
                  </>
                ) : (
                  <input type="text" value={item} onChange={(e) => handleEdit(i, e.target.value)} className="flex-1 p-1 border rounded"/>
                )}
                <button onClick={() => handleDelete(i)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">✖</button>
              </li>
            ))}
          </ul>
        ) : <p className="text-gray-500">No content saved yet.</p>}
      </div>
    </div>
  );
};

export default Popup;
