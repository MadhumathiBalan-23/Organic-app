import os from 'os';
import app from './app';
import { config } from './config';
import { prisma } from './config/db';

const PORT = config.port;

const getNetworkIp = (): string => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[Server]: AgriFlow AI backend is listening on all interfaces at port ${PORT}`);
  console.log(`[Server]: Local:   http://localhost:${PORT}`);
  console.log(`[Server]: Network: http://${getNetworkIp()}:${PORT}`);
  console.log(`[Server]: Health:  http://localhost:${PORT}/api/health`);
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
