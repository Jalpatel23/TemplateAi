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
import { upload, handleFileUploadError, validateUploadedFile, cleanupUploadedFile } from "./middleware/fileUpload.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Enhanced security middleware for production
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

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// CORS configuration for production
const corsOptions = {
  origin: config.nodeEnv === 'production' 
    ? ['https://your-domain.vercel.app', 'https://your-domain.vercel.app'] // Update with your actual domain
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Enhanced rate limiting for production
const limiter = rateLimit({
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
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(config.rateLimitWindowMs / 1000)
    });
  }
});

// More strict rate limiting for chat endpoints
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: config.chatRateLimitMaxRequests,
  message: { 
    error: 'Too many chat requests, please slow down.',
    code: 'CHAT_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  }
});

app.use('/api/', limiter);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: logger.stream }));

// Request logging middleware for security monitoring
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip} - User: ${req.user?.id || 'unauthenticated'}`);
  next();
});

// API versioning - all routes under /api/v1
const apiV1Router = express.Router();

// Security middleware to ensure all chat operations require authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: "Authentication required for all chat operations",
      code: "AUTH_REQUIRED"
    });
  }
  next();
};

// Mount user chats routes with authentication
apiV1Router.use("/user-chats", authMiddleware, userChatsRoutes);

// Save chat messages to MongoDB with enhanced validation
apiV1Router.post(
  "/chats",
  validateChatMessage(),
  handleValidationErrors,
  authMiddleware,
  requireAuth,
  chatLimiter,
  asyncErrorHandler(async (req, res) => {
    const { userId, text, role, chatId } = req.body;

    if (!req.user) {
      return res.status(401).json(createErrorResponse(ERROR_CODES.AUTH_REQUIRED));
    }

    const authenticatedUserId = req.user.id;
    if (userId && userId !== authenticatedUserId) {
      return res.status(403).json(createErrorResponse(ERROR_CODES.ACCESS_DENIED, "Access denied - user ID mismatch"));
    }

    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId: authenticatedUserId });
      if (!chat) {
        return res.status(404).json(createErrorResponse(ERROR_CODES.CHAT_NOT_FOUND));
      }
      
      const currentDate = new Date();
      await UserChats.updateOne(
        { userId: authenticatedUserId, "chats._id": chatId },
        { $set: { "chats.$.updatedAt": currentDate } }
      );
    } else {
      chat = new Chat({ userId: authenticatedUserId, history: [] });
      await chat.save();

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
apiV1Router.get("/chats/:userId/:chatId", authMiddleware, requireAuth, asyncErrorHandler(async (req, res) => {
  const { userId, chatId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  if (req.user.id !== userId) {
    return res.status(403).json(createErrorResponse(ERROR_CODES.ACCESS_DENIED));
  }
  
  const chat = await Chat.findOne({ _id: chatId, userId });

  if (!chat) {
    return res.status(404).json(createErrorResponse(ERROR_CODES.CHAT_NOT_FOUND, "No chat history found"));
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  const totalMessages = chat.history.length;
  const totalPages = Math.ceil(totalMessages / limitNum);

  const paginatedHistory = chat.history
    .slice()
    .reverse()
    .slice(skip, skip + limitNum)
    .reverse();

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
apiV1Router.get("/user-chats/:userId", authMiddleware, requireAuth, asyncErrorHandler(async (req, res) => {
  const { userId } = req.params;
  
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

// Serve static files in production
if (config.nodeEnv === 'production') {
  // Serve static files from the React build
  app.use(express.static(path.join(__dirname, 'front', 'build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'front', 'build', 'index.html'));
  });
}

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

// For Vercel, export the app
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`API available at: http://localhost:${config.port}/api/v1`);
  });
} 