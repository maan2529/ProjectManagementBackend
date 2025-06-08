"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProjectSchema_1 = __importDefault(require("../Schema/ProjectSchema"));
const projectModel = (0, mongoose_1.model)("Project", ProjectSchema_1.default);
exports.default = projectModel;
