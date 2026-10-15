import { listUsersQuerySchema } from './admin.schema.js';
import * as adminService from './admin.service.js';

export async function stats(req, res) {
  res.json(await adminService.getStats());
}

export async function listUsers(req, res) {
  res.json({ users: await adminService.listUsers(listUsersQuerySchema.parse(req.query)) });
}

export async function createFaculty(req, res) {
  res.status(201).json(await adminService.createFaculty(req.body));
}

export async function resetPassword(req, res) {
  res.json(await adminService.resetPassword(req.userId, req.user.id));
}

export async function deleteUser(req, res) {
  await adminService.deleteUser(req.userId, req.user.id);
  res.status(204).end();
}
