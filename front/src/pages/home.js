import React, { useState, useRef, useEffect } from 'react';
import { Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import Layout from '../components/layout';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#ffffff'
  },
  header: {
    borderBottom: '1px solid #e5e7eb',
    padding: '1rem'
  },
  headerContent: {
    maxWidth: '64rem',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: 0
  },
  main: {
    flex: 1,
    overflowY: 'auto'
  },
  messageContainer: {
    maxWidth: '64rem',
    margin: '0 auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  welcomeMessage: {
    backgroundColor: '#f9fafb',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #f3f4f6'
  },
  message: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    borderRadius: '0.5rem'
  },
  assistantMessage: {
    backgroundColor: '#f9fafb'
  },
  avatar: {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem'
  },
  claudeAvatar: {
    backgroundColor: '#dbeafe',
    color: '#2563eb'
  },
  userAvatar: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563'
  },
  messageContent: {
    flex: 1,
    wordBreak: 'break-word'
  },
  feedbackButtons: {
    marginTop: '1rem',
    display: 'flex',
    gap: '0.5rem'
  },
  feedbackButton: {
    padding: '0.25rem',
    borderRadius: '0.25rem',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footer: {
    borderTop: '1px solid #e5e7eb'
  },
  footerContent: {
    maxWidth: '64rem',
    margin: '0 auto',
    padding: '1rem'
  },
  form: {
    position: 'relative'
  },
  textarea: {
    width: '100%',
    resize: 'none',
    borderRadius: '0.5rem',
    border: '1px solid #d1d5db',
    padding: '1rem',
    paddingRight: '3rem',
    minHeight: '56px',
    maxHeight: '200px',
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: 'inherit'
  },
  textareaFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 1px #3b82f6'
  },
  sendButton: {
    position: 'absolute',
    right: '0.75rem',
    bottom: '0.75rem',
    padding: '0.25rem',
    borderRadius: '0.25rem',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonDisabled: {
    cursor: 'default',
    color: '#9ca3af'
  },
  sendButtonEnabled: {
    color: '#2563eb'
  }
};

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);

  const adjustTextAreaHeight = () => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextAreaHeight();
  }, [inputValue]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const newMessages = [
      ...messages,
      { 
        role: 'user', 
        content: inputValue.trim() 
      }
    ];

    const claudeResponse = {
      role: 'assistant',
      content: `You said: "${inputValue.trim()}" (This is a demo response)`
    };

    setMessages(newMessages);
    setTimeout(() => {
      setMessages([...newMessages, claudeResponse]);
    }, 500);

    setInputValue('');
  };

  return (
    <Layout>
      <div style={styles.container}>
        <main style={styles.main}>
          <div style={styles.messageContainer}>
            <div style={styles.welcomeMessage}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ ...styles.avatar, ...styles.claudeAvatar }}> jp </div>
                <p style={{ margin: 0 }}>Hello user</p>
              </div>
            </div>

            {messages.map((message, index) => (
              <div 
                key={index} 
                style={{
                  ...styles.message,
                  ...(message.role === 'assistant' ? styles.assistantMessage : {})
                }}
              >
                <div 
                  style={{
                    ...styles.avatar,
                    ...(message.role === 'assistant' ? styles.claudeAvatar : styles.userAvatar)
                  }}
                >
                  {message.role === 'assistant' ? 'AI' : 'Y'}
                </div>
                
                <div style={styles.messageContent}>
                  <div>{message.content}</div>
                  
                  {message.role === 'assistant' && (
                    <div style={styles.feedbackButtons}>
                      <button style={styles.feedbackButton}>
                        <ThumbsUp size={16} color="#6b7280" />
                      </button>
                      <button style={styles.feedbackButton}>
                        <ThumbsDown size={16} color="#6b7280" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <form onSubmit={handleSubmit} style={styles.form}>
              <textarea
                ref={textAreaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Message..."
                style={{
                  ...styles.textarea,
                  ...(isFocused ? styles.textareaFocus : {})
                }}
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                style={{
                  ...styles.sendButton,
                  ...(inputValue.trim() ? styles.sendButtonEnabled : styles.sendButtonDisabled)
                }}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default Home;