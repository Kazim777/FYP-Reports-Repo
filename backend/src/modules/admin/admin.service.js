import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/ApiError.js';
import { generateTemporaryPassword, hashPassword } from '../../lib/password.js';
import { assertEmailAvailable, publicUser } from '../auth/auth.service.js';

export async function getStats() {
  const [roleCounts, projects, reports, recentUsers] = await Promise.all([
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    prisma.project.count(),
    prisma.project.count({ where: { pdfPath: { not: null } } }),
    prisma.user.findMany({ select: publicUser, orderBy: { createdAt: 'desc' }, take: 6 }),
  ]);

  const countFor = (role) => roleCounts.find((r) => r.role === role)?._count._all ?? 0;

  return {
    students: countFor('student'),
    faculty: countFor('faculty'),
    admins: countFor('admin'),
    projects,
    reports,
    recentUsers,
  };
}

export function listUsers({ q, role } = {}) {
  const contains = { contains: q, mode: 'insensitive' };

  return prisma.user.findMany({
    where: {
      ...(role && { role }),
      ...(q && { OR: [{ name: contains }, { email: contains }] }),
    },
    select: publicUser,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createFaculty({ name, email }) {
  await assertEmailAvailable(email);

  const temporaryPassword = generateTemporaryPassword();
  const user = await prisma.user.create({
    data: {
      name,
      email,
      role: 'faculty',
      mustChangePassword: true,
      passwordHash: await hashPassword(temporaryPassword),
    },
    select: publicUser,
  });

  return { user, temporaryPassword };
}

async function findOtherUser(id, adminId) {
  if (id === adminId) throw ApiError.badRequest('You cannot do this to your own account');
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function resetPassword(id, adminId) {
  await findOtherUser(id, adminId);

  const temporaryPassword = generateTemporaryPassword();
  const user = await prisma.user.update({
    where: { id },
    data: {
      passwordHash: await hashPassword(temporaryPassword),
      mustChangePassword: true,
      tokenVersion: { increment: 1 },
    },
    select: publicUser,
  });

  return { user, temporaryPassword };
}

export async function deleteUser(id, adminId) {
  await findOtherUser(id, adminId);
  await prisma.user.delete({ where: { id } });
}
