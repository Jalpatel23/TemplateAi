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
  const [dropdownDirection, setDropdownDirection] = useState('down');

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
    // Determine if dropdown should open up or down
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const list = document.querySelector('.conversation-list');
    const listRect = list ? list.getBoundingClientRect() : { bottom: window.innerHeight };
    const dropdownHeight = 80; // Approximate height of dropdown (2 items)
    if (listRect.bottom - rect.bottom < dropdownHeight) {
      setDropdownDirection('up');
    } else {
      setDropdownDirection('down');
    }
    setActiveDropdown(activeDropdown === chatId ? null : chatId);
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      const response = await fetch(`http://localhost:8080/api/user-chats/${user.id}/remove-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete chat');
      setUserChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
      if (currentChatId === chatId) onChatSelect(null);
      setActiveDropdown(null);
      onNewChat();
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert(error.message || 'Failed to delete chat. Please try again.');
    }
  };

  const handleRenameChat = async (e, chatId, currentTitle) => {
    e.stopPropagation();
    const newTitle = prompt('Enter new chat title', currentTitle);
    if (newTitle && newTitle !== currentTitle) {
      try {
        const response = await fetch(`http://localhost:8080/api/user-chats/${user.id}/update-chat-title`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId, newTitle }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update chat title');
        setUserChats(prevChats => prevChats.map(chat => chat._id === chatId ? { ...chat, title: newTitle } : chat));
        setActiveDropdown(null);
      } catch (error) {
        console.error('Error renaming chat:', error);
        alert(error.message || 'Failed to rename chat. Please try again.');
      }
    }
  };

  // Click-away handler to close dropdown
  useEffect(() => {
    const handleClick = () => setActiveDropdown(null);
    if (activeDropdown !== null) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [activeDropdown]);

  return (
    <>
      {/* Hamburger menu for mobile */}
      <button
        className="open-sidebar-btn"
        style={{ position: 'fixed', top: 10, left: 10, zIndex: 2100, display: sidebarOpen ? 'none' : 'block' }}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <ChevronsRight size={24} color="var(--icon-color)" />
      </button>

      {/* Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${!sidebarOpen ? 'd-none d-md-flex' : ''} flex-column`}
        style={{ zIndex: 2000 }}
      >
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
              {theme === "dark" ? (
                <Sun size={20} color="var(--icon-color)" />
              ) : (
                <Moon size={20} color="var(--icon-color)" />
              )}
            </button>
            <button className="btn btn-link d-none d-md-inline" onClick={() => setSidebarOpen(false)}>
              <ChevronsLeft size={20} color="var(--icon-color)" />
            </button>
            {/* Mobile close button */}
            <button
              className="btn btn-link d-md-none"
              style={{ marginLeft: 8 }}
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
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
                style={{ position: 'relative' }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span>{chat.title || "New Chat"}</span>
                  <button
                    className="btn btn-link p-0"
                    onClick={e => handleDropdownClick(e, chat._id)}
                    style={{ position: 'relative', zIndex: 2 }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
                {activeDropdown === chat._id && (
                  <div
                    className="dropdown-menu show"
                    style={{
                      position: 'absolute',
                      top: dropdownDirection === 'down' ? '100%' : 'auto',
                      bottom: dropdownDirection === 'up' ? '100%' : 'auto',
                      right: 0,
                      zIndex: 3000,
                      minWidth: 120,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      background: 'var(--bg-secondary)',
                      borderRadius: 8,
                      padding: 0,
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      className="dropdown-item text-primary"
                      onClick={e => handleRenameChat(e, chat._id, chat.title)}
                    >
                      <Edit2 size={16} className="me-2" color="#0d6efd" /> Rename
                    </button>
                    <button
                      className="dropdown-item text-danger"
                      onClick={e => handleDeleteChat(e, chat._id)}
                    >
                      <Trash2 size={16} className="me-2" /> Delete
                    </button>
                  </div>
                )}
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