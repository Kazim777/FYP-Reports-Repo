import * as authService from './auth.service.js';

export async function register(req, res) {
  res.status(201).json(await authService.register(req.body));
}

export async function login(req, res) {
  res.json(await authService.login(req.body));
}

export async function me(req, res) {
  res.json({ user: await authService.getUserById(req.user.id) });
}

export async function updateMe(req, res) {
  res.json({ user: await authService.updateAccount(req.user.id, req.body) });
}

export async function changePassword(req, res) {
  res.json({ user: await authService.changePassword(req.user.id, req.body) });
}
