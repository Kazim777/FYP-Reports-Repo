import { parseId } from '../../lib/validation.js';
import * as projectService from './project.service.js';

export async function list(req, res) {
  res.json({ projects: await projectService.listProjects({ q: req.query.q }) });
}

export async function getOne(req, res) {
  res.json({ project: await projectService.getProject(parseId(req.params.id)) });
}

export async function create(req, res) {
  const project = await projectService.createProject(req.body, req.user.id);
  res.status(201).json({ project });
}

export async function update(req, res) {
  res.json({ project: await projectService.updateProject(parseId(req.params.id), req.body) });
}

export async function remove(req, res) {
  await projectService.deleteProject(parseId(req.params.id));
  res.status(204).end();
}
