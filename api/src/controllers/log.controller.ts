import { Request, Response } from 'express';
import { LogService } from '../services/log.service';

export class LogController {
  public static async getUserLogs(req: Request, res: Response) {
    try {
      const logs = await LogService.getUserLogs();
      return res.json({ success: true, count: logs.length, data: logs });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async getAIAlerts(req: Request, res: Response) {
    try {
      const alerts = await LogService.getAIAlerts();
      return res.json({ success: true, count: alerts.length, data: alerts });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const log = await LogService.createUserLog(req.body);
      return res.status(201).json({ success: true, data: log });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}
