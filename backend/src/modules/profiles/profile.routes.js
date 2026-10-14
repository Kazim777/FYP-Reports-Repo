import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { profileSchema } from './profile.schema.js';
import * as profileController from './profile.controller.js';

const router = Router();

router.use(requireAuth, requireRole('student'));

router.get('/me', profileController.getMine);
router.put('/me', validate(profileSchema), profileController.saveMine);

export default router;
