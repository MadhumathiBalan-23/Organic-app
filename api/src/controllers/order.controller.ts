import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';

export class OrderController {
  public static async getAll(req: Request, res: Response) {
    try {
      const phoneNumber = (req.query.phoneNumber || req.query.phone || (req as any).user?.phoneNumber) as string | undefined;
      const vendorId = (req.query.vendorId || req.query.vendor || (req as any).user?.vendorId) as string | undefined;
      const formatted = await OrderService.getAllOrders(phoneNumber, vendorId);
      return res.json({ success: true, count: formatted.length, data: formatted });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.json({ success: true, data: order });
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
      const vendorId = (req.query.vendorId || req.body.vendorId || (req as any).user?.vendorId) as string | undefined;
      const order = await OrderService.updateOrder(req.params.id, req.body, vendorId);
      return res.json({ success: true, data: order });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async verifyDeliveryOtp(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { otp } = req.body;
      const order = await OrderService.verifyDeliveryOtp(id, otp);
      return res.json({
        success: true,
        message: 'Delivery verified successfully with customer OTP! Order marked as DELIVERED.',
        data: order
      });
    } catch (error: any) {
      const status = error.status || 400;
      return res.status(status).json({ success: false, message: error.message });
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
