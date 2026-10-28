import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/ApiError.js';

export async function assertStudentIdAvailable(studentId, userId) {
  const owner = await prisma.studentProfile.findUnique({ where: { studentId }, select: { userId: true } });
  if (owner && owner.userId !== userId) throw ApiError.conflict('This student ID is already registered');
}

export function getProfile(userId) {
  return prisma.studentProfile.findUnique({ where: { userId } });
}

export async function saveProfile(userId, data) {
  await assertStudentIdAvailable(data.studentId, userId);

  return prisma.studentProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}
