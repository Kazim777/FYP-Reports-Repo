import { afterAll, describe, expect, it } from 'vitest';
import { cleanupTestUsers, createUser, loginAs, prisma, uniqueStudentId } from './helpers.js';

afterAll(async () => {
  await cleanupTestUsers();
  await prisma.$disconnect();
});

describe('student profile', () => {
  it('keeps partner and email visibility off unless the student turns them on', async () => {
    const agent = await loginAs(await createUser());
    const base = { studentId: uniqueStudentId(), skills: ['APIs'] };

    const saved = await agent.put('/api/profiles/me').send(base).expect(200);
    expect(saved.body.profile).toMatchObject({ lookingForPartner: false, showEmail: false });

    await agent.put('/api/profiles/me').send({ ...base, lookingForPartner: true, showEmail: true }).expect(200);
    const res = await agent.get('/api/profiles/me').expect(200);
    expect(res.body.profile).toMatchObject({ lookingForPartner: true, showEmail: true });
  });

  it('rejects toggles that are not true or false', async () => {
    const agent = await loginAs(await createUser());
    const res = await agent
      .put('/api/profiles/me')
      .send({ studentId: uniqueStudentId(), skills: ['APIs'], showEmail: 'yes' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/^showEmail:/);
  });
});

describe('faculty profile', () => {
  it('saves department, designation and research areas', async () => {
    const agent = await loginAs(await createUser({ role: 'faculty' }));
    const profile = {
      department: 'Computer Science',
      designation: 'Assistant Professor',
      researchAreas: ['Machine Learning', 'NLP'],
    };

    await agent.put('/api/profiles/me').send(profile).expect(200);
    const res = await agent.get('/api/profiles/me').expect(200);
    expect(res.body.profile).toMatchObject(profile);
  });

  it('ignores student-only fields', async () => {
    const agent = await loginAs(await createUser({ role: 'faculty' }));
    const res = await agent
      .put('/api/profiles/me')
      .send({ designation: 'Lecturer', studentId: uniqueStudentId(), showEmail: true })
      .expect(200);

    expect(res.body.profile).not.toHaveProperty('studentId');
    expect(res.body.profile).not.toHaveProperty('showEmail');
  });

  it('is not available to admins', async () => {
    const agent = await loginAs(await createUser({ role: 'admin' }));
    await agent.get('/api/profiles/me').expect(403);
  });
});

describe('admin user details', () => {
  it('shows an account together with its profile', async () => {
    const faculty = await createUser({ role: 'faculty' });
    await (await loginAs(faculty)).put('/api/profiles/me').send({ designation: 'Lecturer' }).expect(200);

    const admin = await loginAs(await createUser({ role: 'admin' }));
    const res = await admin.get(`/api/admin/users/${faculty.id}`).expect(200);

    expect(res.body.user).toMatchObject({ id: faculty.id, role: 'faculty', status: 'active' });
    expect(res.body.user).not.toHaveProperty('passwordHash');
    expect(res.body.profile).toMatchObject({ designation: 'Lecturer' });
  });

  it('returns 404 for an unknown user and 403 for non-admins', async () => {
    const admin = await loginAs(await createUser({ role: 'admin' }));
    await admin.get('/api/admin/users/999999999').expect(404);

    const student = await createUser();
    const studentAgent = await loginAs(student);
    await studentAgent.get(`/api/admin/users/${student.id}`).expect(403);
  });
});
