import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import config from "./config/config.js";
import userChatsRoutes from "./routes/userChats.js";
import Chat, { ROLE_USER, ROLE_MODEL } from "./models/chat.js";
import UserChats from "./models/userChats.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import logger from "./utils/logger.js";
import { authMiddleware, optionalAuthMiddleware } from "./middleware/auth.js";
import { validateChatMessage, handleValidationErrors, validateRateLimit } from "./middleware/validation.js";
import { handleApiError, createErrorResponse, ERROR_CODES, asyncErrorHandler, errorHandler } from "./utils/errorHandler.js";

dotenv.config();

// Validate configuration
try {
  config.validate();
} catch (error) {
  logger.error('Configuration validation failed:', error.message);
  process.exit(1);
}

connectDB();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.clerk.dev", "https://generativelanguage.googleapis.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// CORS configuration
const corsOptions = {
  origin: config.nodeEnv === 'production' 
    ? [config.frontendUrl] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Tiered Rate Limiting Implementation

// General API rate limiting (IP-based)
const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: { 
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res) => {
    logger.warn(`General rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(config.rateLimitWindowMs / 1000)
    });
  }
});

// Tiered chat rate limiting based on authentication status
const tieredChatLimiter = rateLimit({
  windowMs: config.chatRateLimitWindowMs,
  max: (req) => {
    // Use different limits based on authentication status
    if (req.user) {
      // Authenticated users get higher limits
      return config.chatRateLimitMaxRequestsAuthenticated;
    } else {
      // Unauthenticated users get lower limits
      return config.chatRateLimitMaxRequestsUnauthenticated;
    }
  },
  message: { 
    error: 'Too many chat requests, please slow down.',
    code: 'CHAT_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Use user ID for authenticated users, IP for unauthenticated
    if (req.user) {
      return `user:${req.user.id}`;
    } else {
      return `ip:${req.ip || req.connection.remoteAddress}`;
    }
  },
  handler: (req, res) => {
    const userType = req.user ? 'authenticated user' : 'unauthenticated user';
    const identifier = req.user ? req.user.id : req.ip;
    logger.warn(`Chat rate limit exceeded for ${userType}: ${identifier}`);
    res.status(429).json({
      error: 'Too many chat requests, please slow down.',
      code: 'CHAT_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(config.chatRateLimitWindowMs / 1000)
    });
  }
});

// User-specific rate limiting for authenticated users (higher limits)
const userSpecificLimiter = rateLimit({
  windowMs: config.userRateLimitWindowMs,
  max: config.userRateLimitMaxRequests,
  message: { 
    error: 'Too many requests for this user, please try again later.',
    code: 'USER_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Only apply to authenticated users
    return req.user ? `user:${req.user.id}` : req.ip;
  },
  handler: (req, res) => {
    const identifier = req.user ? req.user.id : req.ip;
    logger.warn(`User-specific rate limit exceeded for: ${identifier}`);
    res.status(429).json({
      error: 'Too many requests for this user, please try again later.',
      code: 'USER_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(config.userRateLimitWindowMs / 1000)
    });
  },
  skip: (req) => {
    // Skip this limiter for unauthenticated users
    return !req.user;
  }
});

// Apply rate limiters
app.use('/api/', generalLimiter);
app.use('/api/chats', tieredChatLimiter);
app.use('/api/user-chats', userSpecificLimiter);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: logger.stream }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// API versioning - all routes under /api/v1
const apiV1Router = express.Router();

// Mount user chats routes with authentication
apiV1Router.use("/user-chats", authMiddleware, userChatsRoutes);

// Save chat messages to MongoDB with enhanced validation
apiV1Router.post(
  "/chats",
  validateRateLimit,
  validateChatMessage(),
  handleValidationErrors,
  optionalAuthMiddleware,
  asyncErrorHandler(async (req, res) => {
    const { userId, text, role, chatId } = req.body;

    // Validate user authentication for protected operations
    if (!req.user) {
      return res.status(401).json(createErrorResponse(ERROR_CODES.AUTH_REQUIRED));
    }

    // Use the authenticated user's ID from the token
    const authenticatedUserId = req.user.id;
    if (userId && userId !== authenticatedUserId) {
      return res.status(403).json(createErrorResponse(ERROR_CODES.ACCESS_DENIED, "Access denied - user ID mismatch"));
    }

    // Find existing chat or create a new one
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId: authenticatedUserId });
      if (!chat) {
        return res.status(404).json(createErrorResponse(ERROR_CODES.CHAT_NOT_FOUND));
      }
      
      // Update the updatedAt timestamp for existing chat
      const currentDate = new Date();
      await UserChats.updateOne(
        { userId: authenticatedUserId, "chats._id": chatId },
        { $set: { "chats.$.updatedAt": currentDate } }
      );
    } else {
      chat = new Chat({ userId: authenticatedUserId, history: [] });
      await chat.save();

      // Create or update userChats document
      let userChats = await UserChats.findOne({ userId: authenticatedUserId });
      
      const chatCount = userChats ? userChats.chats.length : 0;
      const nextChatNumber = chatCount + 1;
      const chatTitle = req.body.title && req.body.title.trim() ? req.body.title.trim() : `Chat ${nextChatNumber}`;
      
      const currentDate = new Date();
      if (!userChats) {
        userChats = new UserChats({
          userId: authenticatedUserId,
          chats: [{
            _id: chat._id.toString(),
            title: chatTitle,
            createdAt: currentDate,
            updatedAt: currentDate
          }]
        });
      } else {
        userChats.chats.push({
          _id: chat._id.toString(),
          title: chatTitle,
          createdAt: currentDate,
          updatedAt: currentDate
        });
      }
      
      await userChats.save();
    }

    // Add message to chat history
    chat.history.push({
      role: role || ROLE_USER,
      parts: [{ text }],
    });

    await chat.save();

    logger.info(`Chat message saved for user: ${authenticatedUserId}, chat: ${chat._id}`);
    res.status(200).json({ message: "Message saved", chat });
  })
);

// Fetch chat history for a user with pagination
apiV1Router.get("/chats/:userId/:chatId", authMiddleware, asyncErrorHandler(async (req, res) => {
  const { userId, chatId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  // Verify user can access this chat
  if (req.user.id !== userId) {
    return res.status(403).json(createErrorResponse(ERROR_CODES.ACCESS_DENIED));
  }
  
  const chat = await Chat.findOne({ _id: chatId, userId });

  if (!chat) {
    return res.status(404).json(createErrorResponse(ERROR_CODES.CHAT_NOT_FOUND, "No chat history found"));
  }

  // Calculate pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  const totalMessages = chat.history.length;
  const totalPages = Math.ceil(totalMessages / limitNum);

  // Get paginated messages (most recent first)
  const paginatedHistory = chat.history
    .slice()
    .reverse() // Reverse to get most recent first
    .slice(skip, skip + limitNum)
    .reverse(); // Reverse back to maintain chronological order

  res.status(200).json({ 
    chat: {
      ...chat.toObject(),
      history: paginatedHistory
    },
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalMessages,
      hasMore: pageNum < totalPages,
      hasPrevious: pageNum > 1
    }
  });
}));

// Fetch user's chat list
apiV1Router.get("/user-chats/:userId", authMiddleware, asyncErrorHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Verify user can access their own chats
  if (req.user.id !== userId) {
    return res.status(403).json(createErrorResponse(ERROR_CODES.ACCESS_DENIED));
  }
  
  const userChats = await UserChats.findOne({ userId });

  if (!userChats) {
    return res.status(404).json(createErrorResponse(ERROR_CODES.USER_CHATS_NOT_FOUND));
  }

  res.status(200).json({ userChats });
}));

// Mount API v1 routes
app.use("/api/v1", apiV1Router);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || "1.0.0"
  });
});

// 404 handler for undefined routes
app.use("*", (req, res) => {
  logger.warn(`404 - Route not found: ${req.originalUrl}`);
  res.status(404).json(createErrorResponse(ERROR_CODES.ROUTE_NOT_FOUND));
});

// Centralized error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`API available at: http://localhost:${config.port}/api/v1`);
});
