"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MeassageSchema_1 = __importDefault(require("../Schema/MeassageSchema"));
const mongoose_1 = require("mongoose");
const messageModel = (0, mongoose_1.model)("Message", MeassageSchema_1.default);
exports.default = messageModel;
