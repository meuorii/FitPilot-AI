import { Router } from 'express';
import multer from 'multer';
import { getRoutines, getExercises, createExercise, createCustomRoutine, logWorkoutSession, getWorkoutHistory } from '../controllers/workout.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream';
    if (isImage) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!')); 
    }
  }
});

router.use(authenticateUser);
router.route('/exercises').get(getExercises).post(upload.single('image'), createExercise);
router.route('/routines').get(getRoutines).post(createCustomRoutine);
router.post('/sessions', logWorkoutSession);
router.get('/history', getWorkoutHistory);

export default router;