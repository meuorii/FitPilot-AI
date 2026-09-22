import { Router } from 'express'
import {
  changePassword,
  getSettings,
  updateGoalSettings,
  updatePreferenceSettings,
  updateProfileSettings,
} from '../controllers/settings.controller.js'
import { authenticateUser } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticateUser)

router.get('/', getSettings)
router.patch('/profile', updateProfileSettings)
router.patch('/goals', updateGoalSettings)
router.patch('/preferences', updatePreferenceSettings)
router.patch('/password', changePassword)

export default router
