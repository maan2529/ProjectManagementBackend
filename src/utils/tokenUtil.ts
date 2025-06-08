import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

const secretKey: string = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (userId: string,username:string,role:string): string => {
    const options: SignOptions = {
        expiresIn: '30d',
    };
    return jwt.sign({ id: userId,username:username,role:role }, secretKey, options);
};

export const verifyToken = (token: string): JwtPayload | string | null| Object => {
    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        return null;
    }
};



