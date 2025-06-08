import mongoose from "mongoose";

import { IMessage } from "../types/meassageType";
import MessageSchema from "../Schema/MeassageSchema";

import { model } from "mongoose";

const messageModel = model<IMessage>("Message", MessageSchema);
export default messageModel;