import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
chatName: { type: String, required: true },
isGroupChat: { type: Boolean, default: false },
GroupID: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectGroup" },
users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

}, { timestamps: true });


export default chatSchema;