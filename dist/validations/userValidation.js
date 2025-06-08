"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const registerValidate = joi_1.default.object({
    userName: joi_1.default.string().min(3).max(30),
    name: joi_1.default.string().min(3).max(100).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).max(255).required(),
    role: joi_1.default.string().valid('student', 'guide', 'coordinator').required(),
    mobileNumber: joi_1.default.string().optional(),
    college: joi_1.default.string().min(3).max(100).required(),
    department: joi_1.default.string().min(3).max(100).required(),
    // Conditional validations based on role
    roll_no: joi_1.default.string().when('role', {
        is: 'student',
        then: joi_1.default.string().required(),
        otherwise: joi_1.default.optional()
    }),
    prn: joi_1.default.string().when('role', {
        is: 'student',
        then: joi_1.default.string().required(),
        otherwise: joi_1.default.optional()
    }),
    division: joi_1.default.string().when('role', {
        is: 'student',
        then: joi_1.default.string().required(),
        otherwise: joi_1.default.optional()
    }),
    facultyID: joi_1.default.string().when('role', {
        is: joi_1.default.valid('guide', 'coordinator'),
        then: joi_1.default.string().required(),
        otherwise: joi_1.default.optional()
    }),
    domain: joi_1.default.string().when('role', {
        is: 'guide',
        then: joi_1.default.string().required(),
        otherwise: joi_1.default.optional()
    }),
    otp: joi_1.default.number().optional(),
    otpExpiry: joi_1.default.date().optional(),
    isVerified: joi_1.default.boolean().optional(),
    passwordResetToken: joi_1.default.string().optional(),
    passwordResetExpires: joi_1.default.date().optional(),
    isDeleted: joi_1.default.boolean().default(false),
});
const loginValidation = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
exports.default = {
    registerValidate,
    loginValidation
};
