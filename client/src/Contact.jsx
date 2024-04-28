import React from "react";
import Avatar from "./Avatar";

export default function Contact({ id, username, selected, online, onClick }) {
  return (
    <div
      key={id}
      onClick={() => onClick(id)}
      className={
        "border-b border-gray-100 flex gap-2 cursor-pointer" +
        (selected ? "bg-blue-50" : "")
      }
    >
      {selected && <div className="w-1 h-12 bg-blue-500 rounded-r-md"></div>}
      <div className="flex gap-2 py-2 pl-4 items-center">
        <Avatar online={online} username={username} userId={id} />
        <span className="text-gray-800">{username}</span>
      </div>
    </div>
  );
}
