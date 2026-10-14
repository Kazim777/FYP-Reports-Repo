import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createProjectSchema, updateProjectSchema } from './project.schema.js';
import * as projectController from './project.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', projectController.list);
router.get('/:id', projectController.getOne);

router.post('/', requireRole('faculty'), validate(createProjectSchema), projectController.create);
router.put('/:id', requireRole('faculty'), validate(updateProjectSchema), projectController.update);
router.delete('/:id', requireRole('faculty'), projectController.remove);

export default router;
