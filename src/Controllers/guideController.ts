import { Request, Response } from "express";
import userModel from "../models/userModel";
import projectGroupModel from "../models/projectGroupModel";
import projectModel from "../models/projectModel";
import mongoose from "mongoose";
import { IUser } from "../types/userType";

const getAllGuides = async (req: Request, res: Response) => {
  try {
    const guides = await userModel.find({ role: "guide" }); // Query for users with the role 'guide'

    return res.status(200).json({
      success: true,
      message: "Guides retrieved successfully",
      data: guides,
    });
  } catch (error) {
    console.error("Error in getAllGuides: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

const assignGuideToGroupAndProject = async (req: Request, res: Response) => {
  try {
    const { groupId,guideId  } = req.params;
    console.log({groupId,guideId})
   
    // Validate guide exists and is a guide
    const guide: IUser | null = await userModel.findOne({
      _id: guideId,
      role: "guide"
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found or user is not a guide",
      });
    }

    // Find the project group
    const group = await projectGroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Project group not found",
      });
    }

    // Update group with guide
    group.guideID = guide._id as mongoose.Types.ObjectId;
    await group.save();

    // Update all group members with guide reference
    await userModel.updateMany(
      { groupID: groupId },
      { guideID: guide._id }
    );

    // If group has a project, update it with guide as well
    if (group.projectID) {
      await projectModel.findByIdAndUpdate(
        group.projectID,
        { guideID: guide._id }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Guide assigned successfully to group and project",
      data: {
        group,
        guideId: guide._id
      }
    });
  } catch (error) {
    console.error("Error in assignGuideToGroupAndProject: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export default {
  getAllGuides,
  assignGuideToGroupAndProject
};
