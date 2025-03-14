"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreHorizontal } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useUser } from "@clerk/clerk-react";
import '.././styles.css'

export default function MainScreen({ messages, setMessages, sidebarOpen }) {
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const [likedMessages, setLikedMessages] = useState({});
  const [dislikedMessages, setDislikedMessages] = useState({});
  const [copiedMessages, setCopiedMessages] = useState({});
  const { isLoaded, user } = useUser();
  const [dummyResponseCounter, setDummyResponseCounter] = useState(1);  // Counter starts at 1

  const toggleLike = (index) => {
    setLikedMessages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
    setDislikedMessages((prev) => ({
      ...prev,
      [index]: false,
    }));
  };

  const toggleDislike = (index) => {
    setDislikedMessages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
    setLikedMessages((prev) => ({
      ...prev,
      [index]: false,
    }));
  };

  const handleCopy = (index, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMessages((prev) => ({
      ...prev,
      [index]: true,
    }));
    setTimeout(() => {
      setCopiedMessages((prev) => ({
        ...prev,
        [index]: false,
      }));
    }, 1000);
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!inputRef.current || !inputRef.current.value.trim()) return;

    const text = inputRef.current.value;

    setMessages((prev) => [
      ...prev,
      { type: "user", text },
      { type: "assistant", text: `Dummy response ${dummyResponseCounter}` },
    ]);

    setDummyResponseCounter((prev) => prev + 1); // Increase response number for next message

    inputRef.current.value = "";
  }, [dummyResponseCounter]);

  return (
    <div className={`main-content ${sidebarOpen ? "" : "without-sidebar"} d-flex flex-column`}>
      {/* Display Username at the Top */}
      <div className="p-3 text-light text-center">
        {isLoaded && user && (
          <h5>
            Welcome, <strong>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}</strong>!
          </h5>
        )}
      </div>

      {/* Chat Area */}
      <div className="chat-area flex-grow-1">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`} style={{ alignSelf: message.type === "user" ? "flex-end" : "flex-start" }}>
            <div className="message-content">
              <p>{message.text}</p>

              {message.type === "assistant" && (
                <div className="message-actions">
                  <button className="btn btn-link" onClick={() => handleCopy(index, message.text)}>
                    <Copy size={16} color={copiedMessages[index] ? "#ffffff" : "gray"} fill={copiedMessages[index] ? "#ffffff" : "none"} />
                  </button>
                  <button className="btn btn-link" onClick={() => toggleLike(index)}>
                    <ThumbsUp size={16} color={likedMessages[index] ? "#ffffff" : "gray"} fill={likedMessages[index] ? "#ffffff" : "none"} />
                  </button>
                  <button className="btn btn-link" onClick={() => toggleDislike(index)}>
                    <ThumbsDown size={16} color={dislikedMessages[index] ? "#ffffff" : "gray"} fill={dislikedMessages[index] ? "#ffffff" : "none"} />
                  </button>
                  <button className="btn btn-link">
                    <RotateCcw size={16} color="grey"/>
                  </button>
                  <button className="btn btn-link">
                    <MoreHorizontal size={16} color="grey"/>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Auto-scroll anchor */}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Area */}
      <div className={`input-area ${sidebarOpen ? "" : "full-width"}`}>
        <div className="input-container mb-3">
          <input ref={inputRef} type="text" placeholder="Type Here" className="form-control" onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
          <button className="btn btn-link" onClick={sendMessage}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
