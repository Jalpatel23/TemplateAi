// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const API_VERSION = 'v1';

// API endpoints
export const API_ENDPOINTS = {
  CHATS: `${API_BASE_URL}/api/${API_VERSION}/chats`,
  USER_CHATS: `${API_BASE_URL}/api/${API_VERSION}/user-chats`,
  HEALTH: `${API_BASE_URL}/health`,
};

// API request helper
export const apiRequest = async (endpoint, options = {}, authToken = null) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(endpoint, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Chat API functions
export const chatAPI = {
  // Save chat message
  saveMessage: async (userId, text, role = 'user', chatId = null, title = null, authToken = null) => {
    return apiRequest(API_ENDPOINTS.CHATS, {
      method: 'POST',
      body: JSON.stringify({
        userId,
        text,
        role,
        ...(chatId && { chatId }),
        ...(title && { title }),
      }),
    }, authToken);
  },

  // Get chat history
  getChatHistory: async (userId, chatId, authToken = null) => {
    return apiRequest(`${API_ENDPOINTS.CHATS}/${userId}/${chatId}`, {}, authToken);
  },

  // Get user chats
  getUserChats: async (userId, authToken = null) => {
    return apiRequest(`${API_ENDPOINTS.USER_CHATS}/${userId}`, {}, authToken);
  },

  // Delete chat
  deleteChat: async (userId, chatId, authToken = null) => {
    return apiRequest(`${API_ENDPOINTS.USER_CHATS}/${userId}/remove-chat?chatId=${encodeURIComponent(chatId)}`, {
      method: 'DELETE',
    }, authToken);
  },

  // Update chat title
  updateChatTitle: async (userId, chatId, newTitle, authToken = null) => {
    return apiRequest(`${API_ENDPOINTS.USER_CHATS}/${userId}/update-chat-title`, {
      method: 'PUT',
      body: JSON.stringify({ chatId, newTitle }),
    }, authToken);
  },
};

// Health check
export const healthCheck = async () => {
  return apiRequest(API_ENDPOINTS.HEALTH);
}; 