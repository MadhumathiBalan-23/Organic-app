import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {
  public static async getAll(req: Request, res: Response) {
    try {
      const { category, search } = req.query;
      const formatted = await ProductService.getAllProducts(
        category ? String(category) : undefined,
        search ? String(search) : undefined
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
      await ProductService.deleteProduct(req.params.id);
      return res.json({ success: true, message: 'Product deleted successfully' });
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
