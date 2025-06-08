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
const getAllStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield userModel_1.default.find({ role: "student" }).populate({
            path: 'groupID',
            select: 'name'
        });
        if (!students || students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No students found",
            });
        }
        return res.status(200).json({
            success: true,
            data: students,
            message: "Students retrieved successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while fetching students",
            error: error.message,
        });
    }
});
exports.default = {
    getAllStudents,
};
