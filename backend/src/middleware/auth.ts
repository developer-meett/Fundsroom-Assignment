import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies.jwt;
  
  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number, role: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource' });
      return;
    }
    
    next();
  };
};
