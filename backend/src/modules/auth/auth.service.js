import { prisma } from '../../lib/prisma.js';
import { ApiError, ErrorCode } from '../../lib/ApiError.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';

export const publicUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  mustChangePassword: true,
  createdAt: true,
};

const sessionUser = { ...publicUser, tokenVersion: true };

export async function assertEmailAvailable(email) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('Email already registered');
}

export async function register({ name, email, password, avatar, skills, technologies, interests }) {
  await assertEmailAvailable(email);

  return prisma.user.create({
    data: {
      name,
      email,
      role: 'student',
      avatar,
      passwordHash: await hashPassword(password),
      studentProfile: { create: { skills, technologies, interests } },
    },
    select: sessionUser,
  });
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw ApiError.unauthorized('Invalid email or password', ErrorCode.INVALID_CREDENTIALS);
  }

  return prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
    select: sessionUser,
  });
}

export async function logout(userId) {
  await prisma.user.updateMany({ where: { id: userId }, data: { tokenVersion: { increment: 1 } } });
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: publicUser });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export function updateAccount(id, data) {
  return prisma.user.update({ where: { id }, data, select: publicUser });
}

export async function changePassword(id, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  return prisma.user.update({
    where: { id },
    data: {
      passwordHash: await hashPassword(newPassword),
      mustChangePassword: false,
      tokenVersion: { increment: 1 },
    },
    select: sessionUser,
  });
}
