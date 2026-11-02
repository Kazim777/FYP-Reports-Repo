import * as authService from './auth.service.js';
import { endSession, readSession, respondWithSession } from './session.service.js';

const EMAIL_SENT_IF_ELIGIBLE = 'If an account matches that email, we have sent it a link. Please check your inbox.';

export async function register(req, res) {
  const { user, emailSent } = await authService.register(req.body);
  res.status(201).json({ email: user.email, emailSent });
}

export async function verifyEmail(req, res) {
  await authService.verifyEmail(req.body);
  res.json({ message: 'Your email address is verified. You can now log in.' });
}

export async function resendVerification(req, res) {
  await authService.resendVerification(req.body);
  res.json({ message: EMAIL_SENT_IF_ELIGIBLE });
}

export async function forgotPassword(req, res) {
  await authService.requestPasswordReset(req.body);
  res.json({ message: EMAIL_SENT_IF_ELIGIBLE });
}

export async function resetPassword(req, res) {
  await authService.resetPassword(req.body);
  res.json({ message: 'Your password has been reset. You can now log in with your new password.' });
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
