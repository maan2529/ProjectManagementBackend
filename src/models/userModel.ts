import { model } from "mongoose";
import UserSchema from "../Schema/UserSchema";
import { IUser } from "../types/userType";


const userModel = model<IUser>("User", UserSchema);
export default userModel; 