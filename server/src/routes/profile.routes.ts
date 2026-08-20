import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { getMyProfile, updateMyProfile, calculateGoalOptions } from '../controllers/profile.controller.js';

const router = Router();
router.use(authenticateUser);
router.route('/me').get(getMyProfile).patch(updateMyProfile);
router.post('/calculate-goals', calculateGoalOptions);
export default router;