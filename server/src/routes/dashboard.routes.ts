import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticateUser);
router.get('/summary', getDashboardSummary);

export default router;