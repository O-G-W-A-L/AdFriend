import { useEffect, useState } from "react";
import MotivationalQuote from "./MotivationalQuote";
import ActivityReminder from "./ActivityReminder";

const AdReplacerComponent = ({ width, height }) => {
  const [contentType, setContentType] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load settings from storage
    chrome.storage.local.get(['settings'], ({ settings }) => {
      const type = settings?.contentType || 'random';
      setContentType(type === 'random' 
        ? Math.random() > 0.5 ? 'quote' : 'reminder'
        : type
      );
      setIsVisible(true);
    });

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
      </div>
    </div>
  );
};

export default AdReplacerComponent;