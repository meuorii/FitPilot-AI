import { Router } from 'express';
import { getMyGoals, updateMyGoals } from '../controllers/goals.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticateUser);
router.get('/me', getMyGoals);
router.put('/me', updateMyGoals);

export default router;