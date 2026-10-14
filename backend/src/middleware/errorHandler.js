import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '../lib/ApiError.js';

const PRISMA_ERRORS = {
  P2002: [409, 'A record with this value already exists'],
  P2025: [404, 'Record not found'],
};

export function notFound(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }

  if (err instanceof ZodError) {
    const issue = err.issues[0];
    const field = issue.path.join('.');
    return res.status(400).json({ message: field ? `${field}: ${issue.message}` : issue.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && PRISMA_ERRORS[err.code]) {
    const [status, message] = PRISMA_ERRORS[err.code];
    return res.status(status).json({ message });
  }

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}
