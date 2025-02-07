import { useEffect, useState } from "react";
import MotivationalQuote from "./MotivationalQuote";
import ActivityReminder from "./ActivityReminder";
import TodoList from "./TodoList"; // Ensure you have a TodoList component

const AdReplacer = ({ width, height }) => {
  const [contentType, setContentType] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Randomly pick content type: quote, reminder, or to-do list
    const contentOptions = ['quote', 'reminder', 'todo']; // Add 'todo' for ToDoList component
    const randomContentType = contentOptions[Math.floor(Math.random() * contentOptions.length)];

    // Set the content type to the randomly chosen one
    setContentType(randomContentType);

    setIsVisible(true);

    // Cleanup
    return () => setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="adfriend-content-container" 
         style={{ width: `${width}px`, height: `${height}px` }}>
      <div className="adfriend-inner-content">
        {contentType === 'quote' && <MotivationalQuote />}
        {contentType === 'reminder' && <ActivityReminder />}
        {contentType === 'todo' && <TodoList />} {/* Render to-do list if 'todo' is chosen */}
      </div>
    </div>
  );
};

export default AdReplacer;
