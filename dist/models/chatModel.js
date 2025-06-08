"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChatSchema_1 = __importDefault(require("../Schema/ChatSchema"));
const mongoose_1 = require("mongoose");
const chatModel = (0, mongoose_1.model)("Chat", ChatSchema_1.default);
exports.default = chatModel;
