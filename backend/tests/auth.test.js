import { afterAll, describe, expect, it } from 'vitest';
import { TEST_PASSWORD, cleanupTestUsers, createUser, loginAs, newAgent, prisma, uniqueEmail } from './helpers.js';

afterAll(async () => {
  await cleanupTestUsers();
  await prisma.$disconnect();
});

describe('registration', () => {
  it('creates a student and starts a session in an httpOnly cookie', async () => {
    const agent = newAgent();
    const res = await agent
      .post('/api/auth/register')
      .send({ name: 'New Student', email: uniqueEmail('register'), password: TEST_PASSWORD, skills: ['APIs'] })
      .expect(201);

    expect(res.body.user.role).toBe('student');
    expect(res.body).not.toHaveProperty('token');
    expect(res.headers['set-cookie'][0]).toMatch(/fyp_session=.+HttpOnly/);
    await agent.get('/api/auth/me').expect(200);
  });
});

describe('login', () => {
  it('rejects a wrong password without revealing whether the email exists', async () => {
    const user = await createUser();
    const wrongPassword = await newAgent().post('/api/auth/login').send({ email: user.email, password: 'Wrong1234' });
    const unknownEmail = await newAgent().post('/api/auth/login').send({ email: uniqueEmail('missing'), password: 'Wrong1234' });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body).toEqual(unknownEmail.body);
    expect(wrongPassword.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('blocks accounts that have not verified their email', async () => {
    const user = await createUser({ status: 'pending' });
    const res = await newAgent().post('/api/auth/login').send({ email: user.email, password: TEST_PASSWORD });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('EMAIL_NOT_VERIFIED');
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('blocks deactivated accounts', async () => {
    const user = await createUser({ status: 'deactivated' });
    const res = await newAgent().post('/api/auth/login').send({ email: user.email, password: TEST_PASSWORD });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ACCOUNT_DEACTIVATED');
  });

  it('shows the status message only when the password is correct', async () => {
    const user = await createUser({ status: 'deactivated' });
    const res = await newAgent().post('/api/auth/login').send({ email: user.email, password: 'Wrong1234' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('sessions', () => {
  it('rejects requests without a session', async () => {
    const res = await newAgent().get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHENTICATED');
  });

  it('ends the session on logout, even for a copy of the old cookie', async () => {
    const user = await createUser();
    const agent = newAgent();
    const login = await agent.post('/api/auth/login').send({ email: user.email, password: TEST_PASSWORD }).expect(200);
    const sessionCookie = login.headers['set-cookie'][0].split(';')[0];

    await newAgent().get('/api/auth/me').set('Cookie', sessionCookie).expect(200);
    await agent.post('/api/auth/logout').expect(204);
    await newAgent().get('/api/auth/me').set('Cookie', sessionCookie).expect(401);
  });

  it('ends an existing session when the account is deactivated', async () => {
    const user = await createUser();
    const agent = await loginAs(user);

    await prisma.user.update({ where: { id: user.id }, data: { status: 'deactivated' } });

    const res = await agent.get('/api/projects');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHENTICATED');
  });
});

describe('forced password change', () => {
  it('allows only the password change until a new password is set', async () => {
    const agent = await loginAs(await createUser({ role: 'faculty', mustChangePassword: true }));

    const blocked = await agent.get('/api/projects');
    expect(blocked.status).toBe(403);
    expect(blocked.body.code).toBe('PASSWORD_CHANGE_REQUIRED');
    await agent.get('/api/auth/me').expect(200);

    const changed = await agent
      .post('/api/auth/change-password')
      .send({ currentPassword: TEST_PASSWORD, newPassword: 'BrandNew123' })
      .expect(200);

    expect(changed.body.user.mustChangePassword).toBe(false);
    await agent.get('/api/projects').expect(200);
  });
});

describe('role protection', () => {
  it('stops students from using admin routes', async () => {
    const agent = await loginAs(await createUser({ role: 'student' }));
    await agent.get('/api/admin/stats').expect(403);
  });

  it('lets admins use admin routes', async () => {
    const agent = await loginAs(await createUser({ role: 'admin' }));
    await agent.get('/api/admin/stats').expect(200);
  });
});
