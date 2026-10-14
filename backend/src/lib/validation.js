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
