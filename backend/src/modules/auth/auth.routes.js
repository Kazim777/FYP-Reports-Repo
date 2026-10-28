import { Router } from 'express';
import { requireAuth, requireSession } from '../../middleware/auth.js';
import { loginRateLimit, registerRateLimit } from '../../middleware/rateLimit.js';
import { validate } from '../../middleware/validate.js';
import { changePasswordSchema, loginSchema, registerSchema, updateAccountSchema } from './auth.schema.js';
import * as authController from './auth.controller.js';

const router = Router();

router.post('/register', registerRateLimit, validate(registerSchema), authController.register);
router.post('/login', loginRateLimit, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

router.get('/me', requireSession, authController.me);
router.post('/change-password', requireSession, validate(changePasswordSchema), authController.changePassword);
router.patch('/me', requireAuth, validate(updateAccountSchema), authController.updateMe);

export default router;
