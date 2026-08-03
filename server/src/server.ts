import app from './app.js';
import { env } from './config/env.js';

const PORT = parseInt(env.PORT, 10);

const server = app.listen(PORT, async () => {
  const timestamp = new Date().toISOString();
  
  // Clean, structured boot header
  console.log(`\n--------------------------------------------------`);
  console.log(`🚀 FitPilot AI Backend | ${env.NODE_ENV.toUpperCase()} MODE`);
  console.log(`--------------------------------------------------`);
  console.log(`• Server URL : http://localhost:${PORT}`);
  console.log(`• Health Check: http://localhost:${PORT}/health`);
  console.log(`• Timestamp   : ${timestamp}`);

  // Async connectivity check for the AI Service
  try {
    const aiResponse = await fetch(`${env.HF_AI_SERVICE_URL}/health`, { signal: AbortSignal.timeout(3000) }).catch(() => null);
    if (aiResponse?.ok) {
      console.log(`• AI Microservice: ONLINE [${env.HF_AI_SERVICE_URL}]`);
    } else {
      console.log(`• AI Microservice: OFFLINE [${env.HF_AI_SERVICE_URL}]`);
    }
  } catch (_err) {
    console.log(`• AI Microservice: UNREACHABLE [${env.HF_AI_SERVICE_URL}]`);
  }
  
  console.log(`--------------------------------------------------\n`);
});

// Graceful Shutdown Logging
const handleShutdown = (signal: string) => {
  console.log(`\n[SYSTEM] Received ${signal}. Closing server...`);
  server.close(() => {
    console.log('[SYSTEM] Express server shut down cleanly.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Unhandled Exception Catchers
process.on('unhandledRejection', (reason: unknown) => {
  console.error('[FATAL] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('[FATAL] Uncaught Exception:', error.message);
  process.exit(1);
});