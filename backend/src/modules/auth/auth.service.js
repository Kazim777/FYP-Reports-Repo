import { prisma } from '../../lib/prisma.js';
import { ApiError, ErrorCode } from '../../lib/ApiError.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { assertStudentIdAvailable } from '../profiles/profile.service.js';

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

const PLACEHOLDER_PASSWORD_HASH = '$2b$10$izJQp.M/tXFi8xc69GJBpO5BPZO7ZpMpNVrv5UabhR4E71yH97UQO';

const BLOCKED_STATUSES = {
  pending: {
    code: ErrorCode.EMAIL_NOT_VERIFIED,
    message: 'Please verify your email address before logging in.',
  },
  deactivated: {
    code: ErrorCode.ACCOUNT_DEACTIVATED,
    message: 'Your account has been deactivated. Please contact the administrator.',
  },
};

export async function assertEmailAvailable(email) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('Email already registered');
}

export async function register({ name, email, studentId, password, avatar, skills, technologies, interests }) {
  await assertEmailAvailable(email);
  await assertStudentIdAvailable(studentId);

  return prisma.user.create({
    data: {
      name,
      email,
      role: 'student',
      avatar,
      passwordHash: await hashPassword(password),
      studentProfile: { create: { studentId, skills, technologies, interests } },
    },
    select: sessionUser,
  });
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = await verifyPassword(password, user?.passwordHash ?? PLACEHOLDER_PASSWORD_HASH);
  if (!user || !passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password', ErrorCode.INVALID_CREDENTIALS);
  }

  const blocked = BLOCKED_STATUSES[user.status];
  if (blocked) throw ApiError.forbidden(blocked.message, blocked.code);

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
