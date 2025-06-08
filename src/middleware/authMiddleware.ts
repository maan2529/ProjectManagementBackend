import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { verifyToken } from '../utils/tokenUtil'; // Assumes you have a utility to verify the JWT
import userModel from '../models/userModel';



declare global {
    namespace Express {
      interface Request {
        user: any;
      }
    }
  }

export const Authentication = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: 'Token not found.',
      code: httpStatus.UNAUTHORIZED,
    });
  }

   // Extract the token from the header
   let token: string | undefined;
   if (authHeader.startsWith('Bearer ')) {
     token = authHeader.split(' ')[1];
   } else {
     token = authHeader;
   }
 console.log(token);
   if (!token) {
     return res.status(httpStatus.UNAUTHORIZED).json({ 
       message: 'Token not found.',
       code: httpStatus.UNAUTHORIZED,
     });
   }

     try {
        // Verify the token (assuming your verifyToken returns a JwtPayload or throws an error)
        const decoded = verifyToken(token) as JwtPayload;
    
        if (decoded && decoded.id) {
          // Fetch the user from the database by decoded token ID
          const user = await userModel.findOne({ _id: decoded.id }).select(
            '-password',
          ); // Do not select the password
          if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({
              message: 'User not found.',
              code: httpStatus.UNAUTHORIZED,
            });
          }
    
          // Assign the user to the request object for use in next middleware/controllers
          req.user = user;
          return next();
        }
    
        // If token verification fails, return unauthorized
        return res.status(httpStatus.UNAUTHORIZED).json({
          message: 'Unauthorized - invalid token.',
          code: httpStatus.UNAUTHORIZED,
        });
      } catch (err) {
        // Log the error for debugging (optional)
        console.error('Token verification error:', err);
    
        // Return invalid token response
        return res.status(httpStatus.UNAUTHORIZED).json({
          message: 'Invalid token.',
          code: httpStatus.UNAUTHORIZED,
        });
      }
}; 