"use client";
import { useRef, useEffect, useState } from "react";
import { Plus, ChevronsRight, ChevronsLeft, Sun, Moon } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useTheme } from "../context/theme-context.tsx";
import { useUser } from "@clerk/clerk-react";

export default function SidebarAndHeader({ sidebarOpen, setSidebarOpen, onNewChat, refreshChats, onChatSelect, currentChatId }) {
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const [userChats, setUserChats] = useState([]);

  // Fetch user's chat list
  useEffect(() => {
    const fetchUserChats = async () => {
      if (!user || !user.id) return;

      try {
        const response = await fetch(`http://localhost:8080/api/user-chats/${user.id}`);
        const data = await response.json();
        
        if (data.userChats && data.userChats.chats) {
          setUserChats(data.userChats.chats);
        }
      } catch (error) {
        console.error("Error fetching user chats:", error);
      }
    };

    fetchUserChats();
  }, [user, refreshChats]);

  const handleNewChat = () => {
    onNewChat();
  };

  const handleChatSelect = (chatId) => {
    onChatSelect(chatId);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "" : "closed"} d-none d-md-flex flex-column`}>
        <div className="d-flex justify-content-between align-items-center p-2">
          <button className="btn btn-link" onClick={handleNewChat}>
            <Plus size={20} color="var(--icon-color)" />
          </button>
          <div className="d-flex">
            <button 
              className="btn btn-link theme-toggle me-2" 
              onClick={toggleTheme} 
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? 
                <Sun size={20} color="var(--icon-color)" /> : 
                <Moon size={20} color="var(--icon-color)" />
              }
            </button>
            <button className="btn btn-link" onClick={() => setSidebarOpen(false)}>
              <ChevronsLeft size={20} color="var(--icon-color)" />
            </button>
          </div>
        </div>

        <div className="p-2 d-flex align-items-center justify-content-center w-100 app-title" style={{ fontSize: "24px" }}>
          <span>Hate Speech Detection</span>
        </div>

        <div className="conversation-list">
          <div className="px-3 py-2">
            <small className="conversation-date">Chats</small>
            {userChats.map((chat, index) => (
              <div 
                key={chat._id} 
                className={`conversation-item ${currentChatId === chat._id ? 'active' : ''}`}
                onClick={() => handleChatSelect(chat._id)}
                style={{ cursor: 'pointer' }}
              >
                {chat.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open Sidebar Button */}
      {!sidebarOpen && (
        <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)}>
          <ChevronsRight size={24} color="var(--icon-color)" />
        </button>
      )}
    </>
  );
}