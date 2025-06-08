import { Request, Response } from "express";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel";
import { validationResult } from 'express-validator';
import httpStatus from 'http-status';
import { hashPassword , comparePassword} from "../utils/passwordUtil";
import { generateOTP , getExpiryTime} from "../utils/otpGenerationUtil";
import sendEmail from "../utils/sendEmailUtil"
import { generateToken } from '../utils/tokenUtil'; // Assumes you have a utility to verify the JWT
import emailToUniqueUsername from '../utils/randomUsername';
import { IUser } from "../types/userType";
import { group } from "console";



const RegisterUser = async (req: Request, res: Response, next: unknown) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.log({errors});
            return res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
        }

        const {
            name, email,password, role,mobileNumber,
            college, department,roll_no, prn,division, facultyID, domain,
        } = req.body;

    const userName = await emailToUniqueUsername(email);

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.isDeleted) {
                return res.status(httpStatus.CONFLICT).json({
                  message: 'Your account has been deleted. Try after some time.',
                  code: httpStatus.CONFLICT,
                });
              }
              return res.status(409).json({
                message: 'Username or Email already exists',
                code: 409,
              });

            }
        // Hash the password

        const hashedPassword = await hashPassword(password);
        const otp=generateOTP();

        const mailOption = {
            toEmail: email,
            subject: 'Account Verification OTP',
            otp
          };

          await sendEmail(mailOption);
          const otpExpiry = getExpiryTime(); // OTP valid for 5 minutes
          let coordinator;
          if(role!="coordinator"){
             coordinator = await userModel.findOne({ role: "coordinator" });
          }

        // Create new user
        const newUser :IUser = new userModel({
            userName:userName,
            name,
            email,
            password: hashedPassword,
            role,
            mobileNumber,
            college,
            department,
            otp,
            otpExpiry,
            roll_no, 
            prn,
            division,
            facultyID, 
            domain,
            coordinatorID:coordinator?._id
        });
        await newUser.save();

        const saved_user = await userModel.findOne({ email: email });
        const token = generateToken(
            saved_user?._id as string,
            saved_user?.userName as string,
            saved_user?.role as string
        );
        res.cookie('token', token, {
          maxAge: 60 * 60 * 1000, // expires in 15 minutes
          httpOnly: true, // prevents client-side JavaScript access
          sameSite: 'none',
          secure: true, // only send cookies over HTTPScure:fale
        });
    
        if (!saved_user) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to register user.',
            });
        } 
        console.log(saved_user?._id);
        return res.status(httpStatus.CREATED).json({
            message: 'Registration successful.',
            userId: saved_user._id,
            token,
            groupID:saved_user?.groupID,
        });
    } catch (error) {
        console.error('Register:', (error as Error).message);
        return res.status(500).json({
            message: 'Internal Server Error',
            code: 500,
        });
    }
};


const LoginUser = async (req: Request, res: Response, next: unknown) => {
    try {
      // Validate request data
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ errors: errors.array() });
      }
  
      const { email, password } = req.body;
  
      // Find the user by username
      const user: any = await userModel.findOne({ email });
      if (!user) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          message: 'Invalid username or password',
          code: httpStatus.UNAUTHORIZED,
        });
      }
      if (!user.isVerified) {
        const otp = generateOTP();
        const mailOption = {
            toEmail: email,
            subject: 'Account Verification OTP',
            otp
          }; 
        await sendEmail(mailOption);
        const otpExpiry = getExpiryTime(); // OTP valid for 5 minutes
        await userModel.updateOne({ email }, { $set: { otp, otpExpiry } });
  
        return res.status(httpStatus.OK).json({
          message: 'User not verified',
          isVerified: false,
          code: httpStatus.OK,
        });
      }
  
      // Compare provided password with the stored hashed password
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          message: 'Invalid username or password',
          code: httpStatus.UNAUTHORIZED,
        });
      }
  
      const token = generateToken(user._id, user.username,user.role);
      res.cookie('token', token, {
        maxAge: 60 * 60 * 1000, // expires in 15 minutes
        httpOnly: true, // prevents client-side JavaScript access
        sameSite: 'none',
        secure: true, // only send cookies over HTTPScure:fale
      });
  
      // res.setHeader('token',token);
      if (user?.role) {
        res.cookie('role', user?.role, {
          maxAge: 60 * 60 * 1000,
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        });
  
        return res.status(httpStatus.OK).json({
          message: 'Login successful',
          token,
          isVerified: true,
          isRole: true,
          role: user?.role,
          groupId:user.groupID,
          userId:user._id
        });
      }

    } catch (error: any) {
      console.error('Login:', error.message);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message,
        code: httpStatus.INTERNAL_SERVER_ERROR,
      });
    }
};
  

const VerifyOTP = async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;
  
      // Find the user by email
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          code: 404,
        });
      }
  
      const currentTime = new Date();
  
      if (!user.otpExpiry || currentTime > user.otpExpiry) {
        return res.status(410).json({
          message: 'OTP has expired',
          code: 410, 
        });
      }
  
      // Check if the OTP matches
      const storedOtp = user.otp ? user.otp.toString() : null;
  
      if (storedOtp !== otp) {
        return res.status(400).json({
          message: 'Invalid OTP',
          code: 400,
        });
      }
  
      // OTP is valid and not expired, update isVerified field
      user.isVerified = true;
      await user.save(); // Save the updated user document
  
      if (user?.role == undefined) {
        return res.status(200).json({
          message: 'OTP verified successfully',
          isRole: false,
          code: 200,
        });
      }
  
      // OTP is valid and not expired
      return res.status(200).json({
        message: 'OTP verified successfully',
        isRole: true,
        code: 200,
        userRole: user.role,
      });
    } catch (error: any) {
      console.error('Error verifying OTP:', error.message);
      return res.status(500).json({
        message: 'Internal Server Error',
        code: 500,
      });
    }
};


const ResendOTP = async (req: Request, res: Response) => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ errors: errors.array() });
    }
    const { email } = req.body;

    // Check if the user exists
    const user: any = await userModel.findOne({ email });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found',
        code: httpStatus.NOT_FOUND,
      });
    }

    // Generate a new OTP and send via email
    const otp = generateOTP();
   
    const mailOption = {
      toEmail: email,
      subject: 'Resend Account Verification OTP',
      otp
    };

  await sendEmail(mailOption);
  const otpExpiry = getExpiryTime(); // OTP valid for 5 minutes
  await userModel.updateOne({ email }, { $set: { otp, otpExpiry } });

    return res.status(200).json({
      message: 'OTP sent successfully',
      code: 200,
    });
  } catch (error: any) {
    console.error('Resend OTP:', error.message);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};


const getUserDetail = async (req: Request, res: Response) => {
  try {
    const user: any = req.user;

    return res
      .status(httpStatus.OK)
      .json({ message: 'User data fetched successfully!', data: user });
  } catch (error: any) {
    console.error('Error while Fetching details:', error.message);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};

/* UpdateInstituteId ------- */

// const UpdateInstituteId = async (req: Request, res: Response) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res
//         .status(httpStatus.BAD_REQUEST)
//         .json({ errors: errors.array() });
//     }

//     const { instituteId } = req.params;
//     const userId = req.user._id;
//     console.log(req.user);
//     const instituteObjectId = new ObjectId(instituteId);

//     const existingUser = await userModel.findOne({ _id: userId });

//     if (existingUser) {
//       if (existingUser.institute) {
//         return res.status(409).json({
//           message: 'You are already joined to institute',
//           code: 409,
//         });
//       }
//     }

//     const updatedUser = await userModel.findOneAndUpdate(
//       { _id: userId },
//       { $set: { institute: instituteObjectId } },
//       { new: true },
//     );

//     return res.status(201).json({
//       message: 'User updated successfully',
//       user: updatedUser,
//       code: 201,
//     });
//   } catch (error: any) {
//     console.error('Error in ProfileUser:', error.message);
//     return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//       message: 'An error occurred while processing your request.',
//       code: httpStatus.INTERNAL_SERVER_ERROR,
//     });
//   }
// };

// user update api


const UpdateUser = async (req: Request, res: Response) => {
  try {
    // Extract the user ID from the user object
    const userId = req.user?._id;

    if (!userId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'User ID not found.',
        code: httpStatus.BAD_REQUEST,
      });
    }

    // Use findById to get the user object
    const findUser = await userModel.findById(userId);
    if (!findUser) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found.',
        code: httpStatus.NOT_FOUND,
      });
    }

    // Extract the fields you want to update from the request body
    const updateData = req.body;
    // Update the user with the new data
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }, // Return the updated document and validate
    );

    // Check if the update was successful
    if (!updatedUser) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found.',
        code: httpStatus.NOT_FOUND,
      });
    }

    return res.status(httpStatus.OK).json({
      message: 'User information updated successfully',
      updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating user:', error.message);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'An error occurred while processing your request.',
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};

//Update password api
const UpdatePassword = async (req: Request, res: Response) => {
  try {
    const email = req.user.email;
    console.log(email);
    const { newPassword } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found',
        code: httpStatus.NOT_FOUND,
      });
    }

    const newHashedPassword = await hashPassword(newPassword);

    user.password = newHashedPassword;
    await user.save();

    return res.status(httpStatus.OK).json({
      message: 'Password updated successfully',
      user,
    });
  } catch (error: any) {
    console.error('Error in changePassword:', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};

//verify password
const VerifyPassword = async (req: Request, res: Response) => {
  try {
    const email = req.user.email;

    const { currentPassword } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found',
        code: httpStatus.NOT_FOUND,
      });
    }

    // Compare provided password with stored hashed password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Incorrect current password' });
      return;
    }

    return res.status(httpStatus.OK).json({
      message: 'Password verified successfully',
      user,
    });
  } catch (error: any) {
    console.error('Error in changePassword:', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};

/* getProfileDetail ------- */

const getProfileDetail = async (req: Request, res: Response) => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find the user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found',
        code: httpStatus.NOT_FOUND,
      });
    }

    // Return success response with user data
    return res.status(httpStatus.OK).json({
      message: 'User found',
      user,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error.message);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};

//forget password
const forgotPasswordOTP = async (req: Request, res: Response) => {
  try {
    const email = req.user.email;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found',
        code: httpStatus.NOT_FOUND,
      });
    }
    const otp = generateOTP();
    const otpExpiry = getExpiryTime();
   
    const mailOption = {
      toEmail: email,
      subject: 'Account Verification OTP',
      otp
    };

    await sendEmail(mailOption);
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    return res.status(200).json({
      message: 'OTP send successfully',
      isRole: true,
      code: 200,
    });
  } catch (error: any) {
    console.error('send OTP:', error.message);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};




const getUserById = async (req: Request, res: Response) => {
  try {
    const userId: any = req.params.id; // Extract user ID from request parameters
    // Find the user by ID
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found',
        code: httpStatus.NOT_FOUND,
      });
    }
    // Return success response with user data
    return res
      .status(httpStatus.OK)
      .json({ message: 'User data fetched successfully!', data: user });
  } catch (error: any) {
    console.error('Error while Fetching details:', error.message);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};


export default {
    RegisterUser,
    LoginUser,
    VerifyOTP,
    ResendOTP,
    getProfileDetail,
    UpdatePassword ,
    UpdateUser,
    VerifyPassword,
    forgotPasswordOTP,
    getUserDetail,
    getUserById
  };
  