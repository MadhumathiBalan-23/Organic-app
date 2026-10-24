import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { config } from '../config';

const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export class AuthService {
  public static async sendOtp(phoneNumber: string) {
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      throw new Error('Please provide a valid 10-digit mobile number');
    }

    // Generate 4-digit OTP (1234 demo code or 4-digit random)
    const otp = ['9876543210', '9999999999', '8888888888'].includes(cleanPhone)
      ? '1234'
      : Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    otpStore.set(cleanPhone, { otp, expiresAt });

    // Customer login: ensure customer profile exists in Prisma DB
    await prisma.user.upsert({
      where: { phoneNumber: cleanPhone },
      update: {},
      create: {
        fullName: 'Organic Customer',
        phoneNumber: cleanPhone,
        role: 'customer',
        passwordHash: 'OTP_VERIFIED'
      }
    });

    console.log(`[Customer Auth OTP]: Sent OTP ${otp} to +91 ${cleanPhone}`);

    return {
      phoneNumber: cleanPhone,
      otp,
      role: 'customer'
    };
  }

  public static async verifyOtp(phoneNumber: string, otp: string) {
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    const cleanOtp = String(otp || '').trim();

    const record = otpStore.get(cleanPhone);
    const isValidDemo = cleanOtp === '1234';
    const isValidGenerated = record && record.otp === cleanOtp && record.expiresAt > Date.now();

    if (!isValidDemo && !isValidGenerated) {
      throw new Error('Invalid or expired OTP. Please enter 1234 or request a new OTP.');
    }

    otpStore.delete(cleanPhone);

    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone }
    });

    const isAdmin = cleanPhone === '9999999999' || user?.role === 'admin';
    const effectiveRole = isAdmin ? 'admin' : (user?.role === 'vendor' ? 'vendor' : 'customer');

    // Generate JWT Token
    const authToken = jwt.sign(
      {
        id: user?.id || (isAdmin ? 'usr-admin' : 'usr-customer'),
        phoneNumber: cleanPhone,
        role: effectiveRole,
        type: isAdmin ? 'ADMIN_TOKEN' : 'CUSTOMER_TOKEN'
      },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    console.log(`[Auth]: Verified +91 ${cleanPhone} -> Role: ${effectiveRole.toUpperCase()}`);

    return {
      isAdmin,
      token: authToken,
      role: effectiveRole,
      user: {
        id: user?.id || (isAdmin ? 'admin-super' : undefined),
        phoneNumber: cleanPhone,
        fullName: isAdmin ? 'Super Admin Jeena' : (user?.fullName || 'Organic Customer'),
        role: effectiveRole
      }
    };
  }

  public static async generateVendorToken(phoneNumber: string) {
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');

    if (!cleanPhone || cleanPhone.length !== 10) {
      const error: any = new Error('Valid 10-digit mobile number required for Vendor authentication.');
      error.status = 400;
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone }
    });

    const approvedReq = await prisma.vendorRequest.findFirst({
      where: { phoneNumber: cleanPhone, status: 'APPROVED' }
    });

    const isApproved = user?.role === 'vendor' || user?.vendorStatus === 'APPROVED' || approvedReq !== null;
    const isDemoBypass = cleanPhone === '8888888888';

    if (!isApproved && !isDemoBypass) {
      const error: any = new Error(`Vendor access denied for +91 ${cleanPhone}. Only mobile numbers approved by Admin have access to the Vendor Panel.`);
      error.status = 403;
      error.vendorStatus = user?.vendorStatus || 'NONE';
      throw error;
    }

    const vendorUser = await prisma.user.upsert({
      where: { phoneNumber: cleanPhone },
      update: { role: 'vendor', vendorStatus: 'APPROVED' },
      create: {
        fullName: user?.fullName || 'Organic Harvest Vendor',
        phoneNumber: cleanPhone.length === 10 ? cleanPhone : '8888888888',
        role: 'vendor',
        vendorStatus: 'APPROVED',
        passwordHash: 'OTP_VERIFIED',
        location: 'Salem Farm Hub, TN'
      }
    });

    const vendorToken = jwt.sign(
      {
        id: vendorUser.id,
        phoneNumber: vendorUser.phoneNumber,
        role: 'vendor',
        type: 'VENDOR_TOKEN'
      },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    console.log(`[Vendor Auth]: Generated Vendor Token for ${vendorUser.phoneNumber}`);

    return {
      token: vendorToken,
      role: 'vendor',
      user: {
        id: vendorUser.id,
        phoneNumber: vendorUser.phoneNumber,
        fullName: vendorUser.fullName,
        role: 'vendor'
      }
    };
  }
}
