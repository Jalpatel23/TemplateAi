"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreHorizontal, Plus, ChevronsRight, ChevronsLeft, User, LogOut, Settings, LogIn } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";


export default function App() {
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const chatEndRef = useRef(null);
  const dropdownRef = useRef(null);
  const [auth,setAuth] = useAuth();
  const navigate = useNavigate();




  const handleLogout=()=>{
    setAuth({
      ...auth,
      user: null,
      token: "",
    })
    localStorage.removeItem("auth");
  }
  

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
        <User
          size={30}
          className="text-white cursor-pointer"
          onClick={() => setDropdownOpen(!isDropdownOpen)}
        />

        {isDropdownOpen && (
          <div
            className="dropdown-menu show position-absolute mt-2 p-2 shadow"
            style={{
              backgroundColor: "#000",
              borderRadius: "12px",
              width: "180px",
              left: "0",
              transform: "translateX(-100%)",
              top: "100%",
              zIndex: 1000,
            }}
          >
            <button className="btn sidebar-button py-2 mb-2 text-start text-white">
              <User size={15} className="me-2" /> Profile
            </button>
            <button className="btn sidebar-button py-2 mb-2 text-start text-white">
              <Settings size={15} className="me-2" /> Settings
            </button>

            {
              !auth.user ?(
                <button className="btn sidebar-button py-2 text-start text-white" onClick={() => navigate('/login')}>
                  <LogIn size={15} className="me-2"/> Log in
                </button>
              ):(
                <button className="btn sidebar-button py-2 text-start text-white" onClick={handleLogout}>
                  <LogOut size={15} className="me-2" /> Log out
                </button>
              )
            }

          </div>
        )}
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
        
        {/* Chat Area */}
        <div className="chat-area flex-grow-1">
          <pre>{JSON.stringify(auth,null,4)} </pre>   {/*efvlenfljwhglejwr/ljglbhe */}

          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`} style={{ alignSelf: message.type === "user" ? "flex-end" : "flex-start" }}>
              <div className="message-content">
                <p>{message.text}</p>
                
                {message.type === "assistant" && (
                  <div className="message-actions">
                    <button className="btn btn-link">
                      <Copy size={16} />
                    </button>
                    <button className="btn btn-link">
                      <ThumbsUp size={16} />
                    </button>
                    <button className="btn btn-link">
                      <ThumbsDown size={16} />
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
                <MessageCircle size={16} />
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
