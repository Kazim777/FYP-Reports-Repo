import { Router } from 'express';
import { requireAuth, requireSession } from '../../middleware/auth.js';
import {
  emailRequestRateLimit,
  loginRateLimit,
  registerRateLimit,
  tokenRateLimit,
} from '../../middleware/rateLimit.js';
import { validate } from '../../middleware/validate.js';
import {
  changePasswordSchema,
  emailOnlySchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateAccountSchema,
  verifyEmailSchema,
} from './auth.schema.js';
import * as authController from './auth.controller.js';

const router = Router();

router.post('/register', registerRateLimit, validate(registerSchema), authController.register);
router.post('/verify-email', tokenRateLimit, validate(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', emailRequestRateLimit, validate(emailOnlySchema), authController.resendVerification);
router.post('/forgot-password', emailRequestRateLimit, validate(emailOnlySchema), authController.forgotPassword);
router.post('/reset-password', tokenRateLimit, validate(resetPasswordSchema), authController.resetPassword);

router.post('/login', loginRateLimit, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

router.get('/me', requireSession, authController.me);
router.post('/change-password', requireSession, validate(changePasswordSchema), authController.changePassword);
router.patch('/me', requireAuth, validate(updateAccountSchema), authController.updateMe);

export default router;
