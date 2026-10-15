import { z } from 'zod';
import { AVATARS } from '../../lib/avatars.js';
import { tagList } from '../../lib/validation.js';

export const name = z.string().trim().min(2).max(120);
export const email = z.string().trim().toLowerCase().email();
const password = z.string().min(6).max(100);
const avatar = z
  .enum(AVATARS, { errorMap: () => ({ message: 'Choose one of the available avatars' }) })
  .nullish();

export const registerSchema = z.object({
  name,
  email,
  password,
  avatar,
  skills: tagList.refine((skills) => skills.length > 0, 'Select at least one skill'),
  technologies: tagList,
  interests: tagList,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1),
});

export const updateAccountSchema = z.object({ name, avatar }).partial();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: password,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ['newPassword'],
    message: 'New password must be different from the current one',
  });
