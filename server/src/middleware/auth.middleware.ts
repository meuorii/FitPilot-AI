import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

interface DecodedToken {
  id: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;
    if (!token) { res.status(401).json({ success: false, error: 'Unauthorized', message: 'Missing, malformed, or empty Bearer token' }); return; }
    const decoded = jwt.verify(token, env.JWT_SECRET || process.env.JWT_SECRET || 'fallback_secret_key') as DecodedToken;
    if (!decoded?.id) { res.status(401).json({ success: false, error: 'Unauthorized', message: 'Invalid token payload' }); return; }
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) { res.status(401).json({ success: false, error: 'Unauthorized', message: 'Invalid or expired authentication token' }); return; }
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Authentication check failed' });
  }
};