"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreHorizontal } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useUser } from "@clerk/clerk-react";
import '.././styles.css';
import { useClerk } from "@clerk/clerk-react";
import { useTheme } from "../context/theme-context.tsx";

export default function MainScreen({ messages, setMessages, sidebarOpen }) {
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const [likedMessages, setLikedMessages] = useState({});
  const [dislikedMessages, setDislikedMessages] = useState({});
  const [copiedMessages, setCopiedMessages] = useState({});
  const { isLoaded, user } = useUser();
  const [dummyResponseCounter, setDummyResponseCounter] = useState(1);
  const { openSignIn } = useClerk();
  const { theme } = useTheme();

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
      { type: "assistant", text: `no hate speech detected ` },
    ]);

    setDummyResponseCounter((prev) => prev + 1);
    inputRef.current.value = "";
    // eslint-disable-next-line
  }, [dummyResponseCounter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputRef.current.value.trim();
    if (!text) return;
  
    if (!user || !user.id) {
      console.warn("User not logged in, proceeding as guest.");
      sendMessage(); // Allow the guest to chat, but don't store in DB
      return;
    }
  
    const userId = user.id; // Clerk user ID
  
    try {
      await fetch("http://localhost:8080/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, text }),
      });
  
      sendMessage(); // Send message after API call
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };
  
  return (
    <div className={`main-content ${sidebarOpen ? "" : "without-sidebar"} d-flex flex-column`}>
      {/* Display Username at the Top */}
      <div className="p-3 text-center">
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
                    <Copy size={16} color={copiedMessages[index] ? "var(--text-primary)" : "var(--icon-color)"} fill={copiedMessages[index] ? "var(--text-primary)" : "none"} />
                  </button>
                  <button className="btn btn-link" onClick={() => toggleLike(index)}>
                    <ThumbsUp size={16} color={likedMessages[index] ? "var(--text-primary)" : "var(--icon-color)"} fill={likedMessages[index] ? "var(--text-primary)" : "none"} />
                  </button>
                  <button className="btn btn-link" onClick={() => toggleDislike(index)}>
                    <ThumbsDown size={16} color={dislikedMessages[index] ? "var(--text-primary)" : "var(--icon-color)"} fill={dislikedMessages[index] ? "var(--text-primary)" : "none"} />
                  </button>
                  <button className="btn btn-link">
                    <RotateCcw size={16} color="var(--icon-color)"/>
                  </button>
                  <button className="btn btn-link">
                    <MoreHorizontal size={16} color="var(--icon-color)"/>
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
      <form onSubmit={handleSubmit} className="d-flex align-items-center">
        <div className={`input-area ${sidebarOpen ? "" : "full-width"}`}>
          <div className="input-container mb-3">
            <input ref={inputRef} type="text" name="text" placeholder="Type Here" className="form-control" />
            <button type="submit" className="btn btn-link">
              <Send size={16} color="var(--icon-color)" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}