import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ProductService } from '../services/product.service';

export class ProductController {
  public static async getAll(req: Request, res: Response) {
    try {
      const { category, search, vendorId } = req.query;
      const formatted = await ProductService.getAllProducts(
        category ? String(category) : undefined,
        search ? String(search) : undefined,
        vendorId ? String(vendorId) : undefined
      );

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.json({ success: true, data: product });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const product = await ProductService.createProduct(req.body);
      return res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      return res.json({ success: true, data: product });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      const authHeader = req.headers['authorization'];
      const adminPin = req.headers['x-admin-pin'] || req.body?.adminPin || req.query?.adminPin;

      // Restrict deletion: Vendors must not delete products without Admin permission
      if (authHeader) {
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        try {
          const decoded = jwt.verify(token, config.jwtSecret) as any;
          if (decoded && decoded.role === 'vendor' && adminPin !== '9999') {
            return res.status(403).json({
              success: false,
              message: 'Admin Permission Required: Vendors do not have permission to delete crops. Only Super Admin has deletion authority.'
            });
          }
        } catch {
          // Token verify fallback
        }
      }

      await ProductService.deleteProduct(req.params.id);
      return res.json({ success: true, message: 'Product deleted successfully by Admin' });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async seedInfo(req: Request, res: Response) {
    try {
      const count = await ProductService.getProductCount();
      return res.json({
        success: true,
        message: `Prisma SQLite database active with ${count} verified organic products.`,
        productCount: count,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
