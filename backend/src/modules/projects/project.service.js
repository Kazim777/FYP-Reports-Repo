import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/ApiError.js';

export function listProjects({ q } = {}) {
  const search = q?.trim();
  const contains = { contains: search, mode: 'insensitive' };

  return prisma.project.findMany({
    where: search
      ? { OR: [{ title: contains }, { abstract: contains }, { domain: contains }] }
      : undefined,
    orderBy: [{ year: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
  });
}

export async function getProject(id) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw ApiError.notFound('Project not found');
  return project;
}

export function createProject(data, uploadedById) {
  return prisma.project.create({ data: { ...data, uploadedById } });
}

export async function updateProject(id, data) {
  await getProject(id);
  return prisma.project.update({ where: { id }, data });
}

export async function deleteProject(id) {
  await getProject(id);
  await prisma.project.delete({ where: { id } });
}
