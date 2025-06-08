import express from "express";
import chatController from "../Controllers/chatController";
import { Authentication } from '../middleware/authMiddleware';


const router = express.Router();

// Get all group chats
router.get("/groups", Authentication, chatController.getGroupChat);

// Create a new group chat
router.post("/group", Authentication, chatController.creteGroupChat);

// Get all messages for a specific chat
router.get("/messages/:chatId", Authentication, chatController.getAllMessages);

export default router; 