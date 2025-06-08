import { Request, Response } from "express";
import userModel from "../models/userModel";

const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await userModel.find({ role: "student" }).populate({
      path: 'groupID',
      select: 'name'
    });

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found",
      });
    }
    return res.status(200).json({
      success: true,
      data: students,
      message: "Students retrieved successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching students",
      error: error.message,
    });
  }
};


export default {
  getAllStudents,
};
