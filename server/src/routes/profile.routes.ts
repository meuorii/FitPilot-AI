import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { getMyProfile, updateMyProfile } from '../controllers/profile.controller.js';

const router = Router();
router.use(authenticateUser);
router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);

export default router;