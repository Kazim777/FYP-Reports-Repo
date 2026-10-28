import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createRateLimiter } from '../src/middleware/rateLimit.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

function appWithLimiter(limiter) {
  const app = express();
  app.use(express.json());
  app.post('/limited', limiter, (req, res) => res.json({ ok: true }));
  app.use(errorHandler);
  return app;
}

describe('rate limiting', () => {
  it('returns 429 with a RATE_LIMITED code once the limit is reached', async () => {
    const app = appWithLimiter(
      createRateLimiter({ windowMinutes: 15, limit: 2, message: 'Slow down', enabled: true })
    );

    await request(app).post('/limited').expect(200);
    await request(app).post('/limited').expect(200);
    const blocked = await request(app).post('/limited');

    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ message: 'Slow down', code: 'RATE_LIMITED' });
    expect(blocked.headers).toHaveProperty('ratelimit');
  });

  it('counts each key separately', async () => {
    const app = appWithLimiter(
      createRateLimiter({
        windowMinutes: 15,
        limit: 1,
        message: 'Slow down',
        enabled: true,
        keyGenerator: (req) => req.body.email,
      })
    );

    await request(app).post('/limited').send({ email: 'a@test.local' }).expect(200);
    await request(app).post('/limited').send({ email: 'b@test.local' }).expect(200);
    await request(app).post('/limited').send({ email: 'a@test.local' }).expect(429);
  });
});
