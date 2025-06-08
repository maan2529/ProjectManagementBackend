import mongoose, { Document } from "mongoose";

export interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;
    receiver?: mongoose.Types.ObjectId;
    chat: mongoose.Types.ObjectId;
    
}
