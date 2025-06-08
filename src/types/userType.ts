import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    userName: string;
    name: string;
    email: string;
    password: string;
    role: 'student' | 'guide' | 'coordinator'; // Enum for role
    mobileNumber?: string;
    college?: string;
    department: string;
    prn: string;
    roll_no: string;
    division: string;
    facultyID: String,
    domain: String
    otp?: number;
    otpExpiry?: Date;
    isVerified: boolean;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createdAt: Date;
    isDeleted: boolean;
    groupID?: mongoose.Types.ObjectId;
    guideID?: mongoose.Types.ObjectId;
    coordinatorID?: mongoose.Types.ObjectId;

}


