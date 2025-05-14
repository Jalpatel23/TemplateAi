"use client";
import { useRef, useEffect, useState } from "react";
import { Plus, ChevronsRight, ChevronsLeft, Sun, Moon, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useTheme } from "../context/theme-context.tsx";
import { useUser } from "@clerk/clerk-react";

export default function SidebarAndHeader({ sidebarOpen, setSidebarOpen, onNewChat, refreshChats, onChatSelect, currentChatId }) {
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const [userChats, setUserChats] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

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

  const handleDropdownClick = (e, chatId) => {
    e.stopPropagation();
    if (activeDropdown !== chatId) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left
      });
    }
    setActiveDropdown(activeDropdown === chatId ? null : chatId);
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      // Remove the chat from userchats collection (this will also delete from chat collection)
      const response = await fetch(`http://localhost:8080/api/user-chats/${user.id}/remove-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete chat');
      }

      // Update the UI
      setUserChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
      
      // If the deleted chat was selected, clear the selection
      if (currentChatId === chatId) {
        onChatSelect(null);
      }

      // Close the dropdown
      setActiveDropdown(null);

      // Trigger a refresh of the chat list
      onNewChat(); // This will trigger a refresh of the chat list
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert(error.message || "Failed to delete chat. Please try again.");
    }
  };

  const handleRenameChat = async (e, chatId, currentTitle) => {
    e.stopPropagation();
    
    // Prompt for the new title
    const newTitle = prompt("Enter new chat title", currentTitle);

    if (newTitle && newTitle !== currentTitle) {
      try {
        // Send the updated title to the backend
        const response = await fetch(`http://localhost:8080/api/user-chats/${user.id}/update-chat-title`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chatId, newTitle }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to update chat title');
        }

        // Update the chat list with the new title
        setUserChats(prevChats =>
          prevChats.map(chat =>
            chat._id === chatId ? { ...chat, title: newTitle } : chat
          )
        );
      } catch (error) {
        console.error("Error renaming chat:", error);
        alert(error.message || "Failed to rename chat. Please try again.");
      }
    }
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
            {userChats.map((chat) => (
              <div
                key={chat._id}
                className={`conversation-item ${chat._id === currentChatId ? 'active' : ''}`}
                onClick={() => handleChatSelect(chat._id)}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span>{chat.title || "New Chat"}</span>
                  <button
                    className="btn btn-link p-0"
                    onClick={(e) => handleDropdownClick(e, chat._id)}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
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