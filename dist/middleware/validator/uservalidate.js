"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserLogin = exports.validateUserRegister = void 0;
const userValidation_1 = __importDefault(require("../../validations/userValidation"));
const validateUserRegister = (req, res, next) => {
    const { error } = userValidation_1.default.registerValidate.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    next();
};
exports.validateUserRegister = validateUserRegister;
const validateUserLogin = (req, res, next) => {
    const { error } = userValidation_1.default.loginValidation.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    next();
};
exports.validateUserLogin = validateUserLogin;
