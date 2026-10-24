import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  public static async sendOtp(req: Request, res: Response) {
    try {
      const { phoneNumber } = req.body;
      const result = await AuthService.sendOtp(phoneNumber);

      return res.json({
        success: true,
        message: `OTP sent successfully to +91 ${result.phoneNumber}`,
        phoneNumber: result.phoneNumber,
        otp: result.otp, // included for seamless development & verification
        role: result.role
      });
    } catch (error: any) {
      const status = error.message.includes('valid 10-digit') ? 400 : 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  }

  public static async verifyOtp(req: Request, res: Response) {
    try {
      const { phoneNumber, otp } = req.body;
      const result = await AuthService.verifyOtp(phoneNumber, otp);

      return res.json({
        success: true,
        message: result.isAdmin
          ? 'Super Admin authenticated successfully!'
          : 'Mobile number verified successfully! Welcome to Mathira Organic Farming.',
        token: result.token,
        role: result.role,
        user: result.user
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async generateVendorToken(req: Request, res: Response) {
    try {
      const { phoneNumber } = req.body;
      const result = await AuthService.generateVendorToken(phoneNumber);

      return res.json({
        success: true,
        message: 'Vendor authentication successful. Switched to Vendor Portal.',
        token: result.token,
        role: result.role,
        user: result.user
      });
    } catch (error: any) {
      if (error.status === 403) {
        return res.status(403).json({
          success: false,
          message: error.message,
          status: error.vendorStatus || 'NONE'
        });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
