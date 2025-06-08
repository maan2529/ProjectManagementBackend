import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Define types for environment variables (assuming they are strings)
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_USER= process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Validate environment variables
if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
  throw new Error(
    'Missing required environment variables for email configuration',
  );
}

// Create transporter with defined type
const transporter: Transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  secure: true, // Use SSL/TLS
  port: 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Optional: Verify connection configuration with defined types for callback
transporter.verify((error: Error | null, success: boolean) => {
  if (error) {
    console.error('Error with email transporter configuration:', error);
  } else {
    console.log('Email transporter is configured correctly:', success);
  }
});

export default transporter;