import mongoose from "mongoose";

import { IChat } from "../types/chatType";
import ChatSchema from "../Schema/ChatSchema";   
import { model } from "mongoose";

const chatModel = model<IChat>("Chat", ChatSchema);
export default chatModel;
