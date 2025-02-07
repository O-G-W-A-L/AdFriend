import { useState, useEffect } from "react";
import { getFromStorage } from "../utils/chromeStorage";

const ActivityReminder = ({ width, height }) => {
  const [reminder, setReminder] = useState("");

  useEffect(() => {
    getFromStorage("reminder").then((content) => {
      setReminder(content || "Remember to take a break!");
    });
  }, []);

  return (
    <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p>{reminder}</p>
    </div>
  );
};

export default ActivityReminder;
