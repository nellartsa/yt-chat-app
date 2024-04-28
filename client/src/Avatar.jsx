import React from "react";

export default function Avatar({ online, username, userId }) {
  const colors = [
    "bg-red-200",
    "bg-green-200",
    "bg-purple-200",
    "bg-blue-200",
    "bg-yellow-200",
    "bg-teal-200",
  ];

  const color = colors[parseInt(userId, 16) % colors.length];

  return (
    <div
      className={
        "relative w-8 h-8 bg-red-200 rounded-full flex items-center " + color
      }
    >
      <div className="text-center w-full opacity-70">{username[0]}</div>
      {online && (
        <div className="absolute w-2 h-2 bg-green-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
      {!online && (
        <div className="absolute w-2 h-2 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
    </div>
  );
}
