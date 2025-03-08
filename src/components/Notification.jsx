import React from "react";

const Notification = ({ notification }) => {
  return (
    <div
      className={`fixed bottom-4 left-4 px-4 py-2 rounded-lg ${
        notification.type === "error" ? "bg-red-500" : "bg-green-500"
      } text-white`}
    >
      {notification.message}
    </div>
  );
};

export default Notification;

