import React from "react";

const FeedbackPopup = ({ feedbackText, setFeedbackText, closeFeedback, sendFeedback, isDark }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`p-6 rounded-xl max-w-sm w-full ${isDark ? "bg-gray-800" : "bg-white"}`}>
        <h2 className="text-lg font-semibold mb-4">Talk to Us</h2>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Your feedback..."
          className={`w-full p-3 rounded-lg ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"} border focus:ring-2 focus:ring-purple-500 mb-4`}
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={closeFeedback}
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
  );
};

export default FeedbackPopup;
