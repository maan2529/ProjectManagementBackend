import mongoose, { Document } from "mongoose";
import { DocumentType, FileStatus } from "../Schema/ProjectSchema";

export interface IFile {
    type: DocumentType;
    path: string;
    uploadedAt: Date;
    status: FileStatus;
    feedback?: string;
    feedbackBy?: mongoose.Types.ObjectId;
    feedbackDate?: Date;
}

export interface IProject extends Document {
    title: string;
    description: string;
    domain: string;
    groupID?: mongoose.Types.ObjectId;
    guideID?: mongoose.Types.ObjectId;
    coordinatorID?: mongoose.Types.ObjectId;
    files: IFile[];
}
