import app from './app';
import { config } from './config';
import { prisma } from './config/db';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`[Server]: AgriFlow AI backend is listening at http://localhost:${PORT}`);
  console.log(`[Server]: Health endpoint available at http://localhost:${PORT}/api/health`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[Server Warning]: Port ${PORT} is already in use by an active server.`);
    console.log(`[Server]: AgriFlow AI backend is already running on http://localhost:${PORT}`);
  } else {
    console.error('[Server Error]:', err);
  }
});

// Graceful Shutdown
const handleShutdown = async (signal: string) => {
  console.log(`\n[Server]: Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('[Server]: HTTP server closed.');
    await prisma.$disconnect();
    console.log('[Server]: Prisma database connection closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default server;
