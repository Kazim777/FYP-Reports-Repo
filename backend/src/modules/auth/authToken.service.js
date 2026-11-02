import crypto from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { ApiError, ErrorCode } from '../../lib/ApiError.js';

const MINUTE = 60 * 1000;

export const TOKEN_LIFETIME_MINUTES = {
  email_verification: 24 * 60,
  password_reset: 30,
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export async function issueToken(userId, type) {
  const token = crypto.randomBytes(32).toString('base64url');

  await prisma.$transaction([
    prisma.authToken.deleteMany({ where: { userId, type } }),
    prisma.authToken.create({
      data: {
        userId,
        type,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + TOKEN_LIFETIME_MINUTES[type] * MINUTE),
      },
    }),
  ]);

  return token;
}

export async function consumeToken(token, type) {
  const { count } = await prisma.authToken.updateMany({
    where: { tokenHash: hashToken(token), type, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });
  if (!count) throw ApiError.badRequest('This link is invalid or has expired.', ErrorCode.INVALID_TOKEN);

  const { userId } = await prisma.authToken.findUnique({ where: { tokenHash: hashToken(token) } });
  return userId;
}
