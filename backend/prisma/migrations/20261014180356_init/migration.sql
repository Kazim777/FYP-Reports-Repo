-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'faculty');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "user_id" INTEGER NOT NULL,
    "student_id" VARCHAR(20),
    "department" VARCHAR(100),
    "bio" TEXT,
    "skills" TEXT[],
    "interests" TEXT[],
    "technologies" TEXT[],
    "domains" TEXT[],
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "abstract" TEXT,
    "domain" VARCHAR(100),
    "year" INTEGER,
    "supervisor" VARCHAR(120),
    "team_members" TEXT[],
    "pdf_path" TEXT,
    "uploaded_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_text" (
    "project_id" INTEGER NOT NULL,
    "raw_text" TEXT,
    "cleaned_text" TEXT,
    "extracted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_text_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "project_embeddings" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "chunk_text" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "model_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "projects_domain_idx" ON "projects"("domain");

-- CreateIndex
CREATE INDEX "project_embeddings_project_id_idx" ON "project_embeddings"("project_id");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_text" ADD CONSTRAINT "project_text_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_embeddings" ADD CONSTRAINT "project_embeddings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
