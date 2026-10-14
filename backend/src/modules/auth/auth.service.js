import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/ApiError.js';
import { env } from '../../config/env.js';

const publicUser = { id: true, name: true, email: true, role: true, createdAt: true };

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export async function register({ name, email, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('Email already registered');

  const user = await prisma.user.create({
    data: { name, email, role, passwordHash: await bcrypt.hash(password, 10) },
    select: publicUser,
  });
  return { user, token: signToken(user) };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const { passwordHash, ...safeUser } = user;
  return { user: safeUser, token: signToken(user) };
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: publicUser });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}
