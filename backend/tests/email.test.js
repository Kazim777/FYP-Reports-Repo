import { afterAll, describe, expect, it } from 'vitest';
import {
  TEST_PASSWORD,
  cleanupTestUsers,
  createUser,
  emailsTo,
  loginAs,
  newAgent,
  prisma,
  registration,
  tokenFromLatestEmail,
  uniqueEmail,
} from './helpers.js';

afterAll(async () => {
  await cleanupTestUsers();
  await prisma.$disconnect();
});

const post = (path, body) => newAgent().post(`/api/auth${path}`).send(body);
const login = (email, password = TEST_PASSWORD) => post('/login', { email, password });

describe('email verification', () => {
  it('activates the account from the emailed link, once', async () => {
    const body = registration();
    await post('/register', body).expect(201);

    expect(emailsTo(body.email)).toHaveLength(1);
    expect((await login(body.email)).body.code).toBe('EMAIL_NOT_VERIFIED');

    const token = tokenFromLatestEmail(body.email);
    await post('/verify-email', { token }).expect(200);
    await login(body.email).expect(200);

    const reused = await post('/verify-email', { token });
    expect(reused.status).toBe(400);
    expect(reused.body.code).toBe('INVALID_TOKEN');
  });

  it('replaces the old link when a new one is requested', async () => {
    const body = registration();
    await post('/register', body).expect(201);
    const firstToken = tokenFromLatestEmail(body.email);

    await post('/resend-verification', { email: body.email }).expect(200);
    expect(emailsTo(body.email)).toHaveLength(2);

    await post('/verify-email', { token: firstToken }).expect(400);
    await post('/verify-email', { token: tokenFromLatestEmail(body.email) }).expect(200);
  });

  it('gives the same answer for unknown and already verified emails without sending anything', async () => {
    const active = await createUser();
    const unknownEmail = uniqueEmail('unknown');

    const forActive = await post('/resend-verification', { email: active.email }).expect(200);
    const forUnknown = await post('/resend-verification', { email: unknownEmail }).expect(200);

    expect(forActive.body).toEqual(forUnknown.body);
    expect(emailsTo(active.email)).toHaveLength(0);
    expect(emailsTo(unknownEmail)).toHaveLength(0);
  });

  it('rejects expired links', async () => {
    const body = registration();
    await post('/register', body).expect(201);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    await prisma.authToken.updateMany({ where: { userId: user.id }, data: { expiresAt: new Date(Date.now() - 1000) } });

    const res = await post('/verify-email', { token: tokenFromLatestEmail(body.email) });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_TOKEN');
  });
});

describe('password reset', () => {
  it('sets a new password, ends existing sessions and works only once', async () => {
    const user = await createUser();
    const oldSession = await loginAs(user);

    await post('/forgot-password', { email: user.email }).expect(200);
    const token = tokenFromLatestEmail(user.email);

    await post('/reset-password', { token, password: 'NewPassword9' }).expect(200);

    await login(user.email).expect(401);
    await login(user.email, 'NewPassword9').expect(200);
    await oldSession.get('/api/auth/me').expect(401);
    await post('/reset-password', { token, password: 'Another123' }).expect(400);
  });

  it('keeps the link usable when the new password is too weak', async () => {
    const user = await createUser();
    await post('/forgot-password', { email: user.email }).expect(200);
    const token = tokenFromLatestEmail(user.email);

    await post('/reset-password', { token, password: 'weak' }).expect(400);
    await post('/reset-password', { token, password: 'Stronger123' }).expect(200);
  });

  it('verifies the email of an unverified account', async () => {
    const user = await createUser({ status: 'pending' });
    await post('/forgot-password', { email: user.email }).expect(200);
    await post('/reset-password', { token: tokenFromLatestEmail(user.email), password: 'NewPassword9' }).expect(200);

    await login(user.email, 'NewPassword9').expect(200);
  });

  it('does not email unknown or deactivated accounts and answers the same way', async () => {
    const deactivated = await createUser({ status: 'deactivated' });
    const unknownEmail = uniqueEmail('unknown');

    const forDeactivated = await post('/forgot-password', { email: deactivated.email }).expect(200);
    const forUnknown = await post('/forgot-password', { email: unknownEmail }).expect(200);

    expect(forDeactivated.body).toEqual(forUnknown.body);
    expect(emailsTo(deactivated.email)).toHaveLength(0);
  });
});

describe('admin account status', () => {
  it('deactivates and reactivates an account', async () => {
    const admin = await loginAs(await createUser({ role: 'admin' }));
    const student = await createUser();
    const studentSession = await loginAs(student);

    const deactivated = await admin
      .patch(`/api/admin/users/${student.id}/status`)
      .send({ status: 'deactivated' })
      .expect(200);
    expect(deactivated.body.user.status).toBe('deactivated');
    await studentSession.get('/api/auth/me').expect(401);
    expect((await login(student.email)).body.code).toBe('ACCOUNT_DEACTIVATED');

    await admin.patch(`/api/admin/users/${student.id}/status`).send({ status: 'active' }).expect(200);
    await login(student.email).expect(200);
  });

  it('does not let admins change their own status', async () => {
    const adminUser = await createUser({ role: 'admin' });
    const admin = await loginAs(adminUser);

    await admin.patch(`/api/admin/users/${adminUser.id}/status`).send({ status: 'deactivated' }).expect(400);
  });
});
