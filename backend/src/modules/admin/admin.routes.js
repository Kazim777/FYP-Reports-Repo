import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { parseId } from '../../lib/validation.js';
import { createFacultySchema, updateStatusSchema } from './admin.schema.js';
import * as adminController from './admin.controller.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.param('id', (req, res, next, id) => {
  req.userId = parseId(id);
  next();
});

router.get('/stats', adminController.stats);
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUser);
router.post('/users/faculty', validate(createFacultySchema), adminController.createFaculty);
router.post('/users/:id/reset-password', adminController.resetPassword);
router.patch('/users/:id/status', validate(updateStatusSchema), adminController.setStatus);
router.delete('/users/:id', adminController.deleteUser);

export default router;
