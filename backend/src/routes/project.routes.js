import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  listProjects, getProject, createProject, updateProject, deleteProject,
} from '../controllers/project.controller.js';

const router = Router();

// Students and faculty can browse / search
router.get('/', requireAuth, listProjects);
router.get('/:id', requireAuth, getProject);

// Only faculty manage FYP reports
router.post('/', requireAuth, requireRole('faculty'), createProject);
router.put('/:id', requireAuth, requireRole('faculty'), updateProject);
router.delete('/:id', requireAuth, requireRole('faculty'), deleteProject);

export default router;
