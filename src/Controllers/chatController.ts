import mongoose from "mongoose";
import chatModel from "../models/chatModel";
import messageModel from "../models/messageModel";
import { Request, Response } from "express";
import projectGroupModel from "../models/projectGroupModel";

const getGroupChat = async (req: Request, res: Response) => {
  try {
    const groupChat = await chatModel
      .find({ isGroupChat: true })
      .populate("GroupID")
      .populate("lastMessage");

    return res.status(200).json({
      success: true,
      message: "Group chats retrieved successfully",
      data: groupChat,
    });
  } catch (error) {
    console.error("Error in getGroupChat: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
}

const creteGroupChat = async (req: Request, res: Response) => {
    try {
        const { GroupID } = req.body;

        // Check if group exists
        const group = await projectGroupModel.findById(GroupID);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Project group not found"
            });
        }

        // Create chat for the group
        const groupChat = await chatModel.create({
            chatName: group.name, // Use group name as chat name
            GroupID: GroupID,
            isGroupChat: true,
            groupAdmin: req.user._id,
        });

        const fullGroupChat = await chatModel
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
            error: (error as Error).message,
        });
    }
}

// New function to fetch all messages for a specific chat
const getAllMessages = async (req: Request, res: Response) => {
    try {
        const { chatId } = req.params;

        // Validate chatId
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID"
            });
        }

        // Check if chat exists
        const chat = await chatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // Fetch all messages for the chat
        const messages = await messageModel
            .find({ chat: chatId })
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate("sender", "name email") // Populate sender details
            .populate("receiver", "name email"); // Populate receiver details if any

        return res.status(200).json({
            success: true,
            message: "Messages retrieved successfully",
            data: messages
        });
    } catch (error) {
        console.error("Error in getAllMessages: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: (error as Error).message
        });
    }
}

export default {
    getGroupChat,
    creteGroupChat,
    getAllMessages
};
