"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudentSchema = exports.createStudentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createStudentSchema = joi_1.default.object({
    userId: joi_1.default.string().hex().length(24).required(),
    prn: joi_1.default.string().required(),
    Roll_no: joi_1.default.string().required(),
    groups: joi_1.default.array().items(joi_1.default.string().hex().length(24)),
    projects: joi_1.default.array().items(joi_1.default.string().hex().length(24))
});
exports.updateStudentSchema = joi_1.default.object({
    prn: joi_1.default.string(),
    seatNumber: joi_1.default.string(),
    groups: joi_1.default.array().items(joi_1.default.string().hex().length(24)),
    projects: joi_1.default.array().items(joi_1.default.string().hex().length(24))
});
