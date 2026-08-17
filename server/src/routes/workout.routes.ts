import { Router } from 'express';
import multer from 'multer';
import { getRoutines, getExercises, createExercise, createCustomRoutine, logWorkoutSession, getWorkoutHistory } from '../controllers/workout.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/'))
});

router.use(authenticateUser);
router.route('/exercises').get(getExercises).post(upload.single('image'), createExercise);
router.route('/routines').get(getRoutines).post(createCustomRoutine);
router.post('/sessions', logWorkoutSession);
router.get('/history', getWorkoutHistory);

export default router;