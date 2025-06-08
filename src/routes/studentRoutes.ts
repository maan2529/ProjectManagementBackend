import { Router } from "express";
import StudentCtrl from "../Controllers/studentCtroller";
import { Authentication } from "../middleware/authMiddleware";

const router = Router();

// Get all students - protected route
router.route("/allstudent").get(Authentication, StudentCtrl.getAllStudents);

export default router;
