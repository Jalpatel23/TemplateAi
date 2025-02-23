import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, Menu, MessageSquarePlus, Settings, LogOut, Star, SlidersHorizontal } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../images/logo.png";
import "../styles.css";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const sidebarRef = useRef(null);
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  const sendMessage = () => {
    if (input.trim()) {
      setMessages((prevMessages) => [...prevMessages, { text: input, sender: "user" }]);
      setInput("");
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const startResizing = () => {
    setIsResizing(true);
    document.body.classList.add("no-select");
  };

  const stopResizing = () => {
    setIsResizing(false);
    document.body.classList.remove("no-select");
  };

  const resizeSidebar = (e) => {
    if (isResizing) {
      setSidebarWidth(Math.max(225, e.clientX));
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target) && event.target !== profileButtonRef.current) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="d-flex vh-100 bg-light" onMouseMove={resizeSidebar} onMouseUp={stopResizing}>
      {/* Sidebar */}
      {isSidebarOpen && (
        <div
          ref={sidebarRef}
          className="bg-black text-white p-4 d-flex flex-column justify-content-between position-relative"
          style={{ width: sidebarWidth }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="h5">AI Chat</h2>
            <button className="new-chat-btn" onClick={() => setMessages([])}>
              <MessageSquarePlus size={20} />
            </button>
          </div>

          <div className="flex-grow-1 mt-3">
            <p className="text-secondary">Recent Chats</p>
            <div className="d-flex flex-column">
              <button className="btn sidebar-button py-2 mb-2 text-start">Rephrase text...</button>
              <button className="btn sidebar-button py-2 mb-2 text-start">Fix this code...</button>
              <button className="btn sidebar-button py-2 text-start">Sample Copy for...</button>
            </div>
          </div>

          <p className="text-secondary">
            Welcome back, <span className="fw-bold text-white">Jal Patel</span>
          </p>

          <div
            className="resizer bg-secondary"
            style={{
              width: "5px",
              cursor: "ew-resize",
              height: "100%",
              position: "absolute",
              right: 0,
              top: 0,
            }}
            onMouseDown={startResizing}
          />
        </div>
      )}

      {/* Chat area */}
      <div className="d-flex flex-column bg-white flex-grow-1" style={{ paddingBottom: "20px" }}>
        <div className="p-3 border-bottom text-dark fw-semibold d-flex justify-content-between align-items-center">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-5 w-5" />
          </button>

          {/* Profile Picture & Dropdown */}
          <div className="position-relative" ref={dropdownRef}>
          <img
              ref={profileButtonRef}
              src={logo}
              alt="Profile"
              className="rounded-circle shadow"
              style={{ width: "40px", height: "40px", cursor: "pointer" }}
              onClick={toggleDropdown}
              onError={(e) => {
                const fallback = "https://static.vecteezy.com/system/resources/thumbnails/048/334/475/small_2x/a-person-icon-on-a-transparent-background-png.png";
                if (e.target.src !== fallback) {
                  e.target.src = fallback;
                }
              }}
            />

            {isDropdownOpen && (
              <div
                className="dropdown-menu show position-absolute mt-2 p-2 shadow text-white"
                style={{
                  backgroundColor: "#000", // Ensures the background is black
                  borderRadius: "12px", // Rounds the corners
                  width: "220px",
                  left: "auto",
                  right: "0",
                  top: "100%",
                }}
              >
                <button className="align-items-center btn sidebar-button py-2 mb-2 text-start">
                  <SlidersHorizontal size={15} className="me-2" /> Customize ChatGPT
                </button>
                <button className="btn sidebar-button py-2 mb-2 text-start align-items-center">
                  <Settings size={15} className="me-2" /> Settings
                </button>
                <button className="btn sidebar-button py-2 mb-2 text-start align-items-center">
                  <Star size={15} className="me-2" /> Upgrade Plan
                </button>
                <button className="btn sidebar-button py-2 mb-2 text-start">
                  <LogOut size={15} className="me-2" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-grow-1 p-3 overflow-auto d-flex flex-column">
          {messages.map((msg, index) => (
            <div key={index} className={`d-flex ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"} mb-2`}>
              <div className="bg-light p-2 rounded max-w-50">
                {msg.text}
                {msg.sender === "bot" && <RotateCcw className="ms-2 h-4 w-4" />}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input field */}
        <div className="p-3 border-top d-flex flex-column align-items-end">
          <div className="d-flex w-100 p-2 bg-white rounded">
            <input
              type="text"
              className="form-control border-0"
              placeholder="Send a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button className="btn btn-primary ms-2" onClick={sendMessage}>
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
