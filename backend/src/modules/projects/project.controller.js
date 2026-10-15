import * as projectService from './project.service.js';
import * as projectPdfService from './project-pdf.service.js';

export async function list(req, res) {
  res.json({ projects: await projectService.listProjects({ q: req.query.q }) });
}

export async function getOne(req, res) {
  res.json({ project: await projectService.getProject(req.projectId) });
}

export async function create(req, res) {
  const project = await projectService.createProject(req.body, req.user.id);
  res.status(201).json({ project });
}

export async function update(req, res) {
  res.json({ project: await projectService.updateProject(req.projectId, req.body) });
}

export async function remove(req, res) {
  await projectService.deleteProject(req.projectId);
  res.status(204).end();
}

export async function uploadPdf(req, res) {
  res.json(await projectPdfService.attachPdf(req.projectId, req.file));
}

export async function removePdf(req, res) {
  await projectPdfService.removePdf(req.projectId);
  res.status(204).end();
}

export async function viewPdf(req, res) {
  const { path, name } = await projectPdfService.getPdfFile(req.projectId);
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(name)}`);
  res.type('pdf').sendFile(path);
}
