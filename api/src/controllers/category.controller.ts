import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

export class CategoryController {
  public static async getAll(req: Request, res: Response) {
    try {
      const categories = await CategoryService.getAllCategories();
      return res.json({ success: true, count: categories.length, data: categories });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const category = await CategoryService.createCategory(req.body);
      return res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const category = await CategoryService.updateCategory(req.params.id, req.body);
      return res.json({ success: true, data: category });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      await CategoryService.deleteCategory(req.params.id);
      return res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}
