// otpGenerationUtil.ts

/**
 * Generates a random 6-digit OTP.
 * @returns {number} The generated OTP.
 */
export const generateOTP = (): number => {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000);
};

/**
 * Calculates the expiry time for the OTP.
 * @param {number} minutes - Number of minutes the OTP should be valid for.
 * @returns {Date} The expiry time.
 */
export const getExpiryTime = (minutes: number = 5): Date => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now;
};
