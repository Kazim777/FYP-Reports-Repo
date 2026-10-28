import { z } from 'zod';
import { ApiError } from './ApiError.js';

export const optionalText = (max) =>
  z.string().trim().max(max).nullish().transform((value) => value || null);

export const tagList = z.array(z.string().trim().min(1).max(50)).max(30).default([]);

export function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw ApiError.badRequest('Invalid id');
  return id;
}

export const newPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be at most 100 characters')
  .regex(/[A-Za-z]/, 'Password must include at least one letter')
  .regex(/\d/, 'Password must include at least one number');

export const studentId = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9-]{3,20}$/, 'Enter a valid student ID (3–20 letters, numbers or hyphens)');
