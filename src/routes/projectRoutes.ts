import { Router } from "express";
import projectCtrl from "../Controllers/projectController";
import { Authentication } from "../middleware/authMiddleware";
import upload from "../middleware/multer/multer"; // Import the multer configuration
import { checkDuplicateProject } from '../Controllers/projectController';
const router = Router();

// Create project - only authenticated users can create projects
router.route("/create")
    .post(Authentication, upload.array("files", 5), projectCtrl.createProject); // Use upload.array for multiple files

// Add files to project
router.route("/:projectId/add-files")
    .post(Authentication, upload.array("files", 5), projectCtrl.addFilesToProject);

router.route("/allprojects").get(Authentication, projectCtrl.getAllProjects);

// Get a specific project by ID
router.route("/:id").get(projectCtrl.getProjectById); // New route for getting a project by ID

// Update file status and feedback
router.route("/:projectId/files/:fileId/status")
    .put(Authentication, projectCtrl.updateFileStatus);

// Get file feedback
router.route("/:projectId/files/:fileId/feedback")
    .get(Authentication, projectCtrl.getFileFeedback);

// Check plagiarism
router.route("/:id/check-plagiarism")
    .post(Authentication, projectCtrl.checkPlagiarism);

// Get all projects for a specific guide
router.route("/guide/:guideId/projects")
    .get(Authentication, projectCtrl.togetGuideProject);

// Get all groups assigned to a guide
router.route("/guide/:guideId/groups")
    .get(Authentication, projectCtrl.getGuideGroups);

// Get file download URL
router.route("/:projectId/files/:fileId/download-url")
    .get(Authentication, projectCtrl.getFileDownloadUrl);

router.post('/check-duplicate', checkDuplicateProject);
export default router;