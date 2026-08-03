import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { env } from './config/env.js';

const app: Application = express();

// 1. HTTP Request Logging (Logs incoming requests to console)
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// 2. Security & Core Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 3. Global Rate Limiting (Prevents API abuse)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' },
});
app.use('/api', apiLimiter);

// 4. Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    system: 'FitPilot AI Node.js Engine',
    aiServiceEndpoint: env.HF_AI_SERVICE_URL,
    timestamp: new Date().toISOString(),
  });
});

// 5. Global Error Handling Middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`🔥 [Unhandled Error] ${req.method} ${req.url}:`, err.stack || err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;