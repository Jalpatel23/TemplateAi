import { useState, useRef } from "react";
import { Send, RotateCcw, Menu, MessageSquarePlus } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../images/logo.png";
import "../styles.css";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    if (input.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: input, sender: "user" },
      ]);
      setInput("");
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const startResizing = () => {
    setIsResizing(true);
    document.body.classList.add("no-select"); // Prevent text selection
  };

  const stopResizing = () => {
    setIsResizing(false);
    document.body.classList.remove("no-select"); // Allow text selection again
  };

  const resizeSidebar = (e) => {
    if (isResizing) {
      setSidebarWidth(Math.max(225, e.clientX));
    }
  };

  return (
    <div
      className="d-flex vh-100 bg-light"
      onMouseMove={resizeSidebar}
      onMouseUp={stopResizing}
    >
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
              <button className="btn sidebar-button py-2 mb-2 text-start">
                Rephrase text...
              </button>
              <button className="btn sidebar-button py-2 mb-2 text-start">
                Fix this code...
              </button>
              <button className="btn sidebar-button py-2 text-start">
                Sample Copy for...
              </button>
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
      <div
        className="d-flex flex-column bg-white flex-grow-1"
        style={{ paddingBottom: "20px" }}
      >
        <div className="p-3 border-bottom text-dark fw-semibold d-flex justify-content-between align-items-center">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Profile Picture */}
          <img
            src={logo}
            alt="A person icon"
            className="rounded-circle shadow"
            style={{ width: "40px", height: "40px" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://static.vecteezy.com/system/resources/thumbnails/048/334/475/small_2x/a-person-icon-on-a-transparent-background-png.png";
            }}
          />
        </div>

        {/* Chat messages */}
        <div className="flex-grow-1 p-3 overflow-auto d-flex flex-column">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`d-flex ${
                msg.sender === "user" ? "justify-content-end" : "justify-content-start"
              } mb-2`}
            >
              <div className="bg-light p-2 rounded max-w-50">
                {msg.text}
                {msg.sender === "bot" && <RotateCcw className="ms-2 h-4 w-4" />}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Textbox Input Field - Added Margin on Top Instead */}
        <div className="p-3 border-top d-flex flex-column align-items-end" style={{ marginTop: "10px" }}>
          <div className="d-flex w-100 p-2 bg-white rounded justify-content-center">
            <div className="d-flex" style={{ width: "60%" }}>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Send a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                style={{
                  outline: "none",
                  height: "50px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              />
              <button
                className="btn btn-primary ms-2 d-flex align-items-center justify-content-center"
                onClick={sendMessage}
                style={{ height: "50px", minWidth: "50px" }}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
