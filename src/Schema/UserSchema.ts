import mongoose,{ Schema } from 'mongoose';
import { IUser } from '../types/userType';



const UserSchema = new Schema<IUser>({
    userName: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['student', 'guide', 'coordinator'],
        required: true
    },
    mobileNumber: { type: String },
    college: { type: String, required: true },
    department: { type: String, required: true },
    roll_no: {
        type: String,
        required: function () { return this.role === 'student'; }
    },
    prn: { type: String, required: function () { return this.role === 'student'; } },
    division: { type: String, required: function () { return this.role === 'student'; } },
    facultyID: {
        type: String,
        required: function () { return this.role === 'guide' || this.role === 'coordinator'; }
    },
    domain: { type: String, required: function () { return this.role === 'guide'; } },
    groupID : { type: mongoose.Schema.Types.ObjectId, ref: "ProjectGroup" },
    guideID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    coordinatorID: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    otp: { type: Number, required: false }, // OTP for verification
    otpExpiry: { type: Date }, // OTP expiry date/time
    isVerified: { type: Boolean, default: false, required: false }, // Verification status
    createdAt: { type: Date, default: Date.now },
    passwordResetToken: { type: String, required: false },
    passwordResetExpires: { type: Date, required: false },
    isDeleted: { type: Boolean, default: false, required: false },

}, { timestamps: true });

export default UserSchema;