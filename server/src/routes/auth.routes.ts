import { Router } from 'express';
import { register, login, completeOnboarding } from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/onboarding', authenticateUser, completeOnboarding);

export default router;