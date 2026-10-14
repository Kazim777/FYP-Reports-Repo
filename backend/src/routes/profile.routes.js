import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getMyProfile, upsertMyProfile } from '../controllers/profile.controller.js';

const router = Router();

router.get('/me', requireAuth, requireRole('student'), getMyProfile);
router.put('/me', requireAuth, requireRole('student'), upsertMyProfile);

export default router;
