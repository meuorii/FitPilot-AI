import app from './app.js';
import { env } from './config/env.js';

const PORT = parseInt(env.PORT, 10);

const server = app.listen(PORT, () => {
  console.log(`
  =======================================================
  🚀 FitPilot AI Backend Server Active!
  =======================================================
  🔊 Listening on Port : ${PORT}
  🛠️ Environment     : ${env.NODE_ENV}
  🤖 AI Microservice : ${env.HF_AI_SERVICE_URL} (Qwen3-4B)
  📡 Health Check    : http://localhost:${PORT}/health
  =======================================================
  `);
});

// Graceful Shutdown Handler
const handleShutdown = (signal: string) => {
  console.log(`\n⚠️  Received ${signal}. Gracefully shutting down Express server...`);
  server.close(() => {
    console.log('✅ Express HTTP server closed successfully.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));