import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { parseMealText, logMeal, getTodayMeals, deleteMealLog } from '../controllers/meal.controller.js';

const router = Router();

router.use(authenticateUser);
router.post('/parse-ai', parseMealText);
router.post('/log', logMeal);
router.get('/today', getTodayMeals);
router.delete('/:mealId', deleteMealLog);

export default router;