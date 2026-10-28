import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { config } from '../config';

interface OtpChallenge {
  otp: string;
  expiresAt: number;
  failedAttempts: number;
  lockoutUntil: number | null;
  lastSentAt: number;
}

interface TrustedDevice {
  deviceId: string;
  phoneNumber: string;
  deviceModel?: string;
  platform?: string;
  trustedUntil: number;
  lastLoginAt: number;
}

const MAX_OTP_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RESEND_COOLDOWN_MS = 60 * 1000;       // 60 seconds
const OTP_VALIDITY_MS = 5 * 60 * 1000;       // 5 minutes
const TRUSTED_DEVICE_DAYS = 30;

const otpStore = new Map<string, OtpChallenge>();
const trustedDevices = new Map<string, TrustedDevice>();

export class AuthService {
  public static async sendOtp(phoneNumber: string) {
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      throw new Error('Please provide a valid 10-digit mobile number');
    }

    const now = Date.now();
    const existing = otpStore.get(cleanPhone);

    // 1. Check if user is currently locked out
    if (existing && existing.lockoutUntil && existing.lockoutUntil > now) {
      const remainingSeconds = Math.ceil((existing.lockoutUntil - now) / 1000);
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      const err: any = new Error(
        `Account temporarily locked due to multiple failed attempts. Try again in ${remainingMinutes} min (${remainingSeconds}s).`
      );
      err.status = 429;
      err.lockoutSeconds = remainingSeconds;
      throw err;
    }

    // 2. Check resend cooldown
    if (existing && existing.lastSentAt && (now - existing.lastSentAt) < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
      const err: any = new Error(`Please wait ${waitSeconds} seconds before requesting a new OTP.`);
      err.status = 429;
      err.waitSeconds = waitSeconds;
      throw err;
    }

    // 3. Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = now + OTP_VALIDITY_MS;

    otpStore.set(cleanPhone, {
      otp,
      expiresAt,
      failedAttempts: 0,
      lockoutUntil: null,
      lastSentAt: now
    });

    // Best-effort database upsert
    try {
      await prisma.user.upsert({
        where: { phoneNumber: cleanPhone },
        update: {},
        create: {
          fullName: 'Customer',
          phoneNumber: cleanPhone,
          role: 'customer',
          passwordHash: 'OTP_VERIFIED'
        }
      });
    } catch {
      // Continue with in-memory persistence if database is unavailable
    }

    return {
      phoneNumber: cleanPhone,
      otp,
      expiresInSeconds: 300,
      role: 'customer'
    };
  }

  public static async verifyOtp(
    phoneNumber: string, 
    otp: string, 
    deviceInfo?: { deviceId?: string; deviceModel?: string; platform?: string }
  ) {
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    const cleanOtp = String(otp || '').trim();
    const now = Date.now();

    const record = otpStore.get(cleanPhone);

    // 1. Check if temporarily locked out
    if (record && record.lockoutUntil && record.lockoutUntil > now) {
      const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
      const err: any = new Error(
        `Account locked for ${Math.ceil(remainingSeconds / 60)} more minutes due to 3 failed attempts.`
      );
      err.status = 429;
      err.lockoutSeconds = remainingSeconds;
      throw err;
    }

    const isValidGenerated = Boolean(record && record.otp === cleanOtp && record.expiresAt > now);

    if (!isValidGenerated) {
      // Increment failed attempts
      const currentAttempts = (record ? record.failedAttempts : 0) + 1;
      const remaining = Math.max(0, MAX_OTP_ATTEMPTS - currentAttempts);

      if (currentAttempts >= MAX_OTP_ATTEMPTS) {
        const lockoutUntil = now + LOCKOUT_DURATION_MS;
        if (record) {
          record.failedAttempts = currentAttempts;
          record.lockoutUntil = lockoutUntil;
        } else {
          otpStore.set(cleanPhone, {
            otp: '',
            expiresAt: 0,
            failedAttempts: currentAttempts,
            lockoutUntil,
            lastSentAt: now
          });
        }
        const err: any = new Error(
          'Maximum 3 incorrect verification attempts exceeded. Account is locked for 15 minutes.'
        );
        err.status = 429;
        err.lockoutSeconds = 15 * 60;
        err.remainingAttempts = 0;
        throw err;
      }

      if (record) {
        record.failedAttempts = currentAttempts;
      }

      const err: any = new Error(
        `Invalid or expired OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before 15-min lockout.`
      );
      err.status = 400;
      err.remainingAttempts = remaining;
      throw err;
    }

    // OTP Verified successfully: clear challenge
    otpStore.delete(cleanPhone);

    // Device Registration & Trust Token
    const deviceId = deviceInfo?.deviceId || `dev_${cleanPhone}_${Date.now()}`;
    const trustedUntil = now + (TRUSTED_DEVICE_DAYS * 24 * 60 * 60 * 1000);
    
    trustedDevices.set(`${cleanPhone}_${deviceId}`, {
      deviceId,
      phoneNumber: cleanPhone,
      deviceModel: deviceInfo?.deviceModel || 'Android Device',
      platform: deviceInfo?.platform || 'android',
      trustedUntil,
      lastLoginAt: now
    });

    let user: any = null;
    try {
      user = await prisma.user.findUnique({ where: { phoneNumber: cleanPhone } });
    } catch {}

    const isAdmin = user?.role === 'admin';
    const effectiveRole = isAdmin ? 'admin' : (user?.role === 'vendor' ? 'vendor' : 'customer');

    const authToken = jwt.sign(
      {
        id: user?.id || (isAdmin ? 'usr-admin' : 'usr-customer'),
        phoneNumber: cleanPhone,
        role: effectiveRole,
        deviceId,
        type: isAdmin ? 'ADMIN_TOKEN' : 'CUSTOMER_TOKEN'
      },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    return {
      isAdmin,
      token: authToken,
      role: effectiveRole,
      deviceId,
      trustedUntil,
      user: {
        id: user?.id || (isAdmin ? 'admin-user' : 'usr-customer'),
        phoneNumber: cleanPhone,
        fullName: user?.fullName || (isAdmin ? 'Admin' : 'Customer'),
        role: effectiveRole,
        location: user?.location || ''
      }
    };
  }

  public static async verifyTrustedDevice(phoneNumber: string, deviceId: string) {
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    const key = `${cleanPhone}_${deviceId}`;
    const dev = trustedDevices.get(key);

    if (dev && dev.trustedUntil > Date.now()) {
      dev.lastLoginAt = Date.now();
      return { isTrusted: true, device: dev };
    }
    return { isTrusted: false };
  }

  public static async revokeTrustedDevice(phoneNumber: string, deviceId: string) {
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    const key = `${cleanPhone}_${deviceId}`;
    trustedDevices.delete(key);
    return { success: true };
  }

  public static async generateVendorToken(phoneNumber: string) {
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');

    if (!cleanPhone || cleanPhone.length !== 10) {
      const error: any = new Error('Valid 10-digit mobile number required for Vendor authentication.');
      error.status = 400;
      throw error;
    }

    let user: any = null;
    let approvedReq: any = null;
    try {
      user = await prisma.user.findUnique({ where: { phoneNumber: cleanPhone } });
      approvedReq = await prisma.vendorRequest.findFirst({
        where: { phoneNumber: cleanPhone, status: 'APPROVED' }
      });
    } catch {}

    const isApproved = user?.role === 'vendor' || user?.vendorStatus === 'APPROVED' || approvedReq !== null;

    if (!isApproved) {
      const error: any = new Error(
        `Vendor access denied for +91 ${cleanPhone}. Only mobile numbers approved by Admin have access to the Vendor Panel.`
      );
      error.status = 403;
      error.vendorStatus = user?.vendorStatus || 'NONE';
      throw error;
    }

    let vendorUser: any = user;
    try {
      vendorUser = await prisma.user.upsert({
        where: { phoneNumber: cleanPhone },
        update: { role: 'vendor', vendorStatus: 'APPROVED' },
        create: {
          fullName: user?.fullName || approvedReq?.userName || 'Vendor',
          phoneNumber: cleanPhone,
          role: 'vendor',
          vendorStatus: 'APPROVED',
          passwordHash: 'OTP_VERIFIED',
          location: approvedReq?.farmLocation || user?.location || ''
        }
      });
    } catch {
      vendorUser = {
        id: 'usr-vendor-' + cleanPhone,
        phoneNumber: cleanPhone,
        fullName: user?.fullName || approvedReq?.userName || 'Vendor',
        role: 'vendor'
      };
    }

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
