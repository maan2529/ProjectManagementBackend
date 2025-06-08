"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGuideSchema = exports.createGuideSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createGuideSchema = joi_1.default.object({
    userId: joi_1.default.string().hex().length(24).required(),
    maxGroups: joi_1.default.number().integer().min(1).max(10).default(5),
    assignedGroups: joi_1.default.array().items(joi_1.default.string().hex().length(24)),
    expertiseDomains: joi_1.default.array().items(joi_1.default.string().required())
});
exports.updateGuideSchema = joi_1.default.object({
    maxGroups: joi_1.default.number().integer().min(1).max(10),
    assignedGroups: joi_1.default.array().items(joi_1.default.string().hex().length(24)),
    expertiseDomains: joi_1.default.array().items(joi_1.default.string())
});
