import { query } from '../config/db.js';

export async function getMyProfile(req, res, next) {
  try {
    const { rows } = await query('SELECT * FROM student_profiles WHERE user_id = $1', [req.user.id]);
    res.json({ profile: rows[0] || null });
  } catch (err) {
    next(err);
  }
}

// Skills / interests / technologies / domains are used later by partner search (FYP II)
export async function upsertMyProfile(req, res, next) {
  try {
    const {
      student_id, department, bio,
      skills = [], interests = [], technologies = [], domains = [],
    } = req.body;
    const { rows } = await query(
      `INSERT INTO student_profiles (user_id, student_id, department, bio, skills, interests, technologies, domains)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id) DO UPDATE SET
         student_id = EXCLUDED.student_id, department = EXCLUDED.department, bio = EXCLUDED.bio,
         skills = EXCLUDED.skills, interests = EXCLUDED.interests,
         technologies = EXCLUDED.technologies, domains = EXCLUDED.domains, updated_at = NOW()
       RETURNING *`,
      [req.user.id, student_id, department, bio, skills, interests, technologies, domains]
    );
    res.json({ profile: rows[0] });
  } catch (err) {
    next(err);
  }
}
