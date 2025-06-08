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
const userModel_1 = __importDefault(require("../models/userModel"));
const projectGroupModel_1 = __importDefault(require("../models/projectGroupModel"));
const projectModel_1 = __importDefault(require("../models/projectModel"));
const getAllGuides = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guides = yield userModel_1.default.find({ role: "guide" }); // Query for users with the role 'guide'
        return res.status(200).json({
            success: true,
            message: "Guides retrieved successfully",
            data: guides,
        });
    }
    catch (error) {
        console.error("Error in getAllGuides: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
const assignGuideToGroupAndProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId, guideId } = req.params;
        console.log({ groupId, guideId });
        // Validate guide exists and is a guide
        const guide = yield userModel_1.default.findOne({
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
        const group = yield projectGroupModel_1.default.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Project group not found",
            });
        }
        // Update group with guide
        group.guideID = guide._id;
        yield group.save();
        // Update all group members with guide reference
        yield userModel_1.default.updateMany({ groupID: groupId }, { guideID: guide._id });
        // If group has a project, update it with guide as well
        if (group.projectID) {
            yield projectModel_1.default.findByIdAndUpdate(group.projectID, { guideID: guide._id });
        }
        return res.status(200).json({
            success: true,
            message: "Guide assigned successfully to group and project",
            data: {
                group,
                guideId: guide._id
            }
        });
    }
    catch (error) {
        console.error("Error in assignGuideToGroupAndProject: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
exports.default = {
    getAllGuides,
    assignGuideToGroupAndProject
};
