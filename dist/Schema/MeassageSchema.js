"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MessageSchema = new mongoose_1.default.Schema({
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    chat: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Chat", required: true },
    content: { type: String, required: true },
}, { timestamps: true });
exports.default = MessageSchema;
