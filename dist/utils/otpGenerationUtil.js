"use strict";
// otpGenerationUtil.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpiryTime = exports.generateOTP = void 0;
/**
 * Generates a random 6-digit OTP.
 * @returns {number} The generated OTP.
 */
const generateOTP = () => {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000);
};
exports.generateOTP = generateOTP;
/**
 * Calculates the expiry time for the OTP.
 * @param {number} minutes - Number of minutes the OTP should be valid for.
 * @returns {Date} The expiry time.
 */
const getExpiryTime = (minutes = 5) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now;
};
exports.getExpiryTime = getExpiryTime;
