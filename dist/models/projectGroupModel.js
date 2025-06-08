"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PeojectGroupSchema_1 = __importDefault(require("../Schema/PeojectGroupSchema"));
const projectGroupModel = (0, mongoose_1.model)("ProjectGroup", PeojectGroupSchema_1.default);
exports.default = projectGroupModel;
