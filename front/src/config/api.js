// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const API_VERSION = 'v1';

// API endpoints
export const API_ENDPOINTS = {
  CHATS: `${API_BASE_URL}/api/${API_VERSION}/chats`,
  USER_CHATS: `${API_BASE_URL}/api/${API_VERSION}/user-chats`,
  HEALTH: `${API_BASE_URL}/health`,

};

// Simple cache implementation
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CHAT_CACHE_DURATION = 30 * 1000; // 30 seconds for chat data



// API request helper
export const apiRequest = async (endpoint, options = {}, authToken = null) => {
  const cacheKey = `${endpoint}-${JSON.stringify(options)}-${authToken}`;
  
  // Check cache for GET requests
  if (options.method === 'GET' || !options.method) {
    const cached = cache.get(cacheKey);
    const isChatEndpoint = endpoint.includes('/user-chats') || endpoint.includes('/chats/');
    const cacheDuration = isChatEndpoint ? CHAT_CACHE_DURATION : CACHE_DURATION;
    
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data;
    }
  }
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session
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
      
      // Use standardized error handling with error codes
      let errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      
      // Handle specific error codes from backend
      if (errorData.code) {
        switch (errorData.code) {
          case 'AUTH_REQUIRED':
            errorMessage = "Authentication required. Please sign in again.";
            break;
          case 'INVALID_TOKEN':
            errorMessage = "Your session has expired. Please sign in again.";
            break;
          case 'ACCESS_DENIED':
            errorMessage = "Access denied. You don't have permission for this action.";
            break;
          case 'CHAT_NOT_FOUND':
            errorMessage = "Chat not found. It may have been deleted.";
            break;
          case 'USER_CHATS_NOT_FOUND':
            errorMessage = "No chats found for this user.";
            break;
          case 'RATE_LIMIT_EXCEEDED':
            errorMessage = "Too many requests. Please wait a moment and try again.";
            break;
          case 'CHAT_RATE_LIMIT_EXCEEDED':
            errorMessage = "Too many chat requests. Please slow down.";
            break;
          case 'VALIDATION_FAILED':
            errorMessage = "Invalid input. Please check your data and try again.";
            break;
          case 'MISSING_CHAT_ID':
            errorMessage = "Chat ID is required.";
            break;
          case 'MISSING_TITLE':
            errorMessage = "Title is required and cannot be empty.";
            break;
          case 'TITLE_TOO_LONG':
            errorMessage = "Title must be less than 100 characters.";
            break;
          case 'ROUTE_NOT_FOUND':
            errorMessage = "Resource not found. Please try again.";
            break;
          default:
            // Fallback to HTTP status code handling
            if (response.status === 401) {
              errorMessage = "Authentication required. Please sign in again.";
            } else if (response.status === 403) {
              errorMessage = "Access denied. You don't have permission for this action.";
            } else if (response.status === 404) {
              errorMessage = "Resource not found. Please try again.";
            } else if (response.status === 429) {
              errorMessage = "Too many requests. Please wait a moment and try again.";
            } else if (response.status >= 500) {
              errorMessage = "Server error. Please try again later.";
            }
        }
      } else {
        // Fallback to HTTP status code handling for legacy responses
        if (response.status === 401) {
          errorMessage = "Authentication required. Please sign in again.";
        } else if (response.status === 403) {
          errorMessage = "Access denied. You don't have permission for this action.";
        } else if (response.status === 404) {
          errorMessage = "Resource not found. Please try again.";
        } else if (response.status === 429) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        } else if (response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      }
      
      // Create enhanced error object with code
      const enhancedError = new Error(errorMessage);
      enhancedError.code = errorData.code;
      enhancedError.status = response.status;
      enhancedError.timestamp = errorData.timestamp;
      
      throw enhancedError;
    }
    
    const data = await response.json();
    
    // Cache GET requests
    if (options.method === 'GET' || !options.method) {
      const isChatEndpoint = endpoint.includes('/user-chats') || endpoint.includes('/chats/');
      const cacheDuration = isChatEndpoint ? CHAT_CACHE_DURATION : CACHE_DURATION;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        duration: cacheDuration
      });
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Clear cache function
export const clearCache = () => {
  cache.clear();
};

// Clear chat-related cache entries
export const clearChatCache = () => {
  for (const [key] of cache) {
    if (key.includes('/user-chats') || key.includes('/chats/')) {
      cache.delete(key);
    }
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

  // Get chat history with pagination
  getChatHistory: async (userId, chatId, page = 1, limit = 50, authToken = null) => {
    const params = new URLSearchParams({ page, limit });
    return apiRequest(`${API_ENDPOINTS.CHATS}/${userId}/${chatId}?${params}`, {}, authToken);
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