"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const chatSchema = new mongoose_1.default.Schema({
    chatName: { type: String, required: true },
    isGroupChat: { type: Boolean, default: false },
    GroupID: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "ProjectGroup" },
    users: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Message" },
    groupAdmin: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
exports.default = chatSchema;
