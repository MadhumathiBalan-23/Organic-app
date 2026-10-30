import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  /**
   * Send OTP (60s timer, role-aware, rate-limited)
   */
  public static async sendOtp(req: Request, res: Response) {
    try {
      const { phoneNumber, role } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const result = await AuthService.sendOtp(phoneNumber, role || 'customer', ip);

      return res.json({
        success: true,
        message: `OTP sent successfully to +91 ${result.phoneNumber}`,
        phoneNumber: result.phoneNumber,
        expiresInSeconds: result.expiresInSeconds,
        expiresAt: result.expiresAt,
        role: result.role,
        otp: result.otp
      });
    } catch (error: any) {
      const status = error.status || (error.message.includes('valid 10-digit') ? 400 : 500);
      return res.status(status).json({
        success: false,
        message: error.message,
        waitSeconds: error.waitSeconds,
        lockoutSeconds: error.lockoutSeconds
      });
    }
  }

  /**
   * Verify OTP & Register Device (supports trustDevice)
   */
  public static async verifyOtp(req: Request, res: Response) {
    try {
      const { phoneNumber, otp, deviceInfo, trustDevice, role } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const result = await AuthService.verifyOtp({
        phoneNumber,
        otp,
        deviceInfo,
        trustDevice: trustDevice !== false, // default to true if opted in
        role: role || 'customer',
        ipAddress: ip
      });

      return res.json(result);
    } catch (error: any) {
      const status = error.status || 400;
      return res.status(status).json({
        success: false,
        message: error.message,
        remainingAttempts: error.remainingAttempts,
        lockoutSeconds: error.lockoutSeconds
      });
    }
  }

  /**
   * Refresh Token (Device-bound, rotated)
   */
  public static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken, deviceId, role } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const result = await AuthService.refreshToken({
        refreshToken,
        deviceId,
        expectedRole: role,
        ipAddress: ip
      });

      return res.json(result);
    } catch (error: any) {
      const status = error.status || 401;
      return res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get Current Authenticated User / Session
   */
  public static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated.' });
      }
      return res.json({
        success: true,
        user: req.user
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Logout current session/device
   */
  public static async logout(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.body.userId;
      const { deviceId, refreshToken } = req.body;
      if (!userId || !deviceId) {
        return res.status(400).json({ success: false, message: 'userId and deviceId required for logout.' });
      }
      const result = await AuthService.logout(userId, deviceId, refreshToken);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Logout all devices
   */
  public static async logoutAll(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.body.userId;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Authentication required.' });
      }
      const result = await AuthService.logoutAll(userId);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Device Management Handlers
   */
  public static async registerDevice(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.body.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'User ID required.' });
      const device = await AuthService.registerDevice(userId, req.body);
      return res.json({ success: true, device });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async getMyDevices(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || (req.query.userId as string);
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });
      const devices = await AuthService.getUserDevices(userId);
      return res.json({ success: true, devices });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async revokeDeviceTrust(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.body.userId;
      const { deviceId } = req.params;
      if (!userId || !deviceId) return res.status(400).json({ success: false, message: 'userId and deviceId required.' });
      const result = await AuthService.revokeDeviceTrust(userId, deviceId);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async deleteDevice(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.body.userId;
      const { deviceId } = req.params;
      if (!userId || !deviceId) return res.status(400).json({ success: false, message: 'userId and deviceId required.' });
      const result = await AuthService.deleteDevice(userId, deviceId);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ── Role-Specific Shortcuts ──

  public static async customerLogin(req: Request, res: Response) {
    req.body.role = 'customer';
    return AuthController.verifyOtp(req, res);
  }

  public static async customerRefresh(req: Request, res: Response) {
    req.body.role = 'customer';
    return AuthController.refreshToken(req, res);
  }

  public static async vendorLogin(req: Request, res: Response) {
    req.body.role = 'vendor';
    return AuthController.verifyOtp(req, res);
  }

  public static async vendorRefresh(req: Request, res: Response) {
    req.body.role = 'vendor';
    return AuthController.refreshToken(req, res);
  }

  public static async adminLogin(req: Request, res: Response) {
    req.body.role = 'admin';
    return AuthController.verifyOtp(req, res);
  }

  public static async adminRefresh(req: Request, res: Response) {
    req.body.role = 'admin';
    return AuthController.refreshToken(req, res);
  }
}
