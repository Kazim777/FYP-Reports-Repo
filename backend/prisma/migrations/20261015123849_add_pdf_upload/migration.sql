/*
  Warnings:

  - Added the required column `page_count` to the `project_text` table without a default value. This is not possible if the table is not empty.
  - Added the required column `word_count` to the `project_text` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "project_text" ADD COLUMN     "page_count" INTEGER NOT NULL,
ADD COLUMN     "word_count" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "pdf_name" VARCHAR(255),
ADD COLUMN     "pdf_size" INTEGER;
