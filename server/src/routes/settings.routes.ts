import type {
  NextFunction,
  Request,
  Response,
} from 'express'
import { Router } from 'express'
import multer from 'multer'

import {
  changePassword,
  getSettings,
  removeAvatar,
  updateAvatar,
  updateGoalSettings,
  updatePreferenceSettings,
  updateProfileSettings,
} from '../controllers/settings.controller.js'
import { authenticateUser } from '../middleware/auth.middleware.js'

const router = Router()

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
    ])

    if (
      allowedMimeTypes.has(file.mimetype)
    ) {
      cb(null, true)
      return
    }

    cb(
      new Error(
        'Only JPG, PNG, and WebP images are allowed.',
      ),
    )
  },
}).single('avatar')

const handleAvatarUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  avatarUpload(
    req,
    res,
    (error: unknown) => {
      if (!error) {
        next()
        return
      }

      const message =
        error instanceof multer.MulterError &&
        error.code === 'LIMIT_FILE_SIZE'
          ? 'Avatar image must be 5 MB or smaller.'
          : error instanceof Error
            ? error.message
            : 'Invalid avatar upload.'

      res.status(400).json({
        success: false,
        error: message,
      })
    },
  )
}

router.use(authenticateUser)

router.get('/', getSettings)

router.patch(
  '/avatar',
  handleAvatarUpload,
  updateAvatar,
)
router.delete('/avatar', removeAvatar)

router.patch(
  '/profile',
  updateProfileSettings,
)
router.patch(
  '/goals',
  updateGoalSettings,
)
router.patch(
  '/preferences',
  updatePreferenceSettings,
)
router.patch(
  '/password',
  changePassword,
)

export default router