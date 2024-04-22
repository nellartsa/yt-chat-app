import React, { useContext, useEffect, useRef, useState } from "react";
import { uniqBy } from "lodash";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const { id } = useContext(UserContext);
  const divUnderMessages = useRef();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");
    setWs(ws);

    ws.addEventListener("message", handleMessage);
  }, []);

  function showOnlinePeople(peopleArray) {
    const people = {};

    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });

    setOnlinePeople(people);
  }

  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  }

  function sendMessage(ev) {
    ev.preventDefault();
    console.log(newMessageText);
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      })
    );
    setMessages((prev) => [
      ...prev,
      {
        sender: id,
        recipient: selectedUserId,
        text: newMessageText,
        id: Date.now(),
      },
    ]);
    setNewMessageText("");
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3">
        <Logo />
        {Object.keys(onlinePeople)
          .filter((userId) => userId !== id)
          .map((userId) => (
            <div
              key={userId}
              onClick={() => setSelectedUserId(userId)}
              className={
                "border-b border-gray-100 flex gap-2 cursor-pointer" +
                (userId === selectedUserId ? "bg-blue-50" : "")
              }
            >
              {userId === selectedUserId && (
                <div className="w-1 h-12 bg-blue-500 rounded-r-md"></div>
              )}
              <div className="flex gap-2 py-2 pl-4 items-center">
                <Avatar username={onlinePeople[userId]} userId={userId} />
                <span className="text-gray-800">{onlinePeople[userId]}</span>
              </div>
            </div>
          ))}
      </div>
      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex items-center justicy-center h-full">
              <div className="text-gray-300">&larr; Select a person</div>
            </div>
          )}

          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                {uniqBy(messages, "id").map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.sender === id ? "text-right" : "text-left"
                    }
                  >
                    <div
                      className={
                        "text-left inline-block p-2 my-2 rounded-md text-sm " +
                        (message.sender === id
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-500")
                      }
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>

        {!!selectedUserId && (
          <form className="flex gap-2" onSubmit={sendMessage}>
            <input
              type="text"
              value={newMessageText}
              onChange={(ev) => setNewMessageText(ev.target.value)}
              placeholder="Type your message here"
              className="bg-white flex-grow border p-2 rounded-sm"
            />
            <button
              type="submit"
              className="bg-blue-500 p-2 text-white rounded-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
