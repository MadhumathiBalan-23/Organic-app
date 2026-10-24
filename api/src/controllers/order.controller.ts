import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';

export class OrderController {
  public static async getAll(req: Request, res: Response) {
    try {
      const formatted = await OrderService.getAllOrders();
      return res.json({ success: true, count: formatted.length, data: formatted });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const order = await OrderService.createOrder(req.body);
      return res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const order = await OrderService.updateOrder(req.params.id, req.body);
      return res.json({ success: true, data: order });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      await OrderService.deleteOrder(req.params.id);
      return res.json({ success: true, message: 'Order deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}
