import crypto from 'node:crypto';
import fs from 'node:fs';
import multer from 'multer';
import { ApiError } from '../lib/ApiError.js';
import { UPLOAD_DIR } from '../lib/storage.js';

export const MAX_PDF_SIZE_MB = 15;

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}.pdf`),
});

export const uploadPdf = multer({
  storage,
  limits: { fileSize: MAX_PDF_SIZE_MB * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(ApiError.badRequest('Only PDF files are allowed'));
  },
}).single('pdf');
