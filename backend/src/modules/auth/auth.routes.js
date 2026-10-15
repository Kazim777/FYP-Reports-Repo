import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { changePasswordSchema, loginSchema, registerSchema, updateAccountSchema } from './auth.schema.js';
import * as authController from './auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', requireAuth, authController.me);
router.patch('/me', requireAuth, validate(updateAccountSchema), authController.updateMe);
router.post('/change-password', requireAuth, validate(changePasswordSchema), authController.changePassword);

export default router;
