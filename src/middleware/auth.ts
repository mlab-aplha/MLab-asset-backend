import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as admin from 'firebase-admin';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'development-secret-key'
    ) as any;
    
    req.user = decoded;
    
    console.log(' Authenticated user:', decoded.email, 'Role:', decoded.role);

    next();
  } catch (error: any) {
    console.error('JWT verification error:', error.message);
    res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this resource`,
      });
    }

    next();
  };
};
