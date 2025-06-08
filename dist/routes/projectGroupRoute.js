"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProjectGroup_1 = __importDefault(require("../Controllers/ProjectGroup"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Create project group - only authenticated users can create groups
router
    .route("/create")
    .post(authMiddleware_1.Authentication, ProjectGroup_1.default.createProjectGroup);
router
    .route("/allgroups")
    .get(authMiddleware_1.Authentication, ProjectGroup_1.default.getAllGroupsDetails);
router.route('/groups/:groupId').get(authMiddleware_1.Authentication, ProjectGroup_1.default.getGroupDetails);
exports.default = router;
