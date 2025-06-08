import Joi from "joi";

const registerValidate = Joi.object({
    userName: Joi.string().min(3).max(30),
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(255).required(),
    role: Joi.string().valid('student', 'guide', 'coordinator').required(),
    mobileNumber: Joi.string().optional(),
    college: Joi.string().min(3).max(100).required(),
    department: Joi.string().min(3).max(100).required(),
    // Conditional validations based on role
    roll_no: Joi.string().when('role', { 
      is: 'student', 
      then: Joi.string().required(),
      otherwise: Joi.optional()
    }),
    prn: Joi.string().when('role', { 
      is: 'student', 
      then: Joi.string().required(),
      otherwise: Joi.optional()
    }),

    division: Joi.string().when('role', { 
      is: 'student', 
      then: Joi.string().required(),
      otherwise: Joi.optional()
    }),
  
    facultyID: Joi.string().when('role', {
      is: Joi.valid('guide', 'coordinator'),
      then: Joi.string().required(),
      otherwise: Joi.optional()
    }),
  
    domain: Joi.string().when('role', {
      is: 'guide',
      then: Joi.string().required(),
      otherwise: Joi.optional()
    }),
  
    otp: Joi.number().optional(),
    otpExpiry: Joi.date().optional(),
    isVerified: Joi.boolean().optional(),
    passwordResetToken: Joi.string().optional(),
    passwordResetExpires: Joi.date().optional(),
    isDeleted: Joi.boolean().default(false),
  });
  
const loginValidation = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export default {
    registerValidate,
    loginValidation
}; 