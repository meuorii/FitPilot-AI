import { Router } from 'express';
import { getRoutines, getExercises, createExercise, createCustomRoutine, logWorkoutSession, getWorkoutHistory } from '../controllers/workout.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateUser);
router.route('/exercises').get(getExercises).post(createExercise);
router.route('/routines').get(getRoutines).post(createCustomRoutine);
router.post('/sessions', logWorkoutSession);
router.get('/history', getWorkoutHistory);

export default router;