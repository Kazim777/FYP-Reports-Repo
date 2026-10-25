import crypto from 'node:crypto';
import { del, get, issueSignedToken, presignUrl } from '@vercel/blob';

export const MAX_PDF_SIZE_MB = 15;
export const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

const PDF_CONTENT_TYPE = 'application/pdf';
const LINK_LIFETIME_MS = 10 * 60 * 1000;
const UUID_PATTERN = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

export const newReportPath = (projectId) => `reports/${projectId}/${crypto.randomUUID()}.pdf`;

export const isReportPathOf = (projectId, pathname) =>
  new RegExp(`^reports/${projectId}/${UUID_PATTERN}\\.pdf$`).test(pathname);

async function signUrl(pathname, operation, putOptions = {}) {
  const validUntil = Date.now() + LINK_LIFETIME_MS;
  const token = await issueSignedToken({ pathname, operations: [operation], validUntil, ...putOptions });
  const { presignedUrl } = await presignUrl(token, { operation, pathname, access: 'private', validUntil, ...putOptions });
  return presignedUrl;
}

export const createPdfUploadUrl = (pathname) =>
  signUrl(pathname, 'put', { allowedContentTypes: [PDF_CONTENT_TYPE], maximumSizeInBytes: MAX_PDF_SIZE_BYTES });

export const createPdfViewUrl = (pathname) => signUrl(pathname, 'get');

export async function readStoredFile(pathname) {
  const result = await get(pathname, { access: 'private', useCache: false });
  if (result?.statusCode !== 200) return null;
  return { buffer: Buffer.from(await new Response(result.stream).arrayBuffer()), size: result.blob.size };
}

export async function removeStoredFile(pathname) {
  if (!pathname) return;
  try {
    await del(pathname);
  } catch (err) {
    console.error(`Could not delete stored file ${pathname}:`, err.message);
  }
}
