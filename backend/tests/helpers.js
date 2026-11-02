import crypto from 'node:crypto';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { hashPassword } from '../src/lib/password.js';
import { outbox } from '../src/lib/mailer.js';

export const TEST_PASSWORD = 'TestPass123';

const createdEmails = new Set();

export function uniqueEmail(label = 'user') {
  const email = `test.${label}.${crypto.randomUUID()}@test.local`;
  createdEmails.add(email);
  return email;
}

export const uniqueStudentId = () => `T-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

export const registration = (overrides = {}) => ({
  name: 'New Student',
  email: uniqueEmail('register'),
  studentId: uniqueStudentId(),
  password: TEST_PASSWORD,
  skills: ['APIs'],
  ...overrides,
});

export async function createUser({ role = 'student', status = 'active', mustChangePassword = false } = {}) {
  return prisma.user.create({
    data: {
      name: 'Test User',
      email: uniqueEmail(role),
      role,
      status,
      mustChangePassword,
      passwordHash: await hashPassword(TEST_PASSWORD),
    },
  });
}

export const newAgent = () => request.agent(app);

export async function loginAs(user) {
  const agent = newAgent();
  await agent.post('/api/auth/login').send({ email: user.email, password: TEST_PASSWORD }).expect(200);
  return agent;
}

export async function cleanupTestUsers() {
  await prisma.user.deleteMany({ where: { email: { in: [...createdEmails] } } });
  createdEmails.clear();
}

export function emailsTo(email) {
  return outbox.filter((message) => message.to === email);
}

export function tokenFromLatestEmail(email) {
  const message = emailsTo(email).at(-1);
  const link = message?.text.match(/https?:\/\/\S+/)?.[0];
  return link ? new URL(link).searchParams.get('token') : null;
}

export { app, outbox, prisma };
