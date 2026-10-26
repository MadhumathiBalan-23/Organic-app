import { Request, Response } from 'express';
import { BannerService } from '../services/banner.service';

export class BannerController {
  public static async getActive(req: Request, res: Response) {
    try {
      const banners = await BannerService.getActiveBanners();
      return res.json({
        success: true,
        count: banners.length,
        data: banners,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async getAll(req: Request, res: Response) {
    try {
      const banners = await BannerService.getAllBanners();
      return res.json({
        success: true,
        count: banners.length,
        data: banners,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const banner = await BannerService.getBannerById(req.params.id);
      if (!banner) {
        return res.status(404).json({ success: false, message: 'Banner not found' });
      }
      return res.json({ success: true, data: banner });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const banner = await BannerService.createBanner(req.body);
      return res.status(201).json({ success: true, data: banner });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const banner = await BannerService.updateBanner(req.params.id, req.body);
      return res.json({ success: true, data: banner });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      await BannerService.deleteBanner(req.params.id);
      return res.json({ success: true, message: 'Banner deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}

export default BannerController;
