import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes.js';
import projectRoutes from './modules/projects/project.routes.js';
import profileRoutes from './modules/profiles/profile.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
