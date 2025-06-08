import mongoose,{Document} from "mongoose";

export interface IChat extends Document {
    chatName: string;
    GroupID: mongoose.Types.ObjectId;
    isGroupChat: boolean;
    users: mongoose.Types.ObjectId[];
    lastMessage: string;
    groupAdmin: mongoose.Types.ObjectId;
}