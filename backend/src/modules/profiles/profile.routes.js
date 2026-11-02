import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { profileSchemas } from './profile.schema.js';
import * as profileController from './profile.controller.js';

const router = Router();

const validateProfile = (req, res, next) => validate(profileSchemas[req.user.role])(req, res, next);

router.use(requireAuth, requireRole('student', 'faculty'));

router.get('/me', profileController.getMine);
router.put('/me', validateProfile, profileController.saveMine);

export default router;
