import { Request, Response } from 'express';
import { DeliveryService } from '../services/delivery.service';

export class DeliveryController {
  public static async getAll(req: Request, res: Response) {
    try {
      const deliveries = await DeliveryService.getAllDeliveries();
      return res.json({ success: true, count: deliveries.length, data: deliveries });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const delivery = await DeliveryService.createDelivery(req.body);
      return res.status(201).json({ success: true, data: delivery });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const delivery = await DeliveryService.updateDelivery(req.params.id, req.body);
      return res.json({ success: true, data: delivery });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      await DeliveryService.deleteDelivery(req.params.id);
      return res.json({ success: true, message: 'Delivery deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}
