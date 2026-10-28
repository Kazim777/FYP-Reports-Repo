import { afterAll, describe, expect, it } from 'vitest';
import {
  TEST_PASSWORD,
  cleanupTestUsers,
  createUser,
  loginAs,
  newAgent,
  prisma,
  registration,
  uniqueStudentId,
} from './helpers.js';

afterAll(async () => {
  await cleanupTestUsers();
  await prisma.$disconnect();
});

const register = (body) => newAgent().post('/api/auth/register').send(body);

describe('student ID at registration', () => {
  it('is saved on the student profile in upper case', async () => {
    const studentId = uniqueStudentId();
    const res = await register(registration({ studentId: ` ${studentId.toLowerCase()} ` })).expect(201);

    const profile = await prisma.studentProfile.findUnique({ where: { userId: res.body.user.id } });
    expect(profile.studentId).toBe(studentId);
  });

  it('is required', async () => {
    const res = await register(registration({ studentId: undefined }));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/^studentId:/);
  });

  it('must be unique', async () => {
    const studentId = uniqueStudentId();
    await register(registration({ studentId })).expect(201);
    const res = await register(registration({ studentId: studentId.toLowerCase() }));

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('This student ID is already registered');
  });
});

describe('password rule', () => {
  it.each([
    ['shorter than 8 characters', 'abc123'],
    ['without a number', 'onlyletters'],
    ['without a letter', '12345678'],
  ])('rejects a password %s', async (_, password) => {
    const res = await register(registration({ password }));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/^password:/);
  });

  it('applies when changing a password', async () => {
    const agent = await loginAs(await createUser());
    const res = await agent
      .post('/api/auth/change-password')
      .send({ currentPassword: TEST_PASSWORD, newPassword: 'weakpass' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/^newPassword:/);
  });
});

describe('student ID on the profile', () => {
  const profile = (studentId) => ({ studentId, skills: ['APIs'] });

  it('can be kept or changed by its owner but not taken from someone else', async () => {
    const takenId = uniqueStudentId();
    await register(registration({ studentId: takenId })).expect(201);

    const agent = await loginAs(await createUser());
    const ownId = uniqueStudentId();
    await agent.put('/api/profiles/me').send(profile(ownId)).expect(200);
    await agent.put('/api/profiles/me').send(profile(ownId)).expect(200);

    const res = await agent.put('/api/profiles/me').send(profile(takenId));
    expect(res.status).toBe(409);
    expect(res.body.message).toBe('This student ID is already registered');
  });
});
