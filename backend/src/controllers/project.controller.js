import { query } from '../config/db.js';

// GET /api/projects?q=keyword  (keyword search for FYP I)
export async function listProjects(req, res, next) {
  try {
    const q = req.query.q ? `%${req.query.q}%` : null;
    const { rows } = await query(
      `SELECT id, title, abstract, domain, year, supervisor, created_at
       FROM fyp_projects
       WHERE $1::text IS NULL OR title ILIKE $1 OR abstract ILIKE $1 OR domain ILIKE $1
       ORDER BY year DESC NULLS LAST, created_at DESC`,
      [q]
    );
    res.json({ projects: rows });
  } catch (err) {
    next(err);
  }
}

export async function getProject(req, res, next) {
  try {
    const { rows } = await query('SELECT * FROM fyp_projects WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Project not found' });
    res.json({ project: rows[0] });
  } catch (err) {
    next(err);
  }
}

// TODO (W7–9): accept PDF upload with multer and store pdf_path
export async function createProject(req, res, next) {
  try {
    const { title, abstract, domain, year, supervisor, team_members } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });
    const { rows } = await query(
      `INSERT INTO fyp_projects (title, abstract, domain, year, supervisor, team_members, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, abstract, domain, year, supervisor, team_members, req.user.id]
    );
    res.status(201).json({ project: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req, res, next) {
  try {
    const { title, abstract, domain, year, supervisor, team_members } = req.body;
    const { rows } = await query(
      `UPDATE fyp_projects SET
         title = COALESCE($1, title), abstract = COALESCE($2, abstract),
         domain = COALESCE($3, domain), year = COALESCE($4, year),
         supervisor = COALESCE($5, supervisor), team_members = COALESCE($6, team_members),
         updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title, abstract, domain, year, supervisor, team_members, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Project not found' });
    res.json({ project: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const { rowCount } = await query('DELETE FROM fyp_projects WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Project not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
