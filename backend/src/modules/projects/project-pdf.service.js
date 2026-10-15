import fs from 'node:fs/promises';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/ApiError.js';
import { extractPdfText } from '../../lib/pdf.js';
import { removeUpload, uploadPath } from '../../lib/storage.js';
import { getProject } from './project.service.js';

async function readPdf(filePath) {
  try {
    return await extractPdfText(await fs.readFile(filePath));
  } catch {
    throw ApiError.badRequest('This file could not be read as a PDF');
  }
}

export async function attachPdf(projectId, file) {
  if (!file) throw ApiError.badRequest('Choose a PDF file to upload');

  try {
    const project = await getProject(projectId);
    const { rawText, cleanedText, pageCount, wordCount, abstract, isReadable } = await readPdf(file.path);
    const reportText = { rawText, cleanedText, pageCount, wordCount, extractedAt: new Date() };
    const fillAbstract = !project.abstract && abstract;

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        pdfPath: file.filename,
        pdfName: file.originalname,
        pdfSize: file.size,
        ...(fillAbstract && { abstract }),
        text: { upsert: { create: reportText, update: reportText } },
      },
      include: { text: { select: { pageCount: true, wordCount: true, extractedAt: true } } },
    });

    await removeUpload(project.pdfPath);

    return {
      project: updated,
      extraction: { pageCount, wordCount, isReadable, abstractFilled: Boolean(fillAbstract) },
    };
  } catch (err) {
    await removeUpload(file.filename);
    throw err;
  }
}

export async function removePdf(projectId) {
  const project = await getProject(projectId);
  if (!project.pdfPath) throw ApiError.notFound('This project has no PDF');

  await prisma.$transaction([
    prisma.projectText.deleteMany({ where: { projectId } }),
    prisma.project.update({ where: { id: projectId }, data: { pdfPath: null, pdfName: null, pdfSize: null } }),
  ]);
  await removeUpload(project.pdfPath);
}

export async function getPdfFile(projectId) {
  const project = await getProject(projectId);
  if (!project.pdfPath) throw ApiError.notFound('This project has no PDF');
  return { path: uploadPath(project.pdfPath), name: project.pdfName ?? `project-${projectId}.pdf` };
}
