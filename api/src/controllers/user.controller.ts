import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  public static async getAll(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      return res.json({ success: true, count: users.length, data: users });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async getProfile(req: Request, res: Response) {
    try {
      const profile = await UserService.getOrCreateProfile(req.params.phoneNumber);
      return res.json({ success: true, data: profile });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async updateProfile(req: Request, res: Response) {
    try {
      const updatedUser = await UserService.updateProfile(req.params.phoneNumber, req.body);
      return res.json({
        success: true,
        message: 'Profile updated successfully!',
        data: updatedUser
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
