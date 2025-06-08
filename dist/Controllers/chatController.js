"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const chatModel_1 = __importDefault(require("../models/chatModel"));
const messageModel_1 = __importDefault(require("../models/messageModel"));
const projectGroupModel_1 = __importDefault(require("../models/projectGroupModel"));
const getGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupChat = yield chatModel_1.default
            .find({ isGroupChat: true })
            .populate("GroupID")
            .populate("lastMessage");
        return res.status(200).json({
            success: true,
            message: "Group chats retrieved successfully",
            data: groupChat,
        });
    }
    catch (error) {
        console.error("Error in getGroupChat: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
const creteGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { GroupID } = req.body;
        // Check if group exists
        const group = yield projectGroupModel_1.default.findById(GroupID);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Project group not found"
            });
        }
        // Create chat for the group
        const groupChat = yield chatModel_1.default.create({
            chatName: group.name, // Use group name as chat name
            GroupID: GroupID,
            isGroupChat: true,
            groupAdmin: req.user._id,
        });
        const fullGroupChat = yield chatModel_1.default
            .findOne({ _id: groupChat._id })
            .populate("GroupID")
            .populate("groupAdmin", "-password")
            .populate("lastMessage");
        return res.status(200).json({
            success: true,
            message: "Group chat created successfully",
            data: fullGroupChat,
        });
    }
    catch (error) {
        console.error("Error in creteGroupChat: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// New function to fetch all messages for a specific chat
const getAllMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        // Validate chatId
        if (!mongoose_1.default.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID"
            });
        }
        // Check if chat exists
        const chat = yield chatModel_1.default.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }
        // Fetch all messages for the chat
        const messages = yield messageModel_1.default
            .find({ chat: chatId })
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate("sender", "name email") // Populate sender details
            .populate("receiver", "name email"); // Populate receiver details if any
        return res.status(200).json({
            success: true,
            message: "Messages retrieved successfully",
            data: messages
        });
    }
    catch (error) {
        console.error("Error in getAllMessages: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});
exports.default = {
    getGroupChat,
    creteGroupChat,
    getAllMessages
};
