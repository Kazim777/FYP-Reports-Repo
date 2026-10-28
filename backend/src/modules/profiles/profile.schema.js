import { z } from 'zod';
import { optionalText, studentId, tagList } from '../../lib/validation.js';

export const profileSchema = z.object({
  studentId,
  department: optionalText(100),
  bio: optionalText(1000),
  skills: tagList.refine((skills) => skills.length > 0, 'Select at least one skill'),
  interests: tagList,
  technologies: tagList,
  domains: tagList,
});
