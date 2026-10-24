import { Request, Response } from 'express';
import { VendorService } from '../services/vendor.service';

export class VendorController {
  public static async submit(req: Request, res: Response) {
    try {
      const result = await VendorService.submitVendorRequest(req.body);

      if (result.alreadyApproved) {
        return res.json({
          success: true,
          message: result.message,
          status: result.status
        });
      }

      if (result.alreadyPending) {
        return res.json({
          success: true,
          message: result.message,
          data: result.data,
          status: result.status
        });
      }

      return res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
        status: result.status
      });
    } catch (error: any) {
      const status = error.message.includes('required') ? 400 : 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  }

  public static async getAll(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const requests = await VendorService.getVendorRequests(status ? String(status) : undefined);
      return res.json({ success: true, count: requests.length, data: requests });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async getStatus(req: Request, res: Response) {
    try {
      const result = await VendorService.getVendorStatusByPhone(req.params.phoneNumber);
      return res.json({
        success: true,
        phoneNumber: result.phoneNumber,
        status: result.status,
        isApproved: result.isApproved,
        request: result.request
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async approve(req: Request, res: Response) {
    try {
      const result = await VendorService.approveVendorRequest(req.params.id);
      return res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  }

  public static async reject(req: Request, res: Response) {
    try {
      const { reason } = req.body;
      const result = await VendorService.rejectVendorRequest(req.params.id, reason);
      return res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
