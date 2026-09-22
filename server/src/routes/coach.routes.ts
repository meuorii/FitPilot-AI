import { Router } from 'express';
import {
  getCoachContext,
  handleCoachChat,
} from '../controllers/coach.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateUser);

router.get('/context', getCoachContext);
router.post('/chat', handleCoachChat);

export default router;