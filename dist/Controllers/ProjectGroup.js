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
const projectGroupModel_1 = __importDefault(require("../models/projectGroupModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const chatModel_1 = __importDefault(require("../models/chatModel"));
const socket_1 = require("../socket");
const createProjectGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req === null || req === void 0 ? void 0 : req.user;
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
            const existingMember = yield userModel_1.default.findById(memberId);
            if (existingMember && existingMember.groupID) {
                return res.status(400).json({
                    success: false,
                    message: `${existingMember.name} is already part of another project group`,
                });
            }
        }
        const newProjectGroup = new projectGroupModel_1.default({
            name,
            members,
            created_by: user._id,
        });
        // Save the project group
        const newGroup = yield newProjectGroup.save();
        // Create a chat room for the group
        const groupChat = yield chatModel_1.default.create({
            chatName: name,
            isGroupChat: true,
            GroupID: newGroup._id,
            groupAdmin: user._id
        });
        // Assign group ID to the creator
        const creator = yield userModel_1.default.findById(user._id);
        if (creator) {
            creator.groupID = newGroup._id;
            yield creator.save();
        }
        // Assign group ID to all members
        for (const member of members) {
            const Groupmember = yield userModel_1.default.findById(member);
            if (Groupmember) {
                Groupmember.groupID = newGroup._id;
                yield Groupmember.save();
            }
        }
        // Notify all members about the new group chat
        const io = (0, socket_1.getIO)();
        io.to(newGroup._id.toString()).emit('newGroupChat', {
            groupId: newGroup._id,
            chatId: groupChat._id,
            name: name
        });
        return res.status(201).json({
            success: true,
            message: "Project group created successfully",
            groupId: newGroup._id,
        });
    }
    catch (error) {
        console.error("Error in createProjectGroup: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
const getGroupDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const group = yield projectGroupModel_1.default.findById(groupId)
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while fetching group details",
            error: error.message,
        });
    }
});
const getAllGroupsDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Await the result of the query
        const Groups = yield projectGroupModel_1.default.find();
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while fetching all groups",
            error: error.message,
        });
    }
});
exports.default = {
    createProjectGroup,
    getAllGroupsDetails,
    getGroupDetails
};
