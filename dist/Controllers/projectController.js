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
exports.checkDuplicateProject = void 0;
const projectModel_1 = __importDefault(require("../models/projectModel")); // Import the project model
const projectGroupModel_1 = __importDefault(require("../models/projectGroupModel"));
const ProjectSchema_1 = require("../Schema/ProjectSchema");
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Get all projects
const getAllProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield projectModel_1.default.find().populate([
            { path: 'groupID', select: 'name' },
            { path: 'guideID', select: 'name' }
        ]);
        ; // Fetch all projects
        return res.status(200).json({
            success: true,
            message: "Projects retrieved successfully",
            data: projects,
        });
    }
    catch (error) {
        console.error("Error in getAllProjects: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// Create a new project
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, domain, fileType } = req.body;
        const user = req.user;
        // Validate required fields
        if (!title || !description || !domain || !fileType) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        // Validate file type
        if (!Object.values(ProjectSchema_1.DocumentType).includes(fileType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid file type",
            });
        }
        // Handle uploaded files
        let files = [];
        if (req.files && Array.isArray(req.files)) {
            files = req.files.map((file) => ({
                type: fileType,
                path: file.filename,
                uploadedAt: new Date(),
                status: ProjectSchema_1.FileStatus.PENDING
            }));
        }
        // Create new project
        const newProject = new projectModel_1.default({
            title,
            description,
            domain,
            files,
            groupID: user.groupID // Associate project with user's group
        });
        const savedProject = yield newProject.save();
        // Update user's group with project reference
        const userGroup = yield projectGroupModel_1.default.findById(user.groupID);
        if (userGroup) {
            userGroup.projectID = savedProject._id;
            yield userGroup.save();
        }
        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: savedProject,
        });
    }
    catch (error) {
        console.error("Error in createProject: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// Update project data
const updateProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Get project ID from request parameters
        const updateData = req.body; // Get updated data from request body
        const updatedProject = yield projectModel_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: updatedProject,
        });
    }
    catch (error) {
        console.error("Error in updateProject: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// Delete a project
const deleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Get project ID from request parameters
        const deletedProject = yield projectModel_1.default.findByIdAndDelete(id);
        if (!deletedProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Project deleted successfully",
        });
    }
    catch (error) {
        console.error("Error in deleteProject: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// Get a specific project by ID
const getProjectById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Get project ID from request parameters
        const project = yield projectModel_1.default.findById(id).populate([
            {
                path: 'groupID',
                select: 'name members',
                populate: {
                    path: 'members',
                    select: 'name userName email roll_no' // You can add more fields as needed
                }
            },
            {
                path: 'guideID',
                select: 'name role email' // optional: if you want guide info
            },
            {
                path: 'files',
                populate: {
                    path: 'feedbackBy',
                    select: 'name role',
                    model: 'User'
                }
            }
        ]);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Project retrieved successfully",
            data: project,
        });
    }
    catch (error) {
        console.error("Error in getProjectById: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// Add new files to a project
const addFilesToProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        const { fileType } = req.body;
        const user = req.user;
        // Validate required fields
        if (!fileType) {
            return res.status(400).json({
                success: false,
                message: "File type is required",
            });
        }
        // Validate file type
        if (!Object.values(ProjectSchema_1.DocumentType).includes(fileType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid file type",
            });
        }
        // Find the project
        const project = yield projectModel_1.default.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }
        // Handle uploaded files
        let newFiles = [];
        if (req.files && Array.isArray(req.files)) {
            newFiles = req.files.map((file) => ({
                type: fileType,
                path: file.filename,
                uploadedAt: new Date(),
                status: ProjectSchema_1.FileStatus.PENDING
            }));
        }
        // Add new files to the project
        project.files.push(...newFiles);
        const updatedProject = yield project.save();
        return res.status(200).json({
            success: true,
            message: "Files added successfully",
            data: updatedProject,
        });
    }
    catch (error) {
        console.error("Error in addFilesToProject: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// Add feedback and update file status
const updateFileStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId, fileId } = req.params;
        const fileIndex = parseInt(fileId);
        const { status, feedback } = req.body;
        const user = req.user;
        // Validate required fields
        if (!status || !Object.values(ProjectSchema_1.FileStatus).includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Valid status is required",
            });
        }
        // Find the project
        const project = yield projectModel_1.default.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }
        // Check if file index is valid
        if (isNaN(fileIndex) || !project.files[fileIndex]) {
            return res.status(404).json({
                success: false,
                message: "File not found",
            });
        }
        // Update file status and feedback
        project.files[fileIndex].status = status;
        project.files[fileIndex].feedback = feedback || "";
        project.files[fileIndex].feedbackBy = user._id;
        project.files[fileIndex].feedbackDate = new Date();
        const updatedProject = yield project.save();
        return res.status(200).json({
            success: true,
            message: "File status updated successfully",
            data: updatedProject,
        });
    }
    catch (error) {
        console.error("Error in updateFileStatus: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// Get feedback for a specific file
const getFileFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId, fileId } = req.params;
        const fileIndex = parseInt(fileId);
        // Find the project
        const project = yield projectModel_1.default.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }
        // Check if file index is valid
        if (isNaN(fileIndex) || !project.files[fileIndex]) {
            return res.status(404).json({
                success: false,
                message: "File not found",
            });
        }
        const file = project.files[fileIndex];
        return res.status(200).json({
            success: true,
            message: "File feedback retrieved successfully",
            data: {
                status: file.status,
                feedback: file.feedback,
                feedbackBy: file.feedbackBy,
                feedbackDate: file.feedbackDate
            },
        });
    }
    catch (error) {
        console.error("Error in getFileFeedback: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// Check plagiarism for a project
const checkPlagiarism = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const project = yield projectModel_1.default.findById(id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }
        const text = `${project.title} ${project.description}`;
        if (!text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Content is required for plagiarism check",
            });
        }
        // Call the plagiarism check API
        const response = yield axios_1.default.post('http://127.0.0.1:5000/check-duplicate', {
            text: text
        });
        console.log('Plagiarism check response:', JSON.stringify(response.data, null, 2));
        return res.status(200).json({
            success: true,
            message: "Plagiarism check completed successfully",
            data: {
                similarity_score: response.data.similarity_score,
                is_duplicate: response.data.is_duplicate,
                matched_project: response.data.matched_project,
                total_projects_checked: response.data.total_projects_checked
            }
        });
    }
    catch (error) {
        console.error("Error in checkPlagiarism: ", error);
        if (axios_1.default.isAxiosError(error)) {
            console.error("API Response:", (_a = error.response) === null || _a === void 0 ? void 0 : _a.data);
            return res.status(((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500).json({
                success: false,
                message: "Error checking plagiarism",
                error: ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// Get all projects for a specific guide
const togetGuideProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { guideId } = req.params;
        if (!guideId) {
            return res.status(400).json({
                success: false,
                message: "Guide ID is required",
            });
        }
        const projects = yield projectModel_1.default.find({ guideID: guideId })
            .populate([
            {
                path: 'groupID',
                select: 'name members',
                populate: {
                    path: 'members',
                    select: 'name userName email roll_no'
                }
            },
            {
                path: 'guideID',
                select: 'name role email'
            }
        ]);
        return res.status(200).json({
            success: true,
            message: "Projects for guide retrieved successfully",
            data: projects,
        });
    }
    catch (error) {
        console.error("Error in togetGuideProject: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// Get all groups assigned to a guide
const getGuideGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { guideId } = req.params;
        if (!guideId) {
            return res.status(400).json({
                success: false,
                message: "Guide ID is required",
            });
        }
        const groups = yield projectGroupModel_1.default.find({ guideID: guideId })
            .populate([
            {
                path: 'members',
                select: 'name userName email roll_no'
            },
            {
                path: 'projectID',
                select: 'title description domain'
            },
            {
                path: 'guideID',
                select: 'name email'
            },
            {
                path: 'coordinatorID',
                select: 'name email'
            }
        ]);
        return res.status(200).json({
            success: true,
            message: "Groups retrieved successfully",
            data: groups,
        });
    }
    catch (error) {
        console.error("Error in getGuideGroups: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
// Get file download URL
const getFileDownloadUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId, fileId } = req.params;
        const fileIndex = parseInt(fileId);
        console.log('Request params:', { projectId, fileId, fileIndex });
        // Find the project
        const project = yield projectModel_1.default.findById(projectId);
        if (!project) {
            console.log('Project not found:', projectId);
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }
        console.log('Project found:', project._id);
        console.log('Project files:', project.files);
        // Check if file index is valid
        if (isNaN(fileIndex) || !project.files[fileIndex]) {
            console.log('Invalid file index or file not found:', fileIndex);
            return res.status(404).json({
                success: false,
                message: "File not found in project",
            });
        }
        const file = project.files[fileIndex];
        console.log('File to download:', file);
        // Construct the absolute path to the file
        const filePath = path_1.default.join(__dirname, '..', '..', 'files', file.path);
        console.log('Looking for file at path:', filePath);
        // Check if file exists
        if (!fs_1.default.existsSync(filePath)) {
            console.log('File does not exist at path:', filePath);
            return res.status(404).json({
                success: false,
                message: "File not found on server",
                details: {
                    filePath,
                    fileName: file.path,
                    projectId,
                    fileIndex
                }
            });
        }
        // Get file stats
        const stats = fs_1.default.statSync(filePath);
        console.log('File stats:', {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
        });
        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${file.path}`);
        res.setHeader('Content-Length', stats.size);
        // Stream the file
        const fileStream = fs_1.default.createReadStream(filePath);
        fileStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Error streaming file",
                    error: error.message
                });
            }
        });
        fileStream.pipe(res);
    }
    catch (error) {
        console.error("Error in getFileDownloadUrl: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
const checkDuplicateProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1️⃣ Fetch projectId from req.body
        const { projectId } = req.body;
        if (!projectId)
            return res.status(400).json({ error: 'projectId is required' });
        // 2️⃣ Fetch project data from MongoDB
        const project = yield projectModel_1.default
            .findById(projectId)
            .select('title description domain');
        if (!project)
            return res.status(404).json({ error: 'Project not found' });
        // 3️⃣ Prepare payload for Flask
        const payload = {
            title: project.title,
            domain: project.domain,
            description: project.description
        };
        console.log('Sending to Flask:', payload);
        // 4️⃣ Call Flask endpoint
        const flaskResp = yield axios_1.default.post('http://127.0.0.1:5000/check-duplicate', payload);
        console.log('Received from Flask:', flaskResp.data);
        // 5️⃣ Forward Flask’s full response
        return res.json(flaskResp.data);
    }
    catch (err) {
        console.error('Error in checkDuplicateProject:', err.message);
        return res.status(500).json({ error: 'Prediction failed' });
    }
});
exports.checkDuplicateProject = checkDuplicateProject;
exports.default = {
    getAllProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    addFilesToProject,
    updateFileStatus,
    getFileFeedback,
    checkPlagiarism,
    getFileDownloadUrl,
    togetGuideProject,
    getGuideGroups,
    checkDuplicateProject: exports.checkDuplicateProject
};
