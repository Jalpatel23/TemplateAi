"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Copy, ThumbsUp, ThumbsDown, User } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useUser } from "@clerk/clerk-react";
import '.././styles.css';
import { useClerk } from "@clerk/clerk-react";
import { useTheme } from "../context/theme-context.tsx";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/clerk-react";

export default function MainScreen({ messages, setMessages, sidebarOpen, currentChatId, setCurrentChatId, onMessageSent }) {
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const [likedMessages, setLikedMessages] = useState({});
  const [dislikedMessages, setDislikedMessages] = useState({});
  const [copiedMessages, setCopiedMessages] = useState({});
  const { isLoaded, user } = useUser();
  const [dummyResponseCounter, setDummyResponseCounter] = useState(1);
  const { openSignIn } = useClerk();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [inputPlaceholder, setInputPlaceholder] = useState("Type Here");
  const [guestMessageCount, setGuestMessageCount] = useState(() => {
    // Initialize from localStorage or default to 0
    const savedCount = localStorage.getItem('guestMessageCount');
    return savedCount ? parseInt(savedCount) : 0;
  });
  const MAX_GUEST_MESSAGES = 5;

  // Add useEffect to save guestMessageCount to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('guestMessageCount', guestMessageCount.toString());
  }, [guestMessageCount]);

  // Add useEffect to fetch chat history when currentChatId changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user || !user.id || !currentChatId) {
        setMessages([]); // Clear messages if no chat is selected
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/chats/${user.id}/${currentChatId}`);
        const data = await response.json();
        
        if (data.chat && data.chat.history) {
          const formattedMessages = data.chat.history.map(msg => ({
            type: msg.role === "user" ? "user" : "assistant",
            text: msg.parts[0].text
          }));
          setMessages(formattedMessages);
          
          // Set the dummy response counter based on the number of model messages
          const modelMessages = data.chat.history.filter(msg => msg.role === "model").length;
          setDummyResponseCounter(modelMessages + 1);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchChatHistory();
  }, [user, setMessages, currentChatId]);

  // Update input placeholder based on loading state
  useEffect(() => {
    setInputPlaceholder(isLoading ? "AI is thinking..." : "Type Here");
  }, [isLoading]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputRef.current.value.trim();
    if (!text) return;

    // Check if user is not logged in and has reached the message limit
    if (!user && guestMessageCount >= MAX_GUEST_MESSAGES) {
      openSignIn();
      return;
    }

    try {
      setIsLoading(true); // Start loading
      
      // Add user message to UI with animation
      setMessages(prev => [...prev, { 
        type: "user", 
        text,
        animation: "fade-in"
      }]);

      // Add loading message with typing animation
      setMessages(prev => [...prev, { 
        type: "assistant", 
        text: "",
        isLoading: true,
        animation: "fade-in"
      }]);

      // Call Gemini API
      const geminiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp:generateContent?key=AIzaSyDXwdeGwUS01AjUXnec3jijXmBPjIsknf8", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: text
            }]
          }]
        })
      });

      const geminiData = await geminiResponse.json();
      const modelResponse = geminiData.candidates[0].content.parts[0].text;

      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));

      // Only save to database if user is logged in
      if (user && user.id) {
        // Save user message
        const response = await fetch("http://localhost:8080/api/chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            userId: user.id, 
            text,
            chatId: currentChatId
          }),
        });

        const data = await response.json();
        
        // Set the current chat ID if this is a new chat
        if (!currentChatId && data.chat._id) {
          setCurrentChatId(data.chat._id);
        }

        // Save model response to database
        await fetch("http://localhost:8080/api/chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            userId: user.id, 
            text: modelResponse,
            role: "model",
            chatId: currentChatId || data.chat._id
          }),
        });

        // Trigger sidebar refresh
        onMessageSent();
      } else {
        // Increment guest message count for non-logged-in users
        setGuestMessageCount(prev => prev + 1);
      }

      // Add model response to UI as assistant type with animation
      setMessages(prev => [...prev, { 
        type: "assistant", 
        text: modelResponse,
        animation: "fade-in"
      }]);

      // Show limit message after API response if this was the last allowed message
      if (!user && guestMessageCount + 1 >= MAX_GUEST_MESSAGES) {
        setMessages(prev => [...prev, { 
          type: "assistant", 
          text: "You've reached the limit of 5 messages. Please sign in to continue chatting.",
          animation: "fade-in"
        }]);
      }
      
      inputRef.current.value = "";
    } catch (error) {
      console.error("Error in chat:", error);
      // Remove loading message if it exists
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      // Show error message to user with animation
      setMessages(prev => [...prev, { 
        type: "assistant", 
        text: "I apologize, but I encountered an error processing your request. Please try again.",
        animation: "fade-in"
      }]);
    } finally {
      setIsLoading(false); // End loading regardless of success or failure
    }
  };

  // Add message count display for non-logged-in users
  const renderMessageCount = () => {
    if (!user && guestMessageCount < MAX_GUEST_MESSAGES) {
      return (
        <div className="text-center text-muted mb-2">
          Messages remaining: {MAX_GUEST_MESSAGES - guestMessageCount}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`main-content ${sidebarOpen ? "" : "without-sidebar"} d-flex flex-column`}>
      {/* Profile Icon (Top Right) */}
      <div className="profile-container position-absolute top-0 end-0 m-3">
        <header>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "30px", height: "30px", padding: 0, border: "none", background: "var(--profile-btn-bg)" }}>
                <User size={20} color="var(--icon-color)" />
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
      </div>

      {/* Display Username at the Top */}
      <div className="p-3 text-center">
        {isLoaded && user && (
          <h5>
            Welcome, <strong>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}</strong>!
          </h5>
        )}
        {!user && renderMessageCount()}
      </div>

      {/* Chat Area */}
      <div className="chat-area flex-grow-1">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.type} ${message.animation || ''}`} 
            style={{ alignSelf: message.type === "user" ? "flex-end" : "flex-start" }}
          >
            <div className="message-content">
              <p>
                {message.isLoading ? (
                  <span className="d-flex align-items-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Thinking...</span>
                    </div>
                    <span className="typing-animation"></span>
                  </span>
                ) : (
                  message.text
                )}
              </p>

              {message.type === "assistant" && !message.isLoading && (
                <div className="message-actions">
                  <button 
                    className="btn btn-link" 
                    onClick={() => handleCopy(index, message.text)}
                    title="Copy message"
                  >
                    <Copy size={16} color={copiedMessages[index] ? "var(--text-primary)" : "var(--icon-color)"} fill={copiedMessages[index] ? "var(--text-primary)" : "none"} />
                  </button>
                  <button 
                    className="btn btn-link" 
                    onClick={() => toggleLike(index)}
                    title="Like message"
                  >
                    <ThumbsUp size={16} color={likedMessages[index] ? "var(--text-primary)" : "var(--icon-color)"} fill={likedMessages[index] ? "var(--text-primary)" : "none"} />
                  </button>
                  <button 
                    className="btn btn-link" 
                    onClick={() => toggleDislike(index)}
                    title="Dislike message"
                  >
                    <ThumbsDown size={16} color={dislikedMessages[index] ? "var(--text-primary)" : "var(--icon-color)"} fill={dislikedMessages[index] ? "var(--text-primary)" : "none"} />
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
            <input 
              ref={inputRef} 
              type="text" 
              name="text" 
              placeholder={inputPlaceholder}
              className="form-control" 
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="btn btn-link"
              disabled={isLoading}
              title={isLoading ? "Please wait..." : "Send message"}
            >
              <Send size={16} color={isLoading ? "var(--text-muted)" : "var(--icon-color)"} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}