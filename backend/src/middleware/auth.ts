import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { createAuthError, createForbiddenError } from '../utils/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface AuthRequest extends Request {
  user?: any;
}

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      next();
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      req.user = null;
    } else {
      req.user = { userId: user.id, role: user.role };
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(createAuthError('Access denied. No token provided.'));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return next(createAuthError('Invalid token.'));
    }

    req.user = { userId: user.id, role: user.role };
    next();
  } catch (error) {
    next(createAuthError('Invalid token.'));
  }
};

export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await auth(req, res, () => {});
    
    if (req.user?.role !== 'admin') {
      return next(createForbiddenError('Access denied. Admin role required.'));
    }
    
    next();
  } catch (error) {
    next(createAuthError('Authentication failed.'));
  }
};