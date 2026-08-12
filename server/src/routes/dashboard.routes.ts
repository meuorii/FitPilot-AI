import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateUser);
router.get('/summary', getDashboardSummary);

export default router;