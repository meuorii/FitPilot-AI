import app from './app.js';
import { env } from './config/env.js';

const PORT = parseInt(env.PORT, 10);

const server = app.listen(PORT, async () => {
  const timestamp = new Date().toISOString();
  const aiBaseUrl = env.HF_AI_SERVICE_URL.replace(/\/+$/, '');
  console.log(`\n--------------------------------------------------\n🚀 FitPilot AI Backend | ${env.NODE_ENV.toUpperCase()} MODE\n--------------------------------------------------`);
  console.log(`• Server URL   : http://localhost:${PORT}\n• Health Check : http://localhost:${PORT}/health\n• Timestamp    : ${timestamp}`);
  try {
    const aiResponse = await fetch(`${aiBaseUrl}/health`, { signal: AbortSignal.timeout(3000) }).catch(() => null);
    console.log(`• AI Service   : ${aiResponse?.ok ? 'ONLINE' : 'OFFLINE'} [${aiBaseUrl}]`);
  } catch {
    console.log(`• AI Service   : UNREACHABLE [${aiBaseUrl}]`);
  }
  console.log(`--------------------------------------------------\n`);
});

const handleShutdown = (signal: string) => {
  console.log(`\n[SYSTEM] Received ${signal}. Closing server...`);
  server.close(() => { console.log('[SYSTEM] Express server shut down cleanly.'); process.exit(0); });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('unhandledRejection', (reason: unknown) => console.error('[FATAL] Unhandled Promise Rejection:', reason));
process.on('uncaughtException', (error: Error) => { console.error('[FATAL] Uncaught Exception:', error.message); process.exit(1); });