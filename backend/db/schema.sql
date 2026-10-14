-- FYP Repository & Research Intelligence System — PostgreSQL schema (FYP I)

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Used by FYP partner search in FYP II
CREATE TABLE IF NOT EXISTS student_profiles (
  user_id      INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  student_id   VARCHAR(20),
  department   VARCHAR(100),
  bio          TEXT,
  skills       TEXT[] NOT NULL DEFAULT '{}',
  interests    TEXT[] NOT NULL DEFAULT '{}',
  technologies TEXT[] NOT NULL DEFAULT '{}',
  domains      TEXT[] NOT NULL DEFAULT '{}',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Past FYP reports uploaded by faculty
CREATE TABLE IF NOT EXISTS fyp_projects (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(300) NOT NULL,
  abstract     TEXT,
  domain       VARCHAR(100),
  year         INTEGER,
  supervisor   VARCHAR(120),
  team_members TEXT,
  pdf_path     TEXT,
  uploaded_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Text extracted from the PDF (PDF ingestion pipeline, W8–10)
CREATE TABLE IF NOT EXISTS project_text (
  project_id   INTEGER PRIMARY KEY REFERENCES fyp_projects(id) ON DELETE CASCADE,
  raw_text     TEXT,
  cleaned_text TEXT,
  extracted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FYP II: sentence embeddings. Switch the column to vector(384) once pgvector is installed.
CREATE TABLE IF NOT EXISTS project_embeddings (
  id         SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES fyp_projects(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  embedding  REAL[] NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_title     ON fyp_projects (title);
CREATE INDEX IF NOT EXISTS idx_projects_domain    ON fyp_projects (domain);
CREATE INDEX IF NOT EXISTS idx_embeddings_project ON project_embeddings (project_id);
