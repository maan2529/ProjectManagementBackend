import { Request, Response } from "express";
import projectModel from "../models/projectModel"; // Import the project model
import ProjectGroup from "./ProjectGroup";
import projectGroupModel from "../models/projectGroupModel";
import { IProjectGroup } from "../types/projectGroupType";
import mongoose from "mongoose";
import { DocumentType, FileStatus } from "../Schema/ProjectSchema";
import { IFile } from "../types/projectType";
import axios from 'axios';
import path from 'path';
import fs from 'fs';

// Get all projects
const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await projectModel.find().populate([
      { path: 'groupID', select: 'name' },
      { path: 'guideID', select: 'name' }
    ]);
    ; // Fetch all projects

    return res.status(200).json({
      success: true,
      message: "Projects retrieved successfully",
      data: projects,
    });
  } catch (error) {
    console.error("Error in getAllProjects: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Create a new project
const createProject = async (req: Request, res: Response) => {
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
    if (!Object.values(DocumentType).includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type",
      });
    }

    // Handle uploaded files
    let files: IFile[] = [];
    if (req.files && Array.isArray(req.files)) {
      files = (req.files as Express.Multer.File[]).map((file) => ({
        type: fileType as DocumentType,
        path: file.filename,
        uploadedAt: new Date(),
        status: FileStatus.PENDING
      }));
    }

    // Create new project
    const newProject = new projectModel({
      title,
      description,
      domain,
      files,
      groupID: user.groupID // Associate project with user's group
    });

    const savedProject = await newProject.save();

    // Update user's group with project reference
    const userGroup: IProjectGroup | null = await projectGroupModel.findById(user.groupID);
    if (userGroup) {
      userGroup.projectID = savedProject._id as mongoose.Types.ObjectId;
      await userGroup.save();
    }

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: savedProject,
    });
  } catch (error) {
    console.error("Error in createProject: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Update project data
const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Get project ID from request parameters
    const updateData = req.body; // Get updated data from request body

    const updatedProject = await projectModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

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
  } catch (error) {
    console.error("Error in updateProject: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Delete a project
const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Get project ID from request parameters

    const deletedProject = await projectModel.findByIdAndDelete(id);

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
  } catch (error) {
    console.error("Error in deleteProject: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Get a specific project by ID
const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Get project ID from request parameters

    const project = await projectModel.findById(id).populate([
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
  } catch (error) {
    console.error("Error in getProjectById: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Add new files to a project
const addFilesToProject = async (req: Request, res: Response) => {
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
    if (!Object.values(DocumentType).includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type",
      });
    }

    // Find the project
    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Handle uploaded files
    let newFiles: IFile[] = [];
    if (req.files && Array.isArray(req.files)) {
      newFiles = (req.files as Express.Multer.File[]).map((file) => ({
        type: fileType as DocumentType,
        path: file.filename,
        uploadedAt: new Date(),
        status: FileStatus.PENDING
      }));
    }

    // Add new files to the project
    project.files.push(...newFiles);
    const updatedProject = await project.save();

    return res.status(200).json({
      success: true,
      message: "Files added successfully",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Error in addFilesToProject: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Add feedback and update file status
const updateFileStatus = async (req: Request, res: Response) => {
  try {
    const { projectId, fileId } = req.params;
    const fileIndex = parseInt(fileId);
    const { status, feedback } = req.body;
    const user = req.user;

    // Validate required fields
    if (!status || !Object.values(FileStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required",
      });
    }

    // Find the project
    const project = await projectModel.findById(projectId);
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

    const updatedProject = await project.save();

    return res.status(200).json({
      success: true,
      message: "File status updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Error in updateFileStatus: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Get feedback for a specific file
const getFileFeedback = async (req: Request, res: Response) => {
  try {
    const { projectId, fileId } = req.params;
    const fileIndex = parseInt(fileId);

    // Find the project
    const project = await projectModel.findById(projectId);
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
  } catch (error) {
    console.error("Error in getFileFeedback: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Check plagiarism for a project
const checkPlagiarism = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await projectModel.findById(id);

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
    const response = await axios.post('http://127.0.0.1:5000/check-duplicate', {
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
  } catch (error) {
    console.error("Error in checkPlagiarism: ", error);
    if (axios.isAxiosError(error)) {
      console.error("API Response:", error.response?.data);
      return res.status(error.response?.status || 500).json({
        success: false,
        message: "Error checking plagiarism",
        error: error.response?.data || error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Get all projects for a specific guide
const togetGuideProject = async (req: Request, res: Response) => {
  try {
    const { guideId } = req.params;
    if (!guideId) {
      return res.status(400).json({
        success: false,
        message: "Guide ID is required",
      });
    }
    const projects = await projectModel.find({ guideID: guideId })
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
  } catch (error) {
    console.error("Error in togetGuideProject: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Get all groups assigned to a guide
const getGuideGroups = async (req: Request, res: Response) => {
  try {
    const { guideId } = req.params;
    if (!guideId) {
      return res.status(400).json({
        success: false,
        message: "Guide ID is required",
      });
    }

    const groups = await projectGroupModel.find({ guideID: guideId })
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
  } catch (error) {
    console.error("Error in getGuideGroups: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Get file download URL
const getFileDownloadUrl = async (req: Request, res: Response) => {
  try {
    const { projectId, fileId } = req.params;
    const fileIndex = parseInt(fileId);

    console.log('Request params:', { projectId, fileId, fileIndex });

    // Find the project
    const project = await projectModel.findById(projectId);
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
    const filePath = path.join(__dirname, '..','..',  'files', file.path);
    console.log('Looking for file at path:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
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
    const stats = fs.statSync(filePath);
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
    const fileStream = fs.createReadStream(filePath);

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

  } catch (error) {
    console.error("Error in getFileDownloadUrl: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export const checkDuplicateProject = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Fetch projectId from req.body
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    // 2️⃣ Fetch project data from MongoDB
    const project = await projectModel
      .findById(projectId)
      .select('title description domain');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // 3️⃣ Prepare payload for Flask
    const payload = {
      title: project.title,
      domain: project.domain,
      description: project.description
    };

    console.log('Sending to Flask:', payload);

    // 4️⃣ Call Flask endpoint
    const flaskResp = await axios.post('http://127.0.0.1:5000/check-duplicate', payload);
    console.log('Received from Flask:', flaskResp.data);

    // 5️⃣ Forward Flask’s full response
    return res.json(flaskResp.data);

  } catch (err: any) {
    console.error('Error in checkDuplicateProject:', err.message);
    return res.status(500).json({ error: 'Prediction failed' });
  }
};

export default {
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
  checkDuplicateProject
};
