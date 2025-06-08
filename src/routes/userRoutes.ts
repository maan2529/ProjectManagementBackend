import { Router, Request, Response, NextFunction } from "express";
import { Authentication } from "../middleware/authMiddleware";
import userCtrl from "../Controllers/userController";

import {
  validateUserRegister,
  validateUserLogin,
} from "../middleware/validator/uservalidate";

const router = Router();

router.route("/register").post(validateUserRegister, userCtrl.RegisterUser);
router.route("/login").post(validateUserLogin, userCtrl.LoginUser);
router.route("/verify_otp").post(userCtrl.VerifyOTP);
router.route("/resend_otp").post(userCtrl.ResendOTP);
router.route("/getprofile").post(userCtrl.getProfileDetail);
router.route("/update_pass").put(Authentication, userCtrl.UpdatePassword);
router.route("/get_user").get(Authentication, userCtrl.getUserDetail);
router.route("/update").put(Authentication, userCtrl.UpdateUser);
router.route("/verify_pass").post(Authentication, userCtrl.VerifyPassword);
router.route("/forget_pass").get(Authentication, userCtrl.forgotPasswordOTP);
router.route("/get_user/:id").get(Authentication, userCtrl.getUserById);


export default router;
