import { model } from "mongoose";
import { IProject } from "../types/projectType";
import ProjectSchema from "../Schema/ProjectSchema";


const projectModel = model<IProject>("Project", ProjectSchema);
export default projectModel; 