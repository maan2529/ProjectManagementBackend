import mongoose,{Schema} from "mongoose";
import { IProjectGroup } from "../types/projectGroupType";

const ProjectGroupSchema = new Schema <IProjectGroup>({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    projectID: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    guideID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    coordinatorID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default ProjectGroupSchema;

