import { Router } from 'express';
import { handleCoachChat } from '../controllers/coach.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/chat', authenticateUser, handleCoachChat);
export default router;