import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/ApiError.js';

const profileModels = {
  student: prisma.studentProfile,
  faculty: prisma.facultyProfile,
};

export async function assertStudentIdAvailable(studentId, userId) {
  const owner = await prisma.studentProfile.findUnique({ where: { studentId }, select: { userId: true } });
  if (owner && owner.userId !== userId) throw ApiError.conflict('This student ID is already registered');
}

export function getProfile({ id, role }) {
  return profileModels[role].findUnique({ where: { userId: id } });
}

export async function saveProfile({ id, role }, data) {
  if (role === 'student') await assertStudentIdAvailable(data.studentId, id);

  return profileModels[role].upsert({
    where: { userId: id },
    create: { userId: id, ...data },
    update: data,
  });
}
