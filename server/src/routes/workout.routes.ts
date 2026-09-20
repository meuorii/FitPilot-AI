import { Router } from 'express';
import multer from 'multer';
import {
  getExercises,
  createExercise,
  getPreviousPerformance,
  getRoutines,
  getRoutine,
  createCustomRoutine,
  updateCustomRoutine,
  duplicateRoutine,
  deleteCustomRoutine,
  getSplits,
  getSplit,
  createSplit,
  updateSplit,
  activateSplit,
  duplicateSplit,
  duplicateSplitDay,
  deleteSplit,
  getTodayWorkout,
  getWorkoutOverview,
  getActiveWorkoutSession,
  startWorkoutSession,
  getWorkoutSession,
  logWorkoutSet,
  updateWorkoutSet,
  deleteWorkoutSet,
  getWorkoutProgress,
  completeWorkoutSession,
  abandonWorkoutSession,
  logWorkoutSession,
  getWorkoutHistory,
  getWorkoutHistoryItem,
} from '../controllers/workout.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream';
    if (isImage) cb(null, true);
    else cb(new Error('Only image files are allowed!'));
  },
});

router.use(authenticateUser);

// Exercise library + custom exercise creation
router.route('/exercises').get(getExercises).post(upload.single('image'), createExercise);
router.get('/exercises/:exerciseId/previous-performance', getPreviousPerformance);

// Custom routines
router.route('/routines').get(getRoutines).post(createCustomRoutine);
router.post('/routines/:routineId/duplicate', duplicateRoutine);
router.route('/routines/:routineId').get(getRoutine).patch(updateCustomRoutine).delete(deleteCustomRoutine);

// Workout splits
router.route('/splits').get(getSplits).post(createSplit);
router.post('/splits/:splitId/activate', activateSplit);
router.post('/splits/:splitId/duplicate', duplicateSplit);
router.post('/splits/:splitId/days/:dayId/duplicate', duplicateSplitDay);
router.route('/splits/:splitId').get(getSplit).patch(updateSplit).delete(deleteSplit);

// Workout home
router.get('/overview', getWorkoutOverview);
router.get('/today', getTodayWorkout);

// History routes are declared before the dynamic /sessions/:sessionId route.
router.get('/history', getWorkoutHistory);
router.get('/history/:sessionId', getWorkoutHistoryItem);

// Active workout lifecycle
router.get('/sessions/active', getActiveWorkoutSession);
router.post('/sessions/start', startWorkoutSession);

// Backward-compatible bulk logger
router.post('/sessions', logWorkoutSession);

router.post('/sessions/:sessionId/sets', logWorkoutSet);
router.patch('/sessions/:sessionId/sets/:setId', updateWorkoutSet);
router.delete('/sessions/:sessionId/sets/:setId', deleteWorkoutSet);
router.get('/sessions/:sessionId/progress', getWorkoutProgress);
router.post('/sessions/:sessionId/complete', completeWorkoutSession);
router.post('/sessions/:sessionId/abandon', abandonWorkoutSession);
router.get('/sessions/:sessionId', getWorkoutSession);

export default router;
