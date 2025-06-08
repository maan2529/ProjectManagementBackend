"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = __importDefault(require("../Controllers/projectController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const multer_1 = __importDefault(require("../middleware/multer/multer")); // Import the multer configuration
const projectController_2 = require("../Controllers/projectController");
const router = (0, express_1.Router)();
// Create project - only authenticated users can create projects
router.route("/create")
    .post(authMiddleware_1.Authentication, multer_1.default.array("files", 5), projectController_1.default.createProject); // Use upload.array for multiple files
// Add files to project
router.route("/:projectId/add-files")
    .post(authMiddleware_1.Authentication, multer_1.default.array("files", 5), projectController_1.default.addFilesToProject);
router.route("/allprojects").get(authMiddleware_1.Authentication, projectController_1.default.getAllProjects);
// Get a specific project by ID
router.route("/:id").get(projectController_1.default.getProjectById); // New route for getting a project by ID
// Update file status and feedback
router.route("/:projectId/files/:fileId/status")
    .put(authMiddleware_1.Authentication, projectController_1.default.updateFileStatus);
// Get file feedback
router.route("/:projectId/files/:fileId/feedback")
    .get(authMiddleware_1.Authentication, projectController_1.default.getFileFeedback);
// Check plagiarism
router.route("/:id/check-plagiarism")
    .post(authMiddleware_1.Authentication, projectController_1.default.checkPlagiarism);
// Get all projects for a specific guide
router.route("/guide/:guideId/projects")
    .get(authMiddleware_1.Authentication, projectController_1.default.togetGuideProject);
// Get all groups assigned to a guide
router.route("/guide/:guideId/groups")
    .get(authMiddleware_1.Authentication, projectController_1.default.getGuideGroups);
// Get file download URL
router.route("/:projectId/files/:fileId/download-url")
    .get(authMiddleware_1.Authentication, projectController_1.default.getFileDownloadUrl);
router.post('/check-duplicate', projectController_2.checkDuplicateProject);
exports.default = router;
