import express from "express";
import UserChats from "../models/userChats.js";
import Chat from "../models/chat.js";
import { body, param, validationResult } from "express-validator";

const router = express.Router();

// Remove a chat from userchats collection
router.delete(
  "/:userId/remove-chat",
  [
    param("userId").isString().notEmpty().withMessage("userId is required"),
    // chatId will be sent as a query parameter
    (req, res, next) => {
      if (!req.query.chatId || typeof req.query.chatId !== 'string') {
        return res.status(400).json({ errors: [{ msg: "chatId is required as a query parameter" }] });
      }
      next();
    }
  ],
  async (req, res) => {
    try {
      const { userId } = req.params;
      const chatId = req.query.chatId;

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

      res.json({ message: "Chat removed successfully" });
    } catch (error) {
      console.error("Error removing chat:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// **Update chat title**
router.put(
  "/:userId/update-chat-title",
  [
    param("userId").isString().notEmpty().withMessage("userId is required"),
    body("chatId").isString().notEmpty().withMessage("chatId is required"),
    body("newTitle").isString().notEmpty().withMessage("newTitle is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { userId } = req.params;
      const { chatId, newTitle } = req.body;

      const userChats = await UserChats.findOne({ userId });

      if (!userChats) {
        return res.status(404).json({ error: "User chats not found" });
      }

      const chat = userChats.chats.find(c => c._id.toString() === chatId);

      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      chat.title = newTitle;
      await userChats.save();

      res.status(200).json({ message: "Chat title updated", chat });
    } catch (error) {
      console.error("Error updating chat title:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
