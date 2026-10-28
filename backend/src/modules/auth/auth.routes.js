import { Router } from 'express';
import { requireAuth, requireSession } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { changePasswordSchema, loginSchema, registerSchema, updateAccountSchema } from './auth.schema.js';
import * as authController from './auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

router.get('/me', requireSession, authController.me);
router.post('/change-password', requireSession, validate(changePasswordSchema), authController.changePassword);
router.patch('/me', requireAuth, validate(updateAccountSchema), authController.updateMe);

export default router;
