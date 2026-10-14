import { z } from 'zod';
import { optionalText, tagList } from '../../lib/validation.js';

export const createProjectSchema = z.object({
  title: z.string().trim().min(3).max(300),
  abstract: optionalText(5000),
  domain: optionalText(100),
  year: z.number().int().min(1990).max(2100).nullish(),
  supervisor: optionalText(120),
  teamMembers: tagList,
});

export const updateProjectSchema = createProjectSchema.partial();
