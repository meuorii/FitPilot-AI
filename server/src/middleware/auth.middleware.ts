import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

declare global {
  namespace Express {
    interface Request { user?: { id: string; email?: string } }
  }
}

const getBearerToken = (authorizationHeader: string | undefined): string | null => {
  if (!authorizationHeader) return null;
  const [scheme, token, ...extraParts] = authorizationHeader.trim().split(/\s+/);
  return (scheme?.toLowerCase() === 'bearer' && token && extraParts.length === 0) ? token : null;
};

export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
  const token = getBearerToken(req.get('authorization'));
  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized', message: 'Missing, malformed, or empty Bearer token' });
    return;
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof decoded === 'string' || typeof decoded.id !== 'string' || !decoded.id.trim()) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'Invalid token payload' });
      return;
    }
    req.user = { id: decoded.id, ...(typeof decoded.email === 'string' ? { email: decoded.email } : {}) };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'Authentication token has expired' });
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'Invalid authentication token' });
      return;
    }
    next(err);
  }
};