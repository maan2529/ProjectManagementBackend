"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Define types for environment variables (assuming they are strings)
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
// Validate environment variables
if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Missing required environment variables for email configuration');
}
// Create transporter with defined type
const transporter = nodemailer_1.default.createTransport({
    host: EMAIL_HOST,
    secure: true, // Use SSL/TLS
    port: 465,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});
// Optional: Verify connection configuration with defined types for callback
transporter.verify((error, success) => {
    if (error) {
        console.error('Error with email transporter configuration:', error);
    }
    else {
        console.log('Email transporter is configured correctly:', success);
    }
});
exports.default = transporter;
