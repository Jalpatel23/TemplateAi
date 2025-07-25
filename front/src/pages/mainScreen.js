"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Copy, ThumbsUp, ThumbsDown, User, Paperclip, ChevronDown } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useUser, useAuth } from "@clerk/clerk-react";
import '.././styles.css';
import { useClerk } from "@clerk/clerk-react";
import { useTheme } from "../context/theme-context.tsx";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/clerk-react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import React from 'react';
import { chatAPI } from '../config/api.js';

export default function MainScreen({ messages, setMessages, sidebarOpen, currentChatId, setCurrentChatId, onMessageSent }) {
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const [likedMessages, setLikedMessages] = useState({});
  const [dislikedMessages, setDislikedMessages] = useState({});
  const [copiedMessages, setCopiedMessages] = useState({});
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();
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
  const MAX_GUEST_MESSAGES = 3;
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [notification, setNotification] = useState("");
  const inputAreaRef = useRef(null);
  const [inputAreaHeight, setInputAreaHeight] = useState(0);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("2.5 Flash");
  const modelMenuRef = useRef(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  // Add loading and error state for chat history fetch
  const [fetchingChat, setFetchingChat] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    function handleClickOutside(event) {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
        setIsModelMenuOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modelMenuRef]);

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
      setFetchingChat(true);
      setFetchError("");
      try {
        const token = await getToken();
        const data = await chatAPI.getChatHistory(user.id, currentChatId, token);
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
        setFetchError("Could not load chat history. Please try again.");
        setMessages([]);
        console.error("Error fetching chat history:", error);
      } finally {
        setFetchingChat(false);
      }
    };
    fetchChatHistory();
  }, [user, setMessages, currentChatId, getToken]);

  // Update input placeholder based on loading state
  useEffect(() => {
    setInputPlaceholder(isLoading ? "AI is thinking..." : "Type Here");
  }, [isLoading]);

  // Ensure textarea is always at min height on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = '38px';
    }
  }, []);

  // Dynamically update input area height for chat-area padding using ResizeObserver
  useEffect(() => {
    if (!inputAreaRef.current) return;
    const observer = new window.ResizeObserver(entries => {
      for (let entry of entries) {
        setInputAreaHeight(entry.target.offsetHeight);
      }
    });
    observer.observe(inputAreaRef.current);
    // Set initial height
    setInputAreaHeight(inputAreaRef.current.offsetHeight);
    return () => observer.disconnect();
  }, []);

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

  // Add file input change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showNotification("File size must be less than 10MB");
        return;
      }

      // Validate file type
      const allowedTypes = ['image/', 'application/pdf', '.doc', '.docx', '.txt'];
      const isValidType = allowedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''));
        }
        return file.type === type || file.name.toLowerCase().endsWith(type);
      });

      if (!isValidType) {
        showNotification("File type not allowed. Please upload images, PDFs, or documents.");
        return;
      }

      setSelectedFile(file);
      // For image preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputRef.current.value.trim();
    // If neither text nor file, do nothing
    if (!text && !selectedFile) return;

    // Check if user is not logged in and has reached the message limit
    if (!user && guestMessageCount >= MAX_GUEST_MESSAGES) {
      showNotification("You've reached the limit of messages. Please sign in to continue chatting.");
      openSignIn();
      return;
    }

    try {
      setIsLoading(true); // Start loading
      // Add user message to UI with animation
      let userMessage = { type: "user", text, animation: "fade-in" };
      if (selectedFile) {
        userMessage.file = {
          name: selectedFile.name,
          type: selectedFile.type,
          preview: filePreview
        };
      }
      if (text || selectedFile) {
        setMessages(prev => [...prev, userMessage]);
      }
      // Show remaining messages notification for guests (if under limit)
      if (!user && guestMessageCount < MAX_GUEST_MESSAGES) {
        showNotification(`Messages remaining: ${MAX_GUEST_MESSAGES - guestMessageCount - 1}`);
      }
      // Clear input and file after sending
      inputRef.current.value = "";
      inputRef.current.style.height = '38px';
      setSelectedFile(null);
      setFilePreview(null);
      // Add loading message with typing animation
      setMessages(prev => [...prev, { 
        type: "assistant", 
        text: "",
        isLoading: true,
        animation: "fade-in"
      }]);
      // Prepare Gemini API request
      let geminiRequest = {
        contents: [{
          parts: []
        }]
      };
      if (text) {
        geminiRequest.contents[0].parts.push({ text });
      }
      if (selectedFile) {
        // Read file as base64
        const fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]); // Remove data:*/*;base64,
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
        // For images, use inlineData; for PDFs/docs, send as base64 (Gemini may only support images for now)
        if (selectedFile.type.startsWith('image/')) {
          geminiRequest.contents[0].parts.push({
            inlineData: {
              mimeType: selectedFile.type,
              data: fileData
            }
          });
        } else if (selectedFile.type === 'application/pdf') {
          geminiRequest.contents[0].parts.push({
            inlineData: {
              mimeType: selectedFile.type,
              data: fileData
            }
          });
        } else {
          // For docs, try to read as text
          const textData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(selectedFile);
          });
          geminiRequest.contents[0].parts.push({ text: textData });
        }
      }
      // Call Gemini API
      const geminiResponse = await fetch(process.env.REACT_APP_GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiRequest)
      });
      
      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
      }
      
      const geminiData = await geminiResponse.json();
      let modelResponse = "";
      if (geminiData.candidates && geminiData.candidates[0]?.content?.parts[0]?.text) {
        modelResponse = geminiData.candidates[0].content.parts[0].text;
      } else {
        modelResponse = "Sorry, I couldn't process the file.";
      }
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      // Only save to database if user is logged in
      if (user && user.id) {
        // Save user message
        let chatTitle = undefined;
        if (!currentChatId) {
          // Extract first three words from the prompt
          const words = (text || (selectedFile ? selectedFile.name : "")).split(/\s+/).filter(Boolean);
          chatTitle = words.slice(0, 3).join(" ");
        }
        
        try {
          const token = await getToken();
          const response = await chatAPI.saveMessage(
            user.id, 
            text || (selectedFile ? selectedFile.name : ""),
            'user',
            currentChatId,
            chatTitle,
            token
          );
          
          // Set the current chat ID if this is a new chat
          if (!currentChatId && response.chat._id) {
            setCurrentChatId(response.chat._id);
          }
          
          // Save model response to database
          await chatAPI.saveMessage(
            user.id, 
            modelResponse,
            'model',
            currentChatId || response.chat._id,
            null,
            token
          );
          
          // Trigger sidebar refresh
          onMessageSent();
        } catch (error) {
          console.error("Error saving to database:", error);
          showNotification("Message sent but couldn't save to history. Please try again.");
        }
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
        showNotification("You've reached the limit of messages. Please sign in to continue chatting.");
      }
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

  // Show notification for 2 seconds
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2000);
  };

  return (
    <div className={`main-content ${sidebarOpen ? "" : "without-sidebar"} d-flex flex-column`}>
      {/* Model Selector (Top Left) */}
      <div className="model-selector-container position-fixed" style={{ top: 12, left: sidebarOpen ? 275 : 55, zIndex: 2200, transition: 'left 0.3s ease-in-out' }} ref={modelMenuRef}>
        <button
          className="btn d-flex align-items-center justify-content-between"
          onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
          style={{
            height: 32,
            borderRadius: 8,
            background: 'var(--background-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontWeight: 500,
            fontSize: '0.9rem',
            padding: '0 8px 0 12px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            gap: 4,
          }}
        >
          {selectedModel}
          <ChevronDown size={16} />
        </button>
        {isModelMenuOpen && (
          <div
            className="card"
            style={{
              position: 'absolute',
              top: 38,
              left: 0,
              width: 290,
              zIndex: 2100,
              background: 'var(--background-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              padding: 0,
            }}
          >
            <div className="card-body p-3 pb-2">
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>Choose your model</div>
              <div className="list-group list-group-flush" style={{ borderRadius: 8, overflow: 'hidden' }}>
                <a
                  href="#"
                  className="list-group-item list-group-item-action d-flex align-items-center"
                  style={{ background: hoveredItem === '2.5 Flash' ? 'var(--hover-bg)' : 'transparent', color: 'var(--text-primary)', fontSize: 15, padding: '10px 12px', border: 'none', position: 'relative' }}
                  onClick={e => { e.preventDefault(); setSelectedModel("2.5 Flash"); setIsModelMenuOpen(false); }}
                  onMouseEnter={() => setHoveredItem('2.5 Flash')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 500 }}>2.5 Flash</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Fast all-round help</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="list-group-item list-group-item-action d-flex align-items-center"
                  style={{ background: hoveredItem === '2.5 Pro' ? 'var(--hover-bg)' : 'transparent', color: 'var(--text-primary)', fontSize: 15, padding: '10px 12px', border: 'none', position: 'relative' }}
                  onClick={e => { e.preventDefault(); setSelectedModel("2.5 Pro"); setIsModelMenuOpen(false); }}
                  onMouseEnter={() => setHoveredItem('2.5 Pro')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 500 }}>2.5 Pro <span className="badge bg-primary" style={{ fontSize: 11, marginLeft: 4 }}>New</span></div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Reasoning, maths and code</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="list-group-item list-group-item-action d-flex align-items-center"
                  style={{ background: hoveredItem === 'Personalisation' ? 'var(--hover-bg)' : 'transparent', color: 'var(--text-primary)', fontSize: 15, padding: '10px 12px', border: 'none', position: 'relative' }}
                  onClick={e => { e.preventDefault(); setSelectedModel("Personalisation"); setIsModelMenuOpen(false); }}
                  onMouseEnter={() => setHoveredItem('Personalisation')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 500 }}>Personalisation (preview) <span className="badge bg-primary" style={{ fontSize: 11, marginLeft: 4 }}>New</span></div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Based on your Search history</div>
                  </div>
                </a>
              </div>
              <div className="mt-3 mb-1">
                <button 
                  className="btn btn-secondary w-100" 
                  style={{ borderRadius: 8, fontWeight: 500, fontSize: 15, background: '#23272f', border: 'none' }}
                  onClick={() => window.location.href = '/subscription'}
                >
                  Upgrade
                </button>
                <div className="small mt-2" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Get our most capable models and features</div>
              </div>
            </div>
          </div>
        )}
      </div>
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
      </div>

      {/* Chat Area */}
      <div className="chat-area flex-grow-1" style={{ paddingBottom: inputAreaHeight - 70}}>
        {fetchingChat && <div className="text-center my-3">Loading chat history...</div>}
        {fetchError && <div className="alert alert-danger my-3">{fetchError}</div>}
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.type} ${message.animation || ''}`} 
            style={{ alignSelf: "flex-start" }}
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
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <div className="code-block-container">
                            <SyntaxHighlighter
                              style={theme === 'light' ? oneLight : oneDark}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                            <button 
                              className="btn btn-link code-copy-btn" 
                              onClick={() => {
                                navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                setCopiedMessages((prev) => ({
                                  ...prev,
                                  [`code-${node.position?.start.line}`]: true,
                                }));
                                setTimeout(() => {
                                  setCopiedMessages((prev) => ({
                                    ...prev,
                                    [`code-${node.position?.start.line}`]: false,
                                  }));
                                }, 1000);
                              }}
                              title="Copy code"
                            >
                              <Copy 
                                size={16} 
                                color={copiedMessages[`code-${node.position?.start.line}`] ? "var(--text-primary)" : "var(--icon-color)"} 
                                fill={copiedMessages[`code-${node.position?.start.line}`] ? "var(--text-primary)" : "none"} 
                              />
                            </button>
                          </div>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                )}
              </p>
              {/* Show PDF icon or image preview for user messages with file */}
              {message.type === "user" && message.file && (
                <div className="mt-2">
                  {message.file.type === 'application/pdf' ? (
                    <span title={message.file.name} style={{ fontSize: 32, color: '#d32f2f' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#d32f2f"/>
                        <text x="6" y="19" fontSize="10" fill="white" fontFamily="Arial" fontWeight="bold">PDF</text>
                      </svg>
                    </span>
                  ) : message.file.type.startsWith('image/') && message.file.preview ? (
                    <img src={message.file.preview} alt="preview" style={{ maxWidth: 100, maxHeight: 100, borderRadius: 4, border: '1px solid #eee' }} />
                  ) : null}
                </div>
              )}
              {/* End file preview/icon */}
              {message.type === "assistant" && !message.isLoading && (
                <div className="message-actions">
                  <button 
                    className="btn btn-link" 
                    onClick={() => handleCopy(index, message.text)}
                    title="Copy message"
                    aria-label="Copy message"
                  >
                    <Copy size={16} color={copiedMessages[index] ? "var(--text-primary)" : "var(--icon-color)"} fill={copiedMessages[index] ? "var(--text-primary)" : "none"} />
                  </button>
                  <button 
                    className="btn btn-link" 
                    onClick={() => toggleLike(index)}
                    title="Like message"
                    aria-label="Like message"
                  >
                    <ThumbsUp size={16} color={likedMessages[index] ? "var(--text-primary)" : "var(--icon-color)"} fill={likedMessages[index] ? "var(--text-primary)" : "none"} />
                  </button>
                  <button 
                    className="btn btn-link" 
                    onClick={() => toggleDislike(index)}
                    title="Dislike message"
                    aria-label="Dislike message"
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
        {/* Notification Popup */}
        {notification && (
          <div className="custom-notification-popup">
            {notification}
          </div>
        )}
        <div ref={inputAreaRef} className={`input-area ${sidebarOpen ? "" : "full-width"} w-100 d-flex flex-column align-items-center`}>
          <div style={{ width: '100%', maxWidth: 600 }} className="d-flex flex-column align-items-start">
            {/* File preview above and left-aligned with the textbox, with remove button */}
            {selectedFile && (
              <div className="mb-2" style={{ position: 'relative', width: 'fit-content', minWidth: 0 }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  {/* Remove (cross) button */}
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setFilePreview(null); }}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      background: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 2,
                      padding: 0
                    }}
                    aria-label="Remove file preview"
                  >
                    <span style={{ fontSize: 14, color: '#888', lineHeight: 1 }}>&times;</span>
                  </button>
                  {/* Preview */}
                  {selectedFile.type === 'application/pdf' ? (
                    <span title={selectedFile.name} style={{ fontSize: 28, color: '#d32f2f', display: 'inline-block' }}>
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#d32f2f"/>
                        <text x="6" y="19" fontSize="10" fill="white" fontFamily="Arial" fontWeight="bold">PDF</text>
                      </svg>
                    </span>
                  ) : selectedFile.type.startsWith('image/') && filePreview ? (
                    <img src={filePreview} alt="preview" style={{ maxWidth: 60, maxHeight: 60, borderRadius: 4, border: '1px solid #eee', display: 'block' }} />
                  ) : null}
                </div>
              </div>
            )}
            <div className="input-container mb-3 d-flex align-items-center gap-2 w-100">
              <input
                type="file"
                accept="image/*,application/pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
                id="file-upload-input"
                onChange={handleFileChange}
                ref={el => (window.fileUploadInput = el)}
              />
              <button
                type="button"
                className="btn btn-link mb-0 p-0 d-flex align-items-center"
                title="Upload file"
                aria-label="Upload file"
                style={{marginRight: 4}}
                onClick={() => {
                  if (!user) {
                    showNotification('login is needed to upload a document');
                  } else {
                    window.fileUploadInput && window.fileUploadInput.click();
                  }
                }}
              >
                <Paperclip size={18} color="var(--icon-color)" />
              </button>
              <textarea 
                ref={inputRef} 
                name="text" 
                placeholder={inputPlaceholder}
                className="form-control" 
                disabled={isLoading}
                autoComplete="off"
                style={{
                  resize: 'none',
                  minHeight: '30px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  lineHeight: '1.5',
                  // padding: '0.375rem 0.75rem',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--text-secondary) transparent'
                }}
                onInput={(e) => {
                  e.target.style.height = '38px';
                  e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    if (!isLoading) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }
                }}
              />
              <button 
                type="submit" 
                className="btn btn-link"
                disabled={isLoading}
                title={isLoading ? "Please wait..." : "Send message"}
                aria-label="Send message"
              >
                <Send size={16} color={isLoading ? "var(--text-muted)" : "var(--icon-color)"} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}