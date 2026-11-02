import { z } from 'zod';
import { optionalText, studentId, tagList } from '../../lib/validation.js';

export const studentProfileSchema = z.object({
  studentId,
  department: optionalText(100),
  bio: optionalText(1000),
  skills: tagList.refine((skills) => skills.length > 0, 'Select at least one skill'),
  interests: tagList,
  technologies: tagList,
  domains: tagList,
  lookingForPartner: z.boolean().default(false),
  showEmail: z.boolean().default(false),
});

export const facultyProfileSchema = z.object({
  department: optionalText(100),
  designation: optionalText(100),
  researchAreas: tagList,
});

export const profileSchemas = {
  student: studentProfileSchema,
  faculty: facultyProfileSchema,
};
