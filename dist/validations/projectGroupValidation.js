"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectGroupSchema = exports.createProjectGroupSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createProjectGroupSchema = joi_1.default.object({
    name: joi_1.default.string().required().min(2).max(100),
    members: joi_1.default.array().items(joi_1.default.string().hex().length(24)).required(),
    project: joi_1.default.string().hex().length(24),
    guide: joi_1.default.string().hex().length(24),
    coordinator: joi_1.default.string().hex().length(24).required(),
    created_by: joi_1.default.string().hex().length(24).required()
});
exports.updateProjectGroupSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100),
    members: joi_1.default.array().items(joi_1.default.string().hex().length(24)),
    project: joi_1.default.string().hex().length(24),
    guide: joi_1.default.string().hex().length(24),
    coordinator: joi_1.default.string().hex().length(24),
    created_by: joi_1.default.string().hex().length(24).required()
});
