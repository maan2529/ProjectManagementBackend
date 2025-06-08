"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const guideController_1 = __importDefault(require("../Controllers/guideController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Create project group - only authenticated users can create groups
router.route('/getallGuide').get(authMiddleware_1.Authentication, guideController_1.default.getAllGuides);
// Get all guides
router.route("/all").get(guideController_1.default.getAllGuides);
// Assign guide to group and project
router.route("/assign/:groupId/:guideId")
    .post(authMiddleware_1.Authentication, guideController_1.default.assignGuideToGroupAndProject);
exports.default = router;
