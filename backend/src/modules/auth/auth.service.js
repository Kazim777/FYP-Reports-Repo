import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/ApiError.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { env } from '../../config/env.js';

export const publicUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  mustChangePassword: true,
  createdAt: true,
};

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export async function assertEmailAvailable(email) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('Email already registered');
}

export async function register({ name, email, password, avatar, skills, technologies, interests }) {
  await assertEmailAvailable(email);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role: 'student',
      avatar,
      passwordHash: await hashPassword(password),
      profile: { create: { skills, technologies, interests } },
    },
    select: publicUser,
  });
  return { user, token: signToken(user) };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const { passwordHash, updatedAt, ...safeUser } = user;
  return { user: safeUser, token: signToken(user) };
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
    data: { passwordHash: await hashPassword(newPassword), mustChangePassword: false },
    select: publicUser,
  });
}
