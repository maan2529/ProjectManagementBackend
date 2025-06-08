"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatController_1 = __importDefault(require("../Controllers/chatController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Get all group chats
router.get("/groups", authMiddleware_1.Authentication, chatController_1.default.getGroupChat);
// Create a new group chat
router.post("/group", authMiddleware_1.Authentication, chatController_1.default.creteGroupChat);
// Get all messages for a specific chat
router.get("/messages/:chatId", authMiddleware_1.Authentication, chatController_1.default.getAllMessages);
exports.default = router;
