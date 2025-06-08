
import transporter from '../config/nodeConfig'; // Update the import path to the correct one
import { SendMailOptions, SentMessageInfo } from 'nodemailer';

interface SendEmailOptions {
    toEmail: string;
    subject: string;
    otp:number;
}


// Async function to send email
const sendEmail = async ({
    toEmail,
    subject,
    otp

}: SendEmailOptions): Promise<void> => {
    const mailOptions: SendMailOptions = {
        // from: '"SmakTech" <noreply@smaktech.com>',
        from: `<${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: subject,
        text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
        html: `<p>Your OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`,

    };

    try {
        const message: SentMessageInfo = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', message);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export default sendEmail;
