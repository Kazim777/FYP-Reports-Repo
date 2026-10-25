import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { parseId } from '../../lib/validation.js';
import { attachPdfSchema, createProjectSchema, updateProjectSchema } from './project.schema.js';
import * as projectController from './project.controller.js';

const router = Router();
const canManageProjects = requireRole('faculty', 'admin');

router.use(requireAuth);

router.param('id', (req, res, next, id) => {
  req.projectId = parseId(id);
  next();
});

router.get('/', projectController.list);
router.get('/:id', projectController.getOne);
router.get('/:id/pdf', projectController.viewPdf);

router.post('/', canManageProjects, validate(createProjectSchema), projectController.create);
router.put('/:id', canManageProjects, validate(updateProjectSchema), projectController.update);
router.delete('/:id', canManageProjects, projectController.remove);

router.post('/:id/pdf/upload-url', canManageProjects, projectController.createPdfUpload);
router.post('/:id/pdf', canManageProjects, validate(attachPdfSchema), projectController.attachPdf);
router.delete('/:id/pdf', canManageProjects, projectController.removePdf);

export default router;
