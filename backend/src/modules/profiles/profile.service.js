import { prisma } from '../../lib/prisma.js';

export function getProfile(userId) {
  return prisma.studentProfile.findUnique({ where: { userId } });
}

export function saveProfile(userId, data) {
  return prisma.studentProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}
