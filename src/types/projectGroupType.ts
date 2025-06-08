import mongoose, { Document } from "mongoose";

export interface IProjectGroup extends Document {
    name: string;
    members: mongoose.Types.ObjectId[];
    projectID?: mongoose.Types.ObjectId;
    guideID?: mongoose.Types.ObjectId;
    coordinatorID?: mongoose.Types.ObjectId;
    created_by : mongoose.Types.ObjectId;
}