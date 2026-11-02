import * as profileService from './profile.service.js';

export async function getMine(req, res) {
  res.json({ profile: await profileService.getProfile(req.user) });
}

export async function saveMine(req, res) {
  res.json({ profile: await profileService.saveProfile(req.user, req.body) });
}
