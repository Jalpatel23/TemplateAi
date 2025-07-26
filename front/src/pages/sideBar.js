"use client";
import { useRef, useEffect, useState } from "react";
import { Plus, ChevronsRight, ChevronsLeft, Sun, Moon, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useTheme } from "../context/theme-context.tsx";
import { useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { createPortal } from 'react-dom';
import { chatAPI } from '../config/api.js';

export default function SidebarAndHeader({ sidebarOpen, setSidebarOpen, onNewChat, refreshChats, onChatSelect, currentChatId, isLoggedIn, isLoaded }) {
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const { getToken } = useAuth();
  const [userChats, setUserChats] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownDirection, setDropdownDirection] = useState('down');
  const [renameModal, setRenameModal] = useState({ open: false, chatId: null, currentTitle: "" });
  const [renameInput, setRenameInput] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, chatId: null });
  const [deletingChat, setDeletingChat] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Function to categorize chats by date
  const categorizeChatsByDate = (chats) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    // Sort chats by date (most recent first)
    const sortedChats = [...chats].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA;
    });

    return sortedChats.reduce((acc, chat) => {
      const chatDate = new Date(chat.updatedAt || chat.createdAt);
      const chatDateOnly = new Date(chatDate.getFullYear(), chatDate.getMonth(), chatDate.getDate());

      if (chatDateOnly.getTime() === today.getTime()) {
        acc.today.push(chat);
      } else if (chatDateOnly.getTime() === yesterday.getTime()) {
        acc.yesterday.push(chat);
      } else if (chatDateOnly.getTime() >= last7Days.getTime()) {
        acc.last7Days.push(chat);
      } else if (chatDateOnly.getTime() >= last30Days.getTime()) {
        acc.last30Days.push(chat);
      } else {
        acc.older.push(chat);
      }
      return acc;
    }, {
      today: [],
      yesterday: [],
      last7Days: [],
      last30Days: [],
      older: []
    });
  };

  // Fetch user's chat list
  useEffect(() => {
    const fetchUserChats = async () => {
      if (!user || !user.id) return;

      try {
        const token = await getToken();
        const data = await chatAPI.getUserChats(user.id, token);
        
        if (data.userChats && data.userChats.chats) {
          setUserChats(data.userChats.chats);
        }
      } catch (error) {
        console.error("Error fetching user chats:", error);
      }
    };

    fetchUserChats();
  }, [user, refreshChats, getToken]);

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
    setDeleteModal({ open: true, chatId });
  };

  const confirmDeleteChat = async () => {
    const chatId = deleteModal.chatId;
    setDeletingChat(true);
    setDeleteError("");
    try {
      const token = await getToken();
      await chatAPI.deleteChat(user.id, chatId, token);
      setUserChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
      if (currentChatId === chatId) onChatSelect(null);
      setActiveDropdown(null);
      onNewChat();
      setDeleteModal({ open: false, chatId: null });
    } catch (error) {
      setDeleteError(error.message || 'Failed to delete chat. Please try again.');
      setDeleteModal({ open: false, chatId: null });
    } finally {
      setDeletingChat(false);
    }
  };

  const handleRenameChat = (e, chatId, currentTitle) => {
    e.stopPropagation();
    setRenameModal({ open: true, chatId, currentTitle });
    setRenameInput(currentTitle || "");
  };

  const submitRename = async () => {
    const newTitle = renameInput.trim();
    if (!newTitle || newTitle === renameModal.currentTitle) {
      setRenameModal({ open: false, chatId: null, currentTitle: "" });
      return;
    }
    try {
      const token = await getToken();
      await chatAPI.updateChatTitle(user.id, renameModal.chatId, newTitle, token);
      setUserChats(prevChats => prevChats.map(chat => chat._id === renameModal.chatId ? { ...chat, title: newTitle } : chat));
      setRenameModal({ open: false, chatId: null, currentTitle: "" });
    } catch (error) {
      alert(error.message || 'Failed to rename chat. Please try again.');
      setRenameModal({ open: false, chatId: null, currentTitle: "" });
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

  const renderDropdown = (chat) => {
    if (activeDropdown !== chat._id) return null;

    const button = document.querySelector(`[data-chat-id="${chat._id}"]`);
    if (!button) return null;

    const rect = button.getBoundingClientRect();
    const dropdownStyle = {
      position: 'fixed',
      top: dropdownDirection === 'down' ? rect.bottom + 5 : rect.top - 85,
      left: rect.right - 120,
      zIndex: 9999,
    };

    return createPortal(
      <div
        className="dropdown-menu show"
        style={dropdownStyle}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="dropdown-item text-primary"
          onClick={e => handleRenameChat(e, chat._id, chat.title)}
          aria-label="Rename chat"
        >
          <Edit2 size={16} className="me-2" color="#0d6efd" /> Rename
        </button>
        <button
          className="dropdown-item text-danger"
          onClick={e => handleDeleteChat(e, chat._id)}
          aria-label="Delete chat"
        >
          <Trash2 size={16} className="me-2" color="#dc3545" /> Delete
        </button>
      </div>,
      document.body
    );
  };

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
        style={{ zIndex: 2000, height: '100vh', position: 'fixed', left: 0, top: 0, width: 260, display: 'flex', flexDirection: 'column' }}
      >
        {/* Header and app title as top flex child */}
        <div style={{ flexShrink: 0 }}>
          <div className="d-flex justify-content-between align-items-center p-2">
            <button
              className="btn btn-link d-flex align-items-center gap-2"
              onClick={handleNewChat}
              aria-label="Start new chat"
            >
              <Plus size={18} />
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
            <span>Template AI</span>
          </div>
        </div>
        {/* Chat list or login prompt as scrollable flex child */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {!isLoaded ? (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '60%' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : !isLoggedIn ? (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '60%' }}>
              <button
                className="btn"
                style={{
                  fontWeight: 500,
                  fontSize: 14,
                  borderRadius: 8,
                  padding: '8px 18px',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
                onClick={() => openSignIn()}
              >
                Login to see history
              </button>
            </div>
          ) : (
            <div className="conversation-list">
              <div className="px-3 py-2">
                {(() => {
                  const categorizedChats = categorizeChatsByDate(userChats);
                  const sections = [
                    { title: "Today", chats: categorizedChats.today },
                    { title: "Yesterday", chats: categorizedChats.yesterday },
                    { title: "Last 7 Days", chats: categorizedChats.last7Days },
                    { title: "Last 30 Days", chats: categorizedChats.last30Days },
                    { title: "Older", chats: categorizedChats.older }
                  ];

                  return sections.map((section, index) => (
                    section.chats.length > 0 && (
                      <div key={index} className="mb-3">
                        <small className="conversation-date">{section.title}</small>
                        {section.chats.map((chat) => (
                          <div
                            key={chat._id}
                            className={`conversation-item ${chat._id === currentChatId ? 'active' : ''}`}
                            onClick={() => handleChatSelect(chat._id)}
                            style={{ position: 'relative' }}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="conversation-title" title={chat.title || "New Chat"}>
                                {chat.title || "New Chat"}
                              </span>
                              <button
                                className="btn btn-link p-0 more-options-btn"
                                onClick={(e) => handleDropdownClick(e, chat._id)}
                                data-chat-id={chat._id}
                                aria-label="Open chat options menu"
                              >
                                <MoreHorizontal size={16} />
                              </button>
                            </div>
                            {renderDropdown(chat)}
                          </div>
                        ))}
                      </div>
                    )
                  ));
                })()}
              </div>
            </div>
          )}
        </div>
        {/* Upgrade Button as bottom flex child */}
        {sidebarOpen && (
          <div style={{ flexShrink: 0 }}>
            <button
              className="btn w-100 upgrade-btn"
              style={{
                borderRadius: 0,
                fontWeight: 600,
                fontSize: 16,
                padding: '16px 0',
                background: theme === 'dark' ? 'var(--bg-primary)' : '#f5f5f5',
                color: theme === 'dark' ? 'var(--text-primary)' : '#222',
                border: 'none',
                boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
                zIndex: 2100
              }}
              onClick={() => window.location.href = '/subscription'}
            >
              Upgrade
            </button>
          </div>
        )}
      </div>

      {/* Open Sidebar Button */}
      {!sidebarOpen && (
        <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
          <ChevronsRight size={24} color="var(--icon-color)" />
        </button>
      )}

      {renameModal.open && (
        <div className="custom-modal-overlay" onClick={() => setRenameModal({ open: false, chatId: null, currentTitle: "" })}>
          <div className="custom-modal" onClick={e => e.stopPropagation()}>
            <h5>Rename Chat</h5>
            <input
              className="form-control"
              value={renameInput}
              onChange={e => setRenameInput(e.target.value)}
              autoFocus
              maxLength={50}
              style={{ marginBottom: 12 }}
              onKeyDown={e => { if (e.key === "Enter") submitRename(); }}
            />
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setRenameModal({ open: false, chatId: null, currentTitle: "" })}>Cancel</button>
              <button className="btn btn-primary" onClick={submitRename} disabled={!renameInput.trim() || renameInput.trim() === renameModal.currentTitle}>Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.open && (
        <div className="custom-modal-overlay" onClick={() => setDeleteModal({ open: false, chatId: null })}>
          <div className="custom-modal" onClick={e => e.stopPropagation()}>
            <h5>Delete Chat</h5>
            <div style={{ marginBottom: 16 }}>Are you sure you want to delete this chat? This action cannot be undone.</div>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setDeleteModal({ open: false, chatId: null })}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDeleteChat}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Render loading and error UI for chat deletion (e.g., in modal or near chat list) */}
      {deletingChat && <div className="text-center my-2">Deleting chat...</div>}
      {deleteError && <div className="alert alert-danger my-2">{deleteError}</div>}
    </>
  );
}