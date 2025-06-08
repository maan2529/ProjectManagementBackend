"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentCtroller_1 = __importDefault(require("../Controllers/studentCtroller"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Get all students - protected route
router.route("/allstudent").get(authMiddleware_1.Authentication, studentCtroller_1.default.getAllStudents);
exports.default = router;
