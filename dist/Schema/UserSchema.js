"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
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
    groupID: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "ProjectGroup" },
    guideID: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    coordinatorID: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    otp: { type: Number, required: false }, // OTP for verification
    otpExpiry: { type: Date }, // OTP expiry date/time
    isVerified: { type: Boolean, default: false, required: false }, // Verification status
    createdAt: { type: Date, default: Date.now },
    passwordResetToken: { type: String, required: false },
    passwordResetExpires: { type: Date, required: false },
    isDeleted: { type: Boolean, default: false, required: false },
}, { timestamps: true });
exports.default = UserSchema;
