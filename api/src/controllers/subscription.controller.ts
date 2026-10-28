import { Request, Response } from 'express';
import { SubscriptionService } from '../services/subscription.service';

export class SubscriptionController {
  public static async getAll(req: Request, res: Response) {
    try {
      const phoneNumber = (req.query.phoneNumber || req.query.phone || (req as any).user?.phoneNumber) as string | undefined;
      const formatted = await SubscriptionService.getAllSubscriptions(phoneNumber);
      return res.json({ success: true, count: formatted.length, data: formatted });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const newSub = await SubscriptionService.createSubscription(req.body);
      return res.status(201).json({ success: true, data: newSub });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const updated = await SubscriptionService.updateSubscription(req.params.id, req.body);
      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      await SubscriptionService.deleteSubscription(req.params.id);
      return res.json({ success: true, message: 'Subscription deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}
