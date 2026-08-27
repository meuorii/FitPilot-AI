import { Router } from 'express';
import { register, verifyEmail, resendVerificationCode, login } from '../controllers/auth.controller.js';

const router = Router();
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);
router.post('/login', login);
export default router;