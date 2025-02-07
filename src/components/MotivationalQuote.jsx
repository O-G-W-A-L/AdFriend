import { useState, useEffect } from "react";
import { getFromStorage } from "../utils/chromeStorage";

const MotivationalQuote = ({ width, height }) => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    getFromStorage("quote").then((content) => {
      setQuote(content || "Stay positive and keep pushing forward!");
    });
  }, []);

  return (
    <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p>{quote}</p>
    </div>
  );
};

export default MotivationalQuote;
