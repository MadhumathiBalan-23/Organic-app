import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class HealthController {
  public static async checkHealth(req: Request, res: Response) {
    try {
      const productCount = await prisma.product.count();
      return res.json({
        status: 'UP',
        database: 'Prisma (SQLite)',
        productCount,
        message: 'AgriFlow AI Backend Service with Prisma ORM is running smoothly',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      return res.status(500).json({ status: 'DOWN', error: error.message });
    }
  }
}
