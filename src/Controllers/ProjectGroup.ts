import { Request, Response } from "express";
import ProjectGroupSchema from "../Schema/PeojectGroupSchema";
import mongoose, { ObjectId } from "mongoose";
import projectGroupModel from "../models/projectGroupModel";
import exp from "constants";
import { group } from "console";
import { STATUS_CODES } from "http";
import userModel from "../models/userModel";
import { IUser } from "../types/userType";
import chatModel from "../models/chatModel";
import { getIO } from "../socket";

const createProjectGroup = async (req: Request, res: Response) => {
  try {
    const user = req?.user;
    const { name, members } = req.body;

    // Validate required fields
    if (!name || !members || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name and at least one member are required",
      });
    }

    // Check if any member is already part of another group
    for (const memberId of members) {
      const existingMember = await userModel.findById(memberId);
      if (existingMember && existingMember.groupID) {
        return res.status(400).json({
          success: false,
          message: `${existingMember.name} is already part of another project group`,
        });
      }
    }

    const newProjectGroup = new projectGroupModel({
      name,
      members,
      created_by: user._id,
    });

    // Save the project group
    const newGroup = await newProjectGroup.save();

    // Create a chat room for the group
    const groupChat = await chatModel.create({
      chatName: name,
      isGroupChat: true,
      GroupID: newGroup._id,
      groupAdmin: user._id
    });

    // Assign group ID to the creator
    const creator: IUser | null = await userModel.findById(user._id);
    if (creator) {
      creator.groupID = newGroup._id as mongoose.Types.ObjectId;
      await creator.save();
    }
    
    // Assign group ID to all members
    for (const member of members) {
      const Groupmember: IUser | null = await userModel.findById(member as mongoose.Types.ObjectId);
      if (Groupmember) {
        Groupmember.groupID = newGroup._id as mongoose.Types.ObjectId;
        await Groupmember.save();
      }
    }

    // Notify all members about the new group chat
    const io = getIO();
    io.to((newGroup._id as mongoose.Types.ObjectId).toString()).emit('newGroupChat', {
      groupId: newGroup._id,
      chatId: groupChat._id,
      name: name
    });
    
    return res.status(201).json({
      success: true,
      message: "Project group created successfully",
      groupId:newGroup._id,
    });
  } catch (error) {
    console.error("Error in createProjectGroup: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

const getGroupDetails = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    // Validate if groupId is provided
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Group ID is required",
      });
    }

    // Find the project group by ID
    const group = await projectGroupModel.findById(groupId)
      .populate('members', 'name email role') // Populate member details
      .populate('created_by', 'name email role') // Populate creator details
      .populate('projectID', 'title description domain');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Project group not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: group,
      message: "Group details retrieved successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching group details",
      error: error.message,
    });
  }
};

const getAllGroupsDetails = async (req: Request, res: Response) => {
  try {
    // Await the result of the query
    const Groups = await projectGroupModel.find();
    if (!Groups || Groups.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Groups found",
      });
    }
    return res.status(200).json({
      success: true,
      data: Groups,
      message: "Groups retrieved successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching all groups",
      error: error.message,
    });
  }
};

export default {
  createProjectGroup,
  getAllGroupsDetails,
  getGroupDetails
};
