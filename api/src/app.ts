import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { requestLogger } from './middlewares/logger.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// Initialize Express App
const app: Application = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger);

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
