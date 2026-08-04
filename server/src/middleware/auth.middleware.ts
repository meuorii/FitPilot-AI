import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

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

export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;
    if (!token) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'Missing, malformed, or empty Bearer token' });
      return;
    }
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'Invalid or expired authentication token' });
      return;
    }
    req.user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Authentication check failed' });
  }
};