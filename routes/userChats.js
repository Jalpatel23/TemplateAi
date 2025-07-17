import express from "express";
import UserChats from "../models/userChats.js";
import Chat from "../models/chat.js";
import { validateUserId, validateChatId, handleValidationErrors } from "../middleware/validation.js";
import logger from "../utils/logger.js";

const router = express.Router();

// Remove a chat from userchats collection
router.delete(
  "/:userId/remove-chat",
  [
    validateUserId(),
    // chatId will be sent as a query parameter
    (req, res, next) => {
      if (!req.query.chatId || typeof req.query.chatId !== 'string') {
        return res.status(400).json({ 
          error: "chatId is required as a query parameter",
          code: "MISSING_CHAT_ID"
        });
      }
      next();
    }
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const chatId = req.query.chatId;

      // Verify user can access this chat
      if (req.user.id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // First delete the chat from the chat collection
      const chatDeleteResult = await Chat.deleteOne({ userId, _id: chatId });

      if (!chatDeleteResult.deletedCount) {
        return res.status(404).json({ error: "Chat not found in chat collection" });
      }

      // Then remove the chat from userchats collection
      const userChatsResult = await UserChats.updateOne(
        { userId },
        { $pull: { chats: { _id: chatId } } }
      );

      if (userChatsResult.modifiedCount === 0) {
        return res.status(404).json({ error: "Chat not found in userchats" });
      }

      logger.info(`Chat deleted for user: ${userId}, chat: ${chatId}`);
      res.json({ message: "Chat removed successfully" });
    } catch (error) {
      logger.error("Error removing chat:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update chat title
router.put(
  "/:userId/update-chat-title",
  [
    validateUserId(),
    (req, res, next) => {
      if (!req.body.chatId || typeof req.body.chatId !== 'string') {
        return res.status(400).json({ 
          error: "chatId is required",
          code: "MISSING_CHAT_ID"
        });
      }
      if (!req.body.newTitle || typeof req.body.newTitle !== 'string' || req.body.newTitle.trim().length === 0) {
        return res.status(400).json({ 
          error: "newTitle is required and cannot be empty",
          code: "MISSING_TITLE"
        });
      }
      if (req.body.newTitle.length > 100) {
        return res.status(400).json({ 
          error: "Title must be less than 100 characters",
          code: "TITLE_TOO_LONG"
        });
      }
      next();
    }
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { chatId, newTitle } = req.body;

      // Verify user can access this chat
      if (req.user.id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const userChats = await UserChats.findOne({ userId });

      if (!userChats) {
        return res.status(404).json({ error: "User chats not found" });
      }

      const chat = userChats.chats.find(c => c._id.toString() === chatId);

      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      chat.title = newTitle.trim();
      await userChats.save();

      logger.info(`Chat title updated for user: ${userId}, chat: ${chatId}, new title: ${newTitle}`);
      res.status(200).json({ message: "Chat title updated", chat });
    } catch (error) {
      logger.error("Error updating chat title:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
