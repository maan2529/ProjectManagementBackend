import { Request, Response, NextFunction } from "express";
import userValidation from "../../validations/userValidation";

export const validateUserRegister = (req: Request, res: Response, next: NextFunction) => {
    const { error } = userValidation.registerValidate.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    next();
};

export const validateUserLogin = (req: Request, res: Response, next: NextFunction) => {
    const { error } = userValidation.loginValidation.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    next();
};