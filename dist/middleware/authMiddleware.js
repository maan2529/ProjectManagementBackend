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
exports.Authentication = void 0;
const http_status_1 = __importDefault(require("http-status"));
const tokenUtil_1 = require("../utils/tokenUtil"); // Assumes you have a utility to verify the JWT
const userModel_1 = __importDefault(require("../models/userModel"));
const Authentication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(http_status_1.default.UNAUTHORIZED).json({
            message: 'Token not found.',
            code: http_status_1.default.UNAUTHORIZED,
        });
    }
    // Extract the token from the header
    let token;
    if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    else {
        token = authHeader;
    }
    console.log(token);
    if (!token) {
        return res.status(http_status_1.default.UNAUTHORIZED).json({
            message: 'Token not found.',
            code: http_status_1.default.UNAUTHORIZED,
        });
    }
    try {
        // Verify the token (assuming your verifyToken returns a JwtPayload or throws an error)
        const decoded = (0, tokenUtil_1.verifyToken)(token);
        if (decoded && decoded.id) {
            // Fetch the user from the database by decoded token ID
            const user = yield userModel_1.default.findOne({ _id: decoded.id }).select('-password'); // Do not select the password
            if (!user) {
                return res.status(http_status_1.default.UNAUTHORIZED).json({
                    message: 'User not found.',
                    code: http_status_1.default.UNAUTHORIZED,
                });
            }
            // Assign the user to the request object for use in next middleware/controllers
            req.user = user;
            return next();
        }
        // If token verification fails, return unauthorized
        return res.status(http_status_1.default.UNAUTHORIZED).json({
            message: 'Unauthorized - invalid token.',
            code: http_status_1.default.UNAUTHORIZED,
        });
    }
    catch (err) {
        // Log the error for debugging (optional)
        console.error('Token verification error:', err);
        // Return invalid token response
        return res.status(http_status_1.default.UNAUTHORIZED).json({
            message: 'Invalid token.',
            code: http_status_1.default.UNAUTHORIZED,
        });
    }
});
exports.Authentication = Authentication;
