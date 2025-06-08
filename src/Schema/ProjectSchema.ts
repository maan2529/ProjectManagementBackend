// import mongoose,{Schema} from "mongoose";
// import { IProject } from "../types/projectType";

// const ProjectSchema = new Schema<IProject>(
//     {
//         title: { type: String, required: true },
//         description: { type: String, required: true },
//         domain: { type: String, required: true },
//         groupID: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectGroup" },
//         guideID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         coordinatorID: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
//         files: { type: [String], default: [] },
//     },
//     { timestamps: true }
// );
// export default ProjectSchema;



import mongoose,{Schema} from "mongoose";
import { IProject } from "../types/projectType";


export enum DocumentType {
    REVIEW1 = "review1",
    REVIEW2 = "review2",
    PROPOSAL = "proposal",
    FINAL_REPORT = "final_report",
    PRESENTATION = "presentation"
  }

export enum FileStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}

interface IFile {
    _id: mongoose.Types.ObjectId;
    type: DocumentType;
    path: string;
    uploadedAt: Date;
    status: FileStatus;
    feedback?: string;
    feedbackBy?: mongoose.Types.ObjectId;
    feedbackDate?: Date;
}

const ProjectSchema = new Schema<IProject>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        domain: { type: String, required: true },
        groupID: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectGroup" },
        guideID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        coordinatorID: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
        files: [{
            type: {
                type: String,
                enum: Object.values(DocumentType),
                required: true
            },
            path: {
                type: String,
                required: true
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: Object.values(FileStatus),
                default: FileStatus.PENDING,
                required: true
            },
            feedback: {
                type: String,
                default: ""
            },
            feedbackBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            feedbackDate: {
                type: Date
            }
        }]
    },
    { timestamps: true }
);

export default ProjectSchema;
