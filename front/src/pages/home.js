"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreHorizontal, Plus, ChevronsRight, ChevronsLeft, User} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../context/auth";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";


export default function App() {
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // eslint-disable-next-line
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const chatEndRef = useRef(null);
  const dropdownRef = useRef(null);
  // eslint-disable-next-line
  const [auth,setAuth] = useAuth();
  const [likedMessages, setLikedMessages] = useState({});
  const [dislikedMessages, setDislikedMessages] = useState({});
  const [copiedMessages, setCopiedMessages] = useState({});
  const { isLoaded, user } = useUser();

  const toggleLike = (index) => {
    setLikedMessages((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle like
    }));
    setDislikedMessages((prev) => ({
      ...prev,
      [index]: false, // Remove dislike if liked
    }));
  };



  const toggleDislike = (index) => {
    setDislikedMessages((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle dislike
    }));
    setLikedMessages((prev) => ({
      ...prev,
      [index]: false, // Remove like if disliked
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
    }, 1000); // Reset copied state after 2 seconds
  };

  

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  // Handle sending messages
  const sendMessage = (text) => {
    if (!text.trim()) return;
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", text },
      { type: "assistant", text: "This is a dummy response from AI!" }
    ]);
  };



  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage(e.target.value);
      e.target.value = "";
    }
  };


  
  return (
    <div className={`app-container d-flex ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      
      {/* Profile Icon (Top Right) */}
      <div className="profile-container position-absolute top-0 end-0 m-3" ref={dropdownRef}>
        <header>
          {isLoaded ? ( // Only render buttons after Clerk is loaded
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button 
                    className=" rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "30px", height: "30px", padding: 0, border: "none", background: "#303030"}}
                  >
                    <User size={20} color="gray" />
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                  <UserButton />
              </SignedIn>
            </>
          ) : (
            <button 
              className=" rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "30px", height: "30px", padding: 0, border: "none", background: "#303030"}}
            >
              <User size={20} color="gray" />
            </button>
          )}
        </header>
      </div>





      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "" : "closed"} d-none d-md-flex flex-column`}>
        <div className="d-flex justify-content-between align-items-center p-2">
          <button className="btn btn-link">
            <Plus size={20} />
          </button>
          <button className="btn btn-link" onClick={() => setSidebarOpen(false)}>
            <ChevronsLeft size={20} />
          </button>
        </div>

        <div className="p-2 text-light d-flex align-items-center gap-2" style={{ fontSize: "18px" }}>
          <MessageCircle size={16} />
          <span>Hate Speech Detection</span>
        </div>

        <div className="conversation-list">
          <div className="px-3 py-2">
            <small className="text-muted">Today</small>
            <div className="conversation-item">Hello conversation</div>
            <div className="conversation-item">Login Form Validation</div>
            <div className="conversation-item">Login Form Enhancement</div>
          </div>
        </div>
      </div>

      {/* Open Sidebar Button */}
      {!sidebarOpen && (
        <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)}>
          <ChevronsRight size={24} />
        </button>
      )}

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? "" : "without-sidebar"} d-flex flex-column`}>
        
        {/* Display Username at the Top */}
        <div className="p-3 text-light text-center">
          {isLoaded && user && (
            <div className="p-3 text-light text-center">
              <h5>Welcome, {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}!</h5>
            </div>
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
                      <Copy 
                        size={16} 
                        color={copiedMessages[index] ? "#ffffff" : "gray"} 
                        fill={copiedMessages[index] ? "#ffffff" : "none"} 
                      />
                    </button>
                    <button  className="btn btn-link" onClick={() => toggleLike(index)}>
                      <ThumbsUp 
                        size={16} 
                        color={likedMessages[index] ? "#ffffff" : "gray"} 
                        fill={likedMessages[index] ? "#ffffff" : "none"} 
                      />
                    </button>

                    <button className="btn btn-link" onClick={() => toggleDislike(index)}>
                      <ThumbsDown 
                        size={16} 
                        color={dislikedMessages[index] ? "#ffffff" : "gray"} 
                        fill={dislikedMessages[index] ? "#ffffff" : "none"} 
                      />

                    </button>
                    <button className="btn btn-link">
                      <RotateCcw size={16} />
                    </button>

                    <button className="btn btn-link">
                      <MoreHorizontal size={16} />
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
          <div className="input-container">
            <input type="text" placeholder="Ask anything" className="form-control" onKeyDown={handleKeyPress} />
            <div className="input-buttons">
              <button className="btn btn-link">
                <Send size={16} />
              </button>
            </div>
          </div>
          <small className="text-muted text-center d-block mt-2">
            AI can make mistakes. Check important info.
          </small>
        </div>

        
      </div>
    </div>
  );
}
