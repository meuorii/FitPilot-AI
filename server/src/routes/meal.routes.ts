import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import {
  parseMealText,
  parseMealV2,
  logMeal,
  getTodayMeals,
  getYesterdayMeals,
  getMealsByDate,
  getWeeklyMeals,
  getMealHistory,
  deleteMealLog,
} from '../controllers/meal.controller.js';

const router = Router();

router.use(authenticateUser);

// Legacy HF-based parser (kept for backwards compatibility)
router.post('/parse-ai', parseMealText);

// New layered parser: table -> local food DB -> LLM fallback
router.post('/parse', parseMealV2);

router.post('/log', logMeal);

// Daily meal views
router.get('/today', getTodayMeals);
router.get('/yesterday', getYesterdayMeals);
router.get('/date/:date', getMealsByDate);

// Weekly + historical nutrition
router.get('/week', getWeeklyMeals);
router.get('/history', getMealHistory);

router.delete('/:mealId', deleteMealLog);

export default router;