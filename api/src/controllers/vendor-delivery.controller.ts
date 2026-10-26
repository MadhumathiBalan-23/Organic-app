import { Request, Response } from 'express';
import { VendorDeliveryService } from '../services/vendor-delivery.service';

export class VendorDeliveryController {
  public static async getSettings(req: Request, res: Response) {
    try {
      const { vendorPhone } = req.params;
      const settings = await VendorDeliveryService.getSettings(vendorPhone);
      return res.json({ success: true, data: settings });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async saveSettings(req: Request, res: Response) {
    try {
      const payload = req.body;
      if (!payload.vendorPhone) {
        return res.status(400).json({ success: false, message: 'Vendor phone number is required.' });
      }
      const updated = await VendorDeliveryService.saveSettings(payload);
      return res.json({
        success: true,
        message: 'Delivery radius and charges saved successfully.',
        data: updated
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  public static async calculateFee(req: Request, res: Response) {
    try {
      const { customerLat, customerLng, vendorPhone, orderSubtotal } = req.body;
      if (customerLat === undefined || customerLng === undefined) {
        return res.status(400).json({ success: false, message: 'Customer latitude and longitude required.' });
      }
      const result = await VendorDeliveryService.calculateFee(
        Number(customerLat),
        Number(customerLng),
        vendorPhone,
        orderSubtotal ? Number(orderSubtotal) : undefined
      );
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async getNearbyVendors(req: Request, res: Response) {
    try {
      const { lat, lng } = req.query;
      const latitude = Number(lat || 12.9716);
      const longitude = Number(lng || 77.5946);
      const vendors = await VendorDeliveryService.getEligibleVendors(latitude, longitude);
      return res.json({ success: true, data: vendors });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
