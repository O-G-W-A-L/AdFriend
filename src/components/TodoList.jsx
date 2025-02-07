import { useState, useEffect } from "react";
import { getFromStorage } from "../utils/chromeStorage";

const TodoList = ({ width, height }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getFromStorage("todo").then((content) => {
      try {
        const parsed = content ? JSON.parse(content) : [];
        setTasks(parsed);
      } catch (e) {
        setTasks([]);
      }
    });
  }, []);

  return (
    <div style={{ width, height, padding: "10px", overflowY: "auto" }}>
      {tasks.length > 0 ? (
        <ul>
          {tasks.map((task, index) => (
            <li key={index}>{task}</li>
          ))}
        </ul>
      ) : (
        <p>No tasks available. Add tasks in your settings!</p>
      )}
    </div>
  );
};

export default TodoList;
