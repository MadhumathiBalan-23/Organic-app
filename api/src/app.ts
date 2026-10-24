import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import { requestLogger } from './middlewares/logger.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// Initialize Express App
const app: Application = express();

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(requestLogger);

// Serve static uploaded photos from device gallery
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AgriFlow AI Backend API',
    version: '1.0.0',
    description: 'Clean Microservice-Ready Architecture with Express & Prisma ORM',
    status: 'ONLINE',
    documentation: '/api/health'
  });
});

// Mount All Domain Routes under /api
app.use('/api', routes);

// 404 Route Handler
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
