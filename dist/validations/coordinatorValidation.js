"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCoordinatorSchema = exports.createCoordinatorSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createCoordinatorSchema = joi_1.default.object({
    userId: joi_1.default.string().hex().length(24).required(),
    managedProjects: joi_1.default.array().items(joi_1.default.string().hex().length(24)),
    maxGroupSize: joi_1.default.number().integer().min(1).max(10).required()
});
exports.updateCoordinatorSchema = joi_1.default.object({
    managedProjects: joi_1.default.array().items(joi_1.default.string().hex().length(24)),
    maxGroupSize: joi_1.default.number().integer().min(1).max(10)
});
