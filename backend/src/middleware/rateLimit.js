import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';
import { ApiError } from '../lib/ApiError.js';

const MINUTE = 60 * 1000;

const clientIp = (req) => ipKeyGenerator(req.ip ?? '');

export function createRateLimiter({ windowMinutes, limit, message, keyGenerator = clientIp, enabled = !env.isTest }) {
  return rateLimit({
    windowMs: windowMinutes * MINUTE,
    limit,
    keyGenerator,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => !enabled,
    handler: (req, res, next) => next(ApiError.tooManyRequests(message)),
  });
}

const loginAttemptsPerAccount = createRateLimiter({
  windowMinutes: 15,
  limit: 10,
  keyGenerator: (req) => `${clientIp(req)}:${String(req.body?.email ?? '').trim().toLowerCase()}`,
  message: 'Too many login attempts for this account. Please wait 15 minutes and try again.',
});

const loginAttemptsPerNetwork = createRateLimiter({
  windowMinutes: 15,
  limit: 100,
  message: 'Too many login attempts from your network. Please wait a few minutes and try again.',
});

export const loginRateLimit = [loginAttemptsPerNetwork, loginAttemptsPerAccount];

export const registerRateLimit = createRateLimiter({
  windowMinutes: 60,
  limit: 20,
  message: 'Too many sign-up attempts from your network. Please try again later.',
});
