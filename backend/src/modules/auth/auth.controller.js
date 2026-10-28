import * as authService from './auth.service.js';
import { endSession, readSession, respondWithSession } from './session.service.js';

export async function register(req, res) {
  respondWithSession(res, await authService.register(req.body), 201);
}

export async function login(req, res) {
  respondWithSession(res, await authService.login(req.body));
}

export async function logout(req, res) {
  const session = readSession(req);
  if (session) await authService.logout(Number(session.sub));
  endSession(res);
  res.status(204).end();
}

export async function me(req, res) {
  res.json({ user: await authService.getUserById(req.user.id) });
}

export async function updateMe(req, res) {
  res.json({ user: await authService.updateAccount(req.user.id, req.body) });
}

export async function changePassword(req, res) {
  respondWithSession(res, await authService.changePassword(req.user.id, req.body));
}
