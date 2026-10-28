import { prisma } from '../lib/prisma.js';
import { ApiError, ErrorCode } from '../lib/ApiError.js';
import { endSession, readSession } from '../modules/auth/session.service.js';

const sessionUserFields = { id: true, role: true, status: true, tokenVersion: true, mustChangePassword: true };

async function authenticate(req, res) {
  const session = readSession(req);
  const user = session
    ? await prisma.user.findUnique({ where: { id: Number(session.sub) }, select: sessionUserFields })
    : null;

  if (!user || user.tokenVersion !== session.ver || user.status !== 'active') {
    endSession(res);
    throw ApiError.unauthorized('Your session has ended. Please log in again.');
  }

  req.user = user;
}

export async function requireSession(req, res, next) {
  await authenticate(req, res);
  next();
}

export async function requireAuth(req, res, next) {
  await authenticate(req, res);
  if (req.user.mustChangePassword) {
    throw ApiError.forbidden('Please choose a new password to continue.', ErrorCode.PASSWORD_CHANGE_REQUIRED);
  }
  next();
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) throw ApiError.forbidden();
  next();
};
