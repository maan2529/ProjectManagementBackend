"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodeConfig_1 = __importDefault(require("../config/nodeConfig")); // Update the import path to the correct one
// Async function to send email
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ toEmail, subject, otp }) {
    const mailOptions = {
        // from: '"SmakTech" <noreply@smaktech.com>',
        from: `<${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: subject,
        text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
        html: `<p>Your OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`,
    };
    try {
        const message = yield nodeConfig_1.default.sendMail(mailOptions);
        console.log('Email sent successfully:', message);
    }
    catch (error) {
        console.error('Error sending email:', error);
    }
});
exports.default = sendEmail;
