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
const userModel_1 = __importDefault(require("../models/userModel"));
const userModel_2 = __importDefault(require("../models/userModel"));
const express_validator_1 = require("express-validator");
const http_status_1 = __importDefault(require("http-status"));
const passwordUtil_1 = require("../utils/passwordUtil");
const otpGenerationUtil_1 = require("../utils/otpGenerationUtil");
const sendEmailUtil_1 = __importDefault(require("../utils/sendEmailUtil"));
const tokenUtil_1 = require("../utils/tokenUtil"); // Assumes you have a utility to verify the JWT
const randomUsername_1 = __importDefault(require("../utils/randomUsername"));
const RegisterUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log({ errors });
            return res.status(http_status_1.default.BAD_REQUEST).json({ errors: errors.array() });
        }
        const { name, email, password, role, mobileNumber, college, department, roll_no, prn, division, facultyID, domain, } = req.body;
        const userName = yield (0, randomUsername_1.default)(email);
        // Check if user already exists
        const existingUser = yield userModel_1.default.findOne({ email });
        if (existingUser) {
            if (existingUser.isDeleted) {
                return res.status(http_status_1.default.CONFLICT).json({
                    message: 'Your account has been deleted. Try after some time.',
                    code: http_status_1.default.CONFLICT,
                });
            }
            return res.status(409).json({
                message: 'Username or Email already exists',
                code: 409,
            });
        }
        // Hash the password
        const hashedPassword = yield (0, passwordUtil_1.hashPassword)(password);
        const otp = (0, otpGenerationUtil_1.generateOTP)();
        const mailOption = {
            toEmail: email,
            subject: 'Account Verification OTP',
            otp
        };
        yield (0, sendEmailUtil_1.default)(mailOption);
        const otpExpiry = (0, otpGenerationUtil_1.getExpiryTime)(); // OTP valid for 5 minutes
        let coordinator;
        if (role != "coordinator") {
            coordinator = yield userModel_2.default.findOne({ role: "coordinator" });
        }
        // Create new user
        const newUser = new userModel_2.default({
            userName: userName,
            name,
            email,
            password: hashedPassword,
            role,
            mobileNumber,
            college,
            department,
            otp,
            otpExpiry,
            roll_no,
            prn,
            division,
            facultyID,
            domain,
            coordinatorID: coordinator === null || coordinator === void 0 ? void 0 : coordinator._id
        });
        yield newUser.save();
        const saved_user = yield userModel_2.default.findOne({ email: email });
        const token = (0, tokenUtil_1.generateToken)(saved_user === null || saved_user === void 0 ? void 0 : saved_user._id, saved_user === null || saved_user === void 0 ? void 0 : saved_user.userName, saved_user === null || saved_user === void 0 ? void 0 : saved_user.role);
        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000, // expires in 15 minutes
            httpOnly: true, // prevents client-side JavaScript access
            sameSite: 'none',
            secure: true, // only send cookies over HTTPScure:fale
        });
        if (!saved_user) {
            return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to register user.',
            });
        }
        console.log(saved_user === null || saved_user === void 0 ? void 0 : saved_user._id);
        return res.status(http_status_1.default.CREATED).json({
            message: 'Registration successful.',
            userId: saved_user._id,
            token,
            groupID: saved_user === null || saved_user === void 0 ? void 0 : saved_user.groupID,
        });
    }
    catch (error) {
        console.error('Register:', error.message);
        return res.status(500).json({
            message: 'Internal Server Error',
            code: 500,
        });
    }
});
const LoginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request data
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res
                .status(http_status_1.default.BAD_REQUEST)
                .json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        // Find the user by username
        const user = yield userModel_2.default.findOne({ email });
        if (!user) {
            return res.status(http_status_1.default.UNAUTHORIZED).json({
                message: 'Invalid username or password',
                code: http_status_1.default.UNAUTHORIZED,
            });
        }
        if (!user.isVerified) {
            const otp = (0, otpGenerationUtil_1.generateOTP)();
            const mailOption = {
                toEmail: email,
                subject: 'Account Verification OTP',
                otp
            };
            yield (0, sendEmailUtil_1.default)(mailOption);
            const otpExpiry = (0, otpGenerationUtil_1.getExpiryTime)(); // OTP valid for 5 minutes
            yield userModel_2.default.updateOne({ email }, { $set: { otp, otpExpiry } });
            return res.status(http_status_1.default.OK).json({
                message: 'User not verified',
                isVerified: false,
                code: http_status_1.default.OK,
            });
        }
        // Compare provided password with the stored hashed password
        const isMatch = yield (0, passwordUtil_1.comparePassword)(password, user.password);
        if (!isMatch) {
            return res.status(http_status_1.default.UNAUTHORIZED).json({
                message: 'Invalid username or password',
                code: http_status_1.default.UNAUTHORIZED,
            });
        }
        const token = (0, tokenUtil_1.generateToken)(user._id, user.username, user.role);
        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000, // expires in 15 minutes
            httpOnly: true, // prevents client-side JavaScript access
            sameSite: 'none',
            secure: true, // only send cookies over HTTPScure:fale
        });
        // res.setHeader('token',token);
        if (user === null || user === void 0 ? void 0 : user.role) {
            res.cookie('role', user === null || user === void 0 ? void 0 : user.role, {
                maxAge: 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'none',
                secure: true,
            });
            return res.status(http_status_1.default.OK).json({
                message: 'Login successful',
                token,
                isVerified: true,
                isRole: true,
                role: user === null || user === void 0 ? void 0 : user.role,
                groupId: user.groupID,
                userId: user._id
            });
        }
    }
    catch (error) {
        console.error('Login:', error.message);
        return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
            message: error.message,
            code: http_status_1.default.INTERNAL_SERVER_ERROR,
        });
    }
});
const VerifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        // Find the user by email
        const user = yield userModel_2.default.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                code: 404,
            });
        }
        const currentTime = new Date();
        if (!user.otpExpiry || currentTime > user.otpExpiry) {
            return res.status(410).json({
                message: 'OTP has expired',
                code: 410,
            });
        }
        // Check if the OTP matches
        const storedOtp = user.otp ? user.otp.toString() : null;
        if (storedOtp !== otp) {
            return res.status(400).json({
                message: 'Invalid OTP',
                code: 400,
            });
        }
        // OTP is valid and not expired, update isVerified field
        user.isVerified = true;
        yield user.save(); // Save the updated user document
        if ((user === null || user === void 0 ? void 0 : user.role) == undefined) {
            return res.status(200).json({
                message: 'OTP verified successfully',
                isRole: false,
                code: 200,
            });
        }
        // OTP is valid and not expired
        return res.status(200).json({
            message: 'OTP verified successfully',
            isRole: true,
            code: 200,
            userRole: user.role,
        });
    }
    catch (error) {
        console.error('Error verifying OTP:', error.message);
        return res.status(500).json({
            message: 'Internal Server Error',
            code: 500,
        });
    }
});
const ResendOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request data
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res
                .status(http_status_1.default.BAD_REQUEST)
                .json({ errors: errors.array() });
        }
        const { email } = req.body;
        // Check if the user exists
        const user = yield userModel_2.default.findOne({ email });
        if (!user) {
            return res.status(http_status_1.default.NOT_FOUND).json({
                message: 'User not found',
                code: http_status_1.default.NOT_FOUND,
            });
        }
        // Generate a new OTP and send via email
        const otp = (0, otpGenerationUtil_1.generateOTP)();
        const mailOption = {
            toEmail: email,
            subject: 'Resend Account Verification OTP',
            otp
        };
        yield (0, sendEmailUtil_1.default)(mailOption);
        const otpExpiry = (0, otpGenerationUtil_1.getExpiryTime)(); // OTP valid for 5 minutes
        yield userModel_2.default.updateOne({ email }, { $set: { otp, otpExpiry } });
        return res.status(200).json({
            message: 'OTP sent successfully',
            code: 200,
        });
    }
    catch (error) {
        console.error('Resend OTP:', error.message);
        return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
            message: error.message,
            code: http_status_1.default.INTERNAL_SERVER_ERROR,
        });
    }
});
const getUserDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        return res
            .status(http_status_1.default.OK)
            .json({ message: 'User data fetched successfully!', data: user });
    }
    catch (error) {
        console.error('Error while Fetching details:', error.message);
        return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
            message: error.message,
            code: http_status_1.default.INTERNAL_SERVER_ERROR,
        });
    }
});
/* UpdateInstituteId ------- */
// const UpdateInstituteId = async (req: Request, res: Response) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res
//         .status(httpStatus.BAD_REQUEST)
//         .json({ errors: errors.array() });
//     }
//     const { instituteId } = req.params;
//     const userId = req.user._id;
//     console.log(req.user);
//     const instituteObjectId = new ObjectId(instituteId);
//     const existingUser = await userModel.findOne({ _id: userId });
//     if (existingUser) {
//       if (existingUser.institute) {
//         return res.status(409).json({
//           message: 'You are already joined to institute',
//           code: 409,
//         });
//       }
//     }
//     const updatedUser = await userModel.findOneAndUpdate(
//       { _id: userId },
//       { $set: { institute: instituteObjectId } },
//       { new: true },
//     );
//     return res.status(201).json({
//       message: 'User updated successfully',
//       user: updatedUser,
//       code: 201,
//     });
//   } catch (error: any) {
//     console.error('Error in ProfileUser:', error.message);
//     return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//       message: 'An error occurred while processing your request.',
//       code: httpStatus.INTERNAL_SERVER_ERROR,
//     });
//   }
// };
// user update api
const UpdateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Extract the user ID from the user object
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                message: 'User ID not found.',
                code: http_status_1.default.BAD_REQUEST,
            });
        }
        // Use findById to get the user object
        const findUser = yield userModel_2.default.findById(userId);
        if (!findUser) {
            return res.status(http_status_1.default.NOT_FOUND).json({
                message: 'User not found.',
                code: http_status_1.default.NOT_FOUND,
            });
        }
        // Extract the fields you want to update from the request body
        const updateData = req.body;
        // Update the user with the new data
        const updatedUser = yield userModel_2.default.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
        // Check if the update was successful
        if (!updatedUser) {
            return res.status(http_status_1.default.NOT_FOUND).json({
                message: 'User not found.',
                code: http_status_1.default.NOT_FOUND,
            });
        }
        return res.status(http_status_1.default.OK).json({
            message: 'User information updated successfully',
            updatedUser,
        });
    }
    catch (error) {
        console.error('Error updating user:', error.message);
        return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
            message: 'An error occurred while processing your request.',
            code: http_status_1.default.INTERNAL_SERVER_ERROR,
        });
    }
});
//Update password api
const UpdatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.user.email;
        console.log(email);
        const { newPassword } = req.body;
        const user = yield userModel_2.default.findOne({ email });
        if (!user) {
            return res.status(http_status_1.default.NOT_FOUND).json({
                message: 'User not found',
                code: http_status_1.default.NOT_FOUND,
            });
        }
        const newHashedPassword = yield (0, passwordUtil_1.hashPassword)(newPassword);
        user.password = newHashedPassword;
        yield user.save();
        return res.status(http_status_1.default.OK).json({
            message: 'Password updated successfully',
            user,
        });
    }
    catch (error) {
        console.error('Error in changePassword:', error);
        return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
            message: error.message, code: http_status_1.default.INTERNAL_SERVER_ERROR,
        });
    }
});
//verify password
const VerifyPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.user.email;
        const { currentPassword } = req.body;
        const user = yield userModel_2.default.findOne({ email });
        if (!user) {
            return res.status(http_status_1.default.NOT_FOUND).json({
                message: 'User not found',
                code: http_status_1.default.NOT_FOUND,
            });
        }
        // Compare provided password with stored hashed password
        const isMatch = yield (0, passwordUtil_1.comparePassword)(currentPassword, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Incorrect current password' });
            return;
        }
        return res.status(http_status_1.default.OK).json({
            message: 'Password verified successfully',
            user,
        });
    }
    catch (error) {
        console.error('Error in changePassword:', error);
        return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
            message: error.message,
            code: http_status_1.default.INTERNAL_SERVER_ERROR,
        });
    }
});
/* getProfileDetail ------- */
const getProfileDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request data
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res
                .status(http_status_1.default.BAD_REQUEST)
                .json({ errors: errors.array() });
        }
        const { email } = req.body;
        // Find the user by email
        const user = yield userModel_2.default.findOne({ email });
        if (!user) {
            return res.status(http_status_1.default.NOT_FOUND).json({
                message: 'User not found',
                code: http_status_1.default.NOT_FOUND,
            });
        }
        // Return success response with user data
        return res.status(http_status_1.default.OK).json({
            message: 'User found',
            user,
        });
    }
    catch (error) {
        console.error('Error fetching user:', error.message);
        return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
            message: error.message,
            code: http_status_1.default.INTERNAL_SERVER_ERROR,
        });
    }
});
//forget password
const forgotPasswordOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.user.email;
        const user = yield userModel_2.default.findOne({ email });
        if (!user) {
            return res.status(http_status_1.default.NOT_FOUND).json({
                message: 'User not found',
                code: http_status_1.default.NOT_FOUND,
            });
        }
        const otp = (0, otpGenerationUtil_1.generateOTP)();
        const otpExpiry = (0, otpGenerationUtil_1.getExpiryTime)();
        const mailOption = {
            toEmail: email,
            subject: 'Account Verification OTP',
            otp
        };
        yield (0, sendEmailUtil_1.default)(mailOption);
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        yield user.save();
        return res.status(200).json({
            message: 'OTP send successfully',
            isRole: true,
            code: 200,
        });
    }
    catch (error) {
        console.error('send OTP:', error.message);
        return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
            message: error.message,
            code: http_status_1.default.INTERNAL_SERVER_ERROR,
        });
    }
});
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id; // Extract user ID from request parameters
        // Find the user by ID
        const user = yield userModel_2.default.findById(userId).select('-password');
        if (!user) {
            return res.status(http_status_1.default.NOT_FOUND).json({
                message: 'User not found',
                code: http_status_1.default.NOT_FOUND,
            });
        }
        // Return success response with user data
        return res
            .status(http_status_1.default.OK)
            .json({ message: 'User data fetched successfully!', data: user });
    }
    catch (error) {
        console.error('Error while Fetching details:', error.message);
        return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
            message: error.message,
            code: http_status_1.default.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.default = {
    RegisterUser,
    LoginUser,
    VerifyOTP,
    ResendOTP,
    getProfileDetail,
    UpdatePassword,
    UpdateUser,
    VerifyPassword,
    forgotPasswordOTP,
    getUserDetail,
    getUserById
};
