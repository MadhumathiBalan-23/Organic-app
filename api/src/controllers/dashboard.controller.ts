import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  public static async getStats(req: Request, res: Response) {
    try {
      const stats = await DashboardService.getStats();
      return res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
