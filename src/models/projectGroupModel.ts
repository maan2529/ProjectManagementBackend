
import { IProjectGroup } from "../types/projectGroupType";
import { model } from "mongoose";
import ProjectGroupSchema from "../Schema/PeojectGroupSchema";



const projectGroupModel = model<IProjectGroup>("ProjectGroup", ProjectGroupSchema);
export default projectGroupModel; 