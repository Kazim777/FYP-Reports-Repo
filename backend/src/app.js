import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './modules/auth/auth.routes.js';
import projectRoutes from './modules/projects/project.routes.js';
import profileRoutes from './modules/profiles/profile.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

const isDevLocalhost = (origin) =>
  process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin);

app.use(cors({
  origin: (origin, cb) => cb(null, !origin || origin === env.clientUrl || isDevLocalhost(origin)),
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/profiles', profileRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
