import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const UPLOAD_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');

export const uploadPath = (fileName) => path.join(UPLOAD_DIR, path.basename(fileName));

export async function removeUpload(fileName) {
  if (fileName) await fs.rm(uploadPath(fileName), { force: true });
}
