import { Request, Response } from 'express';
import { BrandService } from '../services/brand.service';

export class BrandController {
  public static async getAll(req: Request, res: Response) {
    try {
      const brands = await BrandService.getAllBrands();
      return res.json({ success: true, count: brands.length, data: brands });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const brand = await BrandService.createBrand(req.body);
      return res.status(201).json({ success: true, data: brand });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const brand = await BrandService.updateBrand(req.params.id, req.body);
      return res.json({ success: true, data: brand });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      await BrandService.deleteBrand(req.params.id);
      return res.json({ success: true, message: 'Brand deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}
