import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/ApiError.js';
import { extractPdfText } from '../../lib/pdf.js';
import {
  MAX_PDF_SIZE_BYTES,
  MAX_PDF_SIZE_MB,
  createPdfUploadUrl,
  createPdfViewUrl,
  isReportPathOf,
  newReportPath,
  readStoredFile,
  removeStoredFile,
} from '../../lib/storage.js';
import { getProject } from './project.service.js';

const reportSummary = { select: { pageCount: true, wordCount: true, extractedAt: true } };

async function readPdf(buffer) {
  try {
    return await extractPdfText(buffer);
  } catch {
    throw ApiError.badRequest('This file could not be read as a PDF');
  }
}

export async function createUploadTarget(projectId) {
  await getProject(projectId);
  const pathname = newReportPath(projectId);
  return { pathname, uploadUrl: await createPdfUploadUrl(pathname), maxSizeMb: MAX_PDF_SIZE_MB };
}

export async function attachPdf(projectId, { pathname, fileName }) {
  if (!isReportPathOf(projectId, pathname)) throw ApiError.badRequest('Invalid upload reference');

  try {
    const project = await getProject(projectId);
    const file = await readStoredFile(pathname);
    if (!file) throw ApiError.badRequest('The uploaded file was not found. Please upload it again.');
    if (file.size > MAX_PDF_SIZE_BYTES) throw ApiError.badRequest(`PDF must be ${MAX_PDF_SIZE_MB} MB or smaller`);

    const { rawText, cleanedText, pageCount, wordCount, abstract, isReadable } = await readPdf(file.buffer);
    const reportText = { rawText, cleanedText, pageCount, wordCount, extractedAt: new Date() };
    const fillAbstract = !project.abstract && abstract;

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        pdfPath: pathname,
        pdfName: fileName,
        pdfSize: file.size,
        ...(fillAbstract && { abstract }),
        text: { upsert: { create: reportText, update: reportText } },
      },
      include: { text: reportSummary },
    });

    if (project.pdfPath !== pathname) await removeStoredFile(project.pdfPath);

    return {
      project: updated,
      extraction: { pageCount, wordCount, isReadable, abstractFilled: Boolean(fillAbstract) },
    };
  } catch (err) {
    await removeStoredFile(pathname);
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
  await removeStoredFile(project.pdfPath);
}

export async function getPdfViewUrl(projectId) {
  const project = await getProject(projectId);
  if (!project.pdfPath) throw ApiError.notFound('This project has no PDF');
  return createPdfViewUrl(project.pdfPath);
}
