import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { env } from './config/env.js';

import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import mealRoutes from './routes/meal.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import workoutRoutes from './routes/workout.routes.js';
import coachRoutes from './routes/coach.routes.js';

const app: Application = express();

app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false, message: { success: false, error: 'Too Many Requests', message: 'Too many requests from this IP. Please try again after 15 minutes.' } });
app.use('/api', apiLimiter);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'online', system: 'FitPilot AI Node.js Engine', aiServiceEndpoint: env.HF_AI_SERVICE_URL, timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/meals', mealRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/coach', coachRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Not Found', message: `Cannot ${req.method} ${req.originalUrl}` });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`🔥 [Unhandled Error] ${req.method} ${req.url}:`, err.stack || err.message);
  res.status(500).json({ success: false, error: 'Internal Server Error', message: env.NODE_ENV === 'development' ? err.message : 'Something went wrong on the server' });
});

export default app;