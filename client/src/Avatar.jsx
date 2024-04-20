import React from "react";

export default function Avatar({ username, userId }) {
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
      className={"w-8 h-8 bg-red-200 rounded-full flex items-center " + color}
    >
      <div className="text-center w-full opacity-70">{username[0]}</div>
    </div>
  );
}
