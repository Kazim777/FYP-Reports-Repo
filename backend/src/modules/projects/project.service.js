import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/ApiError.js';
import { removeStoredFile } from '../../lib/storage.js';

const reportSummary = { select: { pageCount: true, wordCount: true, extractedAt: true } };

export function listProjects({ q } = {}) {
  const search = q?.trim();
  const contains = { contains: search, mode: 'insensitive' };

  return prisma.project.findMany({
    where: search
      ? {
          OR: [
            { title: contains },
            { abstract: contains },
            { domain: contains },
            { text: { is: { cleanedText: contains } } },
          ],
        }
      : undefined,
    orderBy: [{ year: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
  });
}

export async function getProject(id) {
  const project = await prisma.project.findUnique({ where: { id }, include: { text: reportSummary } });
  if (!project) throw ApiError.notFound('Project not found');
  return project;
}

export function createProject(data, uploadedById) {
  return prisma.project.create({ data: { ...data, uploadedById } });
}

export async function updateProject(id, data) {
  await getProject(id);
  return prisma.project.update({ where: { id }, data, include: { text: reportSummary } });
}

export async function deleteProject(id) {
  const project = await getProject(id);
  await prisma.project.delete({ where: { id } });
  await removeStoredFile(project.pdfPath);
}
