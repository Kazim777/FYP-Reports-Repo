import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export const SESSION_COOKIE = 'fyp_session';
const SESSION_DURATION_SECONDS = 3 * 60 * 60;

const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax',
  path: '/',
};

export const toPublicUser = ({ tokenVersion, ...user }) => user;

export function startSession(res, user) {
  const claims = {
    sub: String(user.id),
    role: user.role,
    ver: user.tokenVersion,
    mcp: user.mustChangePassword,
  };
  const token = jwt.sign(claims, env.jwtSecret, { expiresIn: SESSION_DURATION_SECONDS });
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_DURATION_SECONDS * 1000 });
}

export function endSession(res) {
  res.clearCookie(SESSION_COOKIE, cookieOptions);
}

export function readSession(req) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch {
    return null;
  }
}

export function respondWithSession(res, user, status = 200) {
  startSession(res, user);
  res.status(status).json({ user: toPublicUser(user) });
}
