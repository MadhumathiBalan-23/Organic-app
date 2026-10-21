import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Public health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    message: 'AgriFlow AI Backend Service is running smoothly',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[Server]: AgriFlow AI backend is listening at http://localhost:${PORT}`);
});
