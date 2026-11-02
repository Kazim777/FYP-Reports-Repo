import { z } from 'zod';
import { email, name } from '../auth/auth.schema.js';

export const createFacultySchema = z.object({ name, email });

export const listUsersQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  role: z.enum(['student', 'faculty', 'admin']).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['active', 'deactivated'], {
    errorMap: () => ({ message: 'Status must be active or deactivated' }),
  }),
});
