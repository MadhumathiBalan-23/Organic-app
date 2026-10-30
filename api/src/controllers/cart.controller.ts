import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';

export class CartController {
  public static async getCart(req: Request, res: Response) {
    try {
      const phoneNumber = (req.query.phoneNumber || req.query.phone || (req as any).user?.phoneNumber) as string;
      if (!phoneNumber) {
        return res.json({ success: true, count: 0, data: [] });
      }
      const cart = await CartService.getCart(phoneNumber);
      return res.json({ success: true, count: cart.length, data: cart });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async addToCart(req: Request, res: Response) {
    try {
      const { phoneNumber, phone, productId, qty } = req.body;
      const targetPhone = phoneNumber || phone || (req as any).user?.phoneNumber;
      if (!targetPhone) {
        return res.status(400).json({ success: false, error: 'phoneNumber is required' });
      }
      if (!productId) {
        return res.status(400).json({ success: false, error: 'productId is required' });
      }
      const cart = await CartService.addToCart(targetPhone, productId, qty || 1);
      return res.json({ success: true, message: 'Item added to cart', data: cart });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async updateQty(req: Request, res: Response) {
    try {
      const { phoneNumber, phone, productId, delta, qty } = req.body;
      const targetPhone = phoneNumber || phone || (req as any).user?.phoneNumber;
      const targetProductId = productId || req.params.productId;
      if (!targetPhone) {
        return res.status(400).json({ success: false, error: 'phoneNumber is required' });
      }
      if (!targetProductId) {
        return res.status(400).json({ success: false, error: 'productId is required' });
      }
      const cart = await CartService.updateQty(targetPhone, targetProductId, delta, qty);
      return res.json({ success: true, message: 'Cart updated', data: cart });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async removeItem(req: Request, res: Response) {
    try {
      const targetPhone = (req.query.phoneNumber || req.query.phone || req.body?.phoneNumber || (req as any).user?.phoneNumber) as string;
      const targetProductId = req.params.productId || req.body?.productId;
      if (!targetPhone) {
        return res.status(400).json({ success: false, error: 'phoneNumber is required' });
      }
      if (!targetProductId) {
        return res.status(400).json({ success: false, error: 'productId is required' });
      }
      const cart = await CartService.removeItem(targetPhone, targetProductId);
      return res.json({ success: true, message: 'Item removed from cart', data: cart });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async clearCart(req: Request, res: Response) {
    try {
      const targetPhone = (req.query.phoneNumber || req.query.phone || req.body?.phoneNumber || (req as any).user?.phoneNumber) as string;
      if (!targetPhone) {
        return res.status(400).json({ success: false, error: 'phoneNumber is required' });
      }
      await CartService.clearCart(targetPhone);
      return res.json({ success: true, message: 'Cart cleared successfully', data: [] });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async syncCart(req: Request, res: Response) {
    try {
      const { phoneNumber, phone, items } = req.body;
      const targetPhone = phoneNumber || phone || (req as any).user?.phoneNumber;
      if (!targetPhone) {
        return res.status(400).json({ success: false, error: 'phoneNumber is required' });
      }
      const cart = await CartService.syncCart(targetPhone, items || []);
      return res.json({ success: true, message: 'Cart synced successfully', data: cart });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}
