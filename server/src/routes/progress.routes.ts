import { Router } from 'express'
import {
  createProgressLog,
  deleteProgressLog,
  getProgressLogs,
  getProgressOverview,
} from '../controllers/progress.controller.js'
import { authenticateUser } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticateUser)

router.get('/overview', getProgressOverview)
router.get('/logs', getProgressLogs)
router.post('/logs', createProgressLog)
router.delete('/logs/:progressId', deleteProgressLog)

export default router
