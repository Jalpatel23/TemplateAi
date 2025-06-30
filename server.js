import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import userChatsRoutes from "./routes/userChats.js";
import Chat, { ROLE_USER, ROLE_MODEL } from "./models/chat.js"; // Import Chat model and role constants
import UserChats from "./models/userChats.js"; // Import UserChats model
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";

dotenv.config();

// Environment variable validation
const requiredEnvVars = ['MONGO_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Set default port if not provided
const PORT = process.env.PORT || 8080;

connectDB();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - restrict to trusted origins
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'http://localhost:3000'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// More strict rate limiting for chat endpoints
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute for chat operations
  message: { error: 'Too many chat requests, please slow down.' },
});
app.use('/api/chats', chatLimiter);

// Middlewares
app.use(express.json());
app.use(morgan("dev"));

// API versioning - all routes under /api/v1
const apiV1Router = express.Router();

// Mount user chats routes
apiV1Router.use("/user-chats", userChatsRoutes);

// Save chat messages to MongoDB
apiV1Router.post(
  "/chats",
  [
    body("userId").isString().notEmpty().withMessage("userId is required"),
    body("text").isString().notEmpty().withMessage("text is required"),
    body("role").optional().isIn([ROLE_USER, ROLE_MODEL]).withMessage(`role must be '${ROLE_USER}' or '${ROLE_MODEL}'`),
    body("chatId").optional().isString(),
    body("title").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { userId, text, role, chatId } = req.body;

      // Find existing chat or create a new one
      let chat;
      if (chatId) {
        chat = await Chat.findOne({ _id: chatId, userId });
        if (!chat) {
          return res.status(404).json({ error: "Chat not found" });
        }
        // Update the updatedAt timestamp for existing chat
        const currentDate = new Date();
        await UserChats.updateOne(
          { userId, "chats._id": chatId },
          { $set: { "chats.$.updatedAt": currentDate } }
        );
      } else {
        chat = new Chat({ userId, history: [] });
        await chat.save();

        // Create or update userChats document
        let userChats = await UserChats.findOne({ userId });
        
        // Get the count of existing chats to determine the next number
        const chatCount = userChats ? userChats.chats.length : 0;
        const nextChatNumber = chatCount + 1;
        // Use provided title or fallback
        const chatTitle = req.body.title && req.body.title.trim() ? req.body.title.trim() : `Chat ${nextChatNumber}`;
        
        const currentDate = new Date();
        if (!userChats) {
          userChats = new UserChats({
            userId,
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

      res.status(200).json({ message: "Message saved", chat });
    } catch (error) {
      console.error("Error saving chat:", error);
      res.status(500).json({ error: "Internal server error" }); // Already generic, keep as is
    }
  }
);

// Fetch chat history for a user
apiV1Router.get("/chats/:userId/:chatId", async (req, res) => {
  try {
    const { userId, chatId } = req.params;
    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      return res.status(404).json({ error: "No chat history found" });
    }

    res.status(200).json({ chat });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Internal server error" }); // Already generic, keep as is
  }
});

// Fetch user's chat list
apiV1Router.get("/user-chats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userChats = await UserChats.findOne({ userId });

    if (!userChats) {
      return res.status(404).json({ error: "No chats found for user" });
    }

    res.status(200).json({ userChats });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ error: "Internal server error" }); // Already generic, keep as is
  }
});

// Mount API v1 routes
app.use("/api/v1", apiV1Router);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Centralized error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" }); // Already generic, keep as is
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API available at: http://localhost:${PORT}/api/v1`);
});
