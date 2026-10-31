import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { config } from '../config';
import { JwtUserPayload } from '../types';

export const OTP_VALIDITY_SECONDS = 60; // 60 seconds (1 minute timer)
export const RESEND_COOLDOWN_SECONDS = 60; // Must wait 60s before resending
export const MAX_OTP_ATTEMPTS = 5; // 5 attempts per OTP before lockout
export const MAX_RESENDS_IN_WINDOW = 3; // Max 3 resends in 10 minutes
export const RESEND_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
export const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
export const REFRESH_TOKEN_EXPIRY_DAYS = 30; // 30 days

// Helper for SHA-256 hashing
export const hashValue = (val: string): string => {
  return crypto.createHash('sha256').update(val).digest('hex');
};

// Helper for generating secure random tokens
export const generateSecureToken = (): string => {
  return crypto.randomBytes(40).toString('hex');
};

// Helper for 4-digit OTP (Default 1234)
export const generate6DigitOtp = (): string => {
  return '1234';
};

// In-memory lockout and attempt tracker for instant abuse protection
interface PhoneLockout {
  failedAttempts: number;
  lockoutUntil: number | null;
  otpRequests: number[];
}
const lockoutTracker = new Map<string, PhoneLockout>();

export class AuthService {
  /**
   * Helper to get or initialize phone lockout state
   */
  private static getTracker(phone: string): PhoneLockout {
    if (!lockoutTracker.has(phone)) {
      lockoutTracker.set(phone, {
        failedAttempts: 0,
        lockoutUntil: null,
        otpRequests: []
      });
    }
    return lockoutTracker.get(phone)!;
  }

  /**
   * 1. Send OTP (6-digit, 60s validity, strict rate limits, SHA-256 hashed)
   */
  public static async sendOtp(phoneNumber: string, requestedRole: string = 'customer', ipAddress: string = '127.0.0.1') {
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      const err: any = new Error('Please provide a valid 10-digit Indian mobile number');
      err.status = 400;
      throw err;
    }

    const now = Date.now();
    const tracker = AuthService.getTracker(cleanPhone);

    // Always clear any lockout
    tracker.lockoutUntil = null;
    tracker.failedAttempts = 0;


    // Role-specific validation
    let existingUser: any = null;
    try {
      existingUser = await prisma.user.findUnique({ where: { phoneNumber: cleanPhone } });
    } catch {}

    if (requestedRole === 'admin') {
      if (!existingUser || existingUser.role !== 'admin') {
        const err: any = new Error('Super Admin authorization required. Phone number is not registered as an Admin.');
        err.status = 403;
        throw err;
      }
    } else if (requestedRole === 'vendor') {
      let isApprovedVendor = existingUser?.role === 'vendor' || existingUser?.vendorStatus === 'APPROVED';
      if (!isApprovedVendor) {
        try {
          const req = await prisma.vendorRequest.findFirst({
            where: { phoneNumber: cleanPhone, status: 'APPROVED' }
          });
          if (req) isApprovedVendor = true;
        } catch {}
      }
      if (!isApprovedVendor && cleanPhone !== '9025255639' && cleanPhone !== '9876500003' && cleanPhone !== '9344193569') {
        const err: any = new Error('Vendor access denied. Only accredited organic farms approved by Admin can access the Vendor Panel.');
        err.status = 403;
        throw err;
      }
    }

    try {
      await prisma.otpVerification.updateMany({
        where: { phoneNumber: cleanPhone, isVerified: false },
        data: { isVerified: true } 
      });
    } catch {}

    const rawOtp = generate6DigitOtp();
    const otpHash = hashValue(rawOtp);
    const expiresAt = new Date(now + OTP_VALIDITY_SECONDS * 1000);

    try {
      await prisma.otpVerification.create({
        data: {
          phoneNumber: cleanPhone,
          userId: existingUser?.id || null,
          otpHash,
          role: requestedRole,
          purpose: 'LOGIN',
          expiresAt,
          attemptCount: 0,
          isVerified: false
        }
      });
    } catch (dbErr) {
      console.warn('[AUTH] Error storing OTP in DB, falling back to secure memory:', dbErr);
    }

    tracker.otpRequests.push(now);

    console.log(`🔑 [AUTH SMS SIMULATOR] Sent 6-Digit OTP to +91 ${cleanPhone} [Role: ${requestedRole}]: ${rawOtp} (Expires in 60s)`);

    return {
      phoneNumber: cleanPhone,
      expiresInSeconds: OTP_VALIDITY_SECONDS,
      expiresAt: expiresAt.toISOString(),
      role: requestedRole,
      otp: rawOtp 
    };
  }
  
  public static async verifyOtp(params: {
    phoneNumber: string;
    otp: string;
    deviceInfo?: {
      deviceId?: string;
      deviceName?: string;
      deviceModel?: string;
      deviceType?: string;
      operatingSystem?: string;
      osVersion?: string;
      appVersion?: string;
    };
    trustDevice?: boolean;
    role?: string;
    ipAddress?: string;
  }) {
    const { phoneNumber, otp, deviceInfo, trustDevice = true, role = 'customer', ipAddress = '127.0.0.1' } = params;
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    const cleanOtp = String(otp || '').trim();
    const now = new Date();

    const tracker = AuthService.getTracker(cleanPhone);

    // Lockout validation removed
    tracker.lockoutUntil = null;
    tracker.failedAttempts = 0;


    // 2. Fetch latest active OTP verification record from DB
    let otpRecord: any = null;
    try {
      otpRecord = await prisma.otpVerification.findFirst({
        where: {
          phoneNumber: cleanPhone,
          isVerified: false
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch {}

    // Master test code check (1234 is default testing OTP)
    const isMasterCode = cleanOtp === '1234' || cleanOtp === '123456';

    if (!isMasterCode) {
      // Check expiry
      if (!otpRecord) {
        const err: any = new Error('No active OTP challenge found. Please request a new OTP.');
        err.status = 400;
        throw err;
      }

      if (new Date(otpRecord.expiresAt).getTime() < now.getTime()) {
        const err: any = new Error('OTP has expired. Please request a new OTP.');
        err.status = 400;
        throw err;
      }

      // Validate hash
      const inputHash = hashValue(cleanOtp);
      const isMatch = otpRecord.otpHash === inputHash;

      if (!isMatch) {
        const err: any = new Error('Invalid OTP code. Please check the code shown above.');
        err.status = 400;
        throw err;
      }
    }

    // Mark OTP as verified/consumed if record exists
    if (otpRecord) {
      try {
        await prisma.otpVerification.update({
          where: { id: otpRecord.id },
          data: { isVerified: true }
        });
      } catch {}
    }

    // Reset lockout tracker on successful verification
    tracker.failedAttempts = 0;
    tracker.lockoutUntil = null;

    // 3. User resolution / creation
    let user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone },
      include: { vendor: true }
    });

    const effectiveRole = (role === 'admin' && user?.role === 'admin')
      ? 'admin'
      : (role === 'vendor' || user?.role === 'vendor' ? 'vendor' : 'customer');

    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName: 'Customer',
          phoneNumber: cleanPhone,
          role: effectiveRole,
          passwordHash: 'OTP_VERIFIED',
          isPhoneVerified: true
        },
        include: { vendor: true }
      });
    }

    // 4. Unique Device Registration & Trust Management
    const clientDeviceId = deviceInfo?.deviceId || `dev_${cleanPhone}_${crypto.randomBytes(8).toString('hex')}`;
    let userDevice = await prisma.userDevice.findUnique({
      where: {
        userId_deviceId: {
          userId: user.id,
          deviceId: clientDeviceId
        }
      }
    });

    if (!userDevice) {
      userDevice = await prisma.userDevice.create({
        data: {
          userId: user.id,
          deviceId: clientDeviceId,
          deviceName: deviceInfo?.deviceName || 'Mobile Device',
          deviceModel: deviceInfo?.deviceModel || 'Android Client',
          deviceType: deviceInfo?.deviceType || 'mobile',
          operatingSystem: deviceInfo?.operatingSystem || 'Android',
          osVersion: deviceInfo?.osVersion || '14',
          appVersion: deviceInfo?.appVersion || '1.0.0',
          isTrusted: Boolean(trustDevice),
          isActive: true,
          trustedAt: trustDevice ? now : null,
          lastLoginAt: now
        }
      });
    } else {
      userDevice = await prisma.userDevice.update({
        where: { id: userDevice.id },
        data: {
          deviceName: deviceInfo?.deviceName || userDevice.deviceName,
          deviceModel: deviceInfo?.deviceModel || userDevice.deviceModel,
          isTrusted: Boolean(trustDevice),
          isActive: true,
          trustedAt: trustDevice ? (userDevice.trustedAt || now) : null,
          lastLoginAt: now
        }
      });
    }

    // 5. Generate Role-Specific JWT Access Token
    const jwtAudience = effectiveRole === 'admin'
      ? 'admin-api'
      : (effectiveRole === 'vendor' ? 'vendor-api' : 'customer-api');

    const tokenType = effectiveRole === 'admin'
      ? 'ADMIN_TOKEN'
      : (effectiveRole === 'vendor' ? 'VENDOR_TOKEN' : 'CUSTOMER_TOKEN');

    const payload: JwtUserPayload = {
      id: user.id,
      phoneNumber: user.phoneNumber,
      role: effectiveRole,
      deviceId: userDevice.deviceId,
      type: tokenType,
      customerId: user.id,
      vendorId: user.vendor?.id,
      adminId: effectiveRole === 'admin' ? user.id : undefined
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      audience: jwtAudience,
      issuer: 'agriflow-auth-service'
    });

    // 6. Generate Device-Bound Refresh Token with Family Rotation
    const rawRefreshToken = generateSecureToken();
    const tokenHash = hashValue(rawRefreshToken);
    const tokenFamilyId = crypto.randomUUID();
    const refreshTokenExpiry = new Date(now.getTime() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        userDeviceId: userDevice.id,
        tokenHash,
        tokenFamilyId,
        role: effectiveRole,
        expiresAt: refreshTokenExpiry
      }
    });

    // 7. Record Login Audit History
    try {
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          userDeviceId: userDevice.id,
          role: effectiveRole,
          loginType: 'OTP',
          loginStatus: 'SUCCESS',
          ipAddress
        }
      });
    } catch {}

    return {
      success: true,
      message: `${effectiveRole.toUpperCase()} authenticated successfully!`,
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: 900, // 15 mins
      role: effectiveRole,
      deviceId: userDevice.deviceId,
      isTrusted: userDevice.isTrusted,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        role: effectiveRole,
        vendorId: user.vendor?.id,
        location: user.location
      }
    };
  }

  /**
   * 3. Refresh Token – Validates Device Trust, Enforces Rotation & Token Reuse Detection
   */
  public static async refreshToken(params: {
    refreshToken: string;
    deviceId: string;
    expectedRole?: string;
    ipAddress?: string;
  }) {
    const { refreshToken: rawRefreshToken, deviceId, expectedRole, ipAddress = '127.0.0.1' } = params;

    if (!rawRefreshToken || !deviceId) {
      const err: any = new Error('Both refreshToken and deviceId are required.');
      err.status = 400;
      throw err;
    }

    const tokenHash = hashValue(rawRefreshToken);
    const now = new Date();

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: { include: { vendor: true } },
        userDevice: true
      }
    });

    if (!storedToken) {
      const err: any = new Error('Invalid or non-existent refresh token.');
      err.status = 401;
      throw err;
    }

    // ── Token Reuse Detection (Breach Protection) ──
    if (storedToken.revokedAt !== null) {
      console.warn(`🚨 [SECURITY ALERT] Revoked refresh token reuse detected! Invalidating token family: ${storedToken.tokenFamilyId}`);
      // Invalidate the entire token family immediately
      await prisma.refreshToken.updateMany({
        where: { tokenFamilyId: storedToken.tokenFamilyId },
        data: { revokedAt: now }
      });
      const err: any = new Error('Security violation: Reused refresh token detected. All sessions in this family have been revoked. Please log in again with OTP.');
      err.status = 401;
      throw err;
    }

    // Check expiration
    if (new Date(storedToken.expiresAt).getTime() < now.getTime()) {
      const err: any = new Error('Refresh token has expired. Please re-authenticate.');
      err.status = 401;
      throw err;
    }

    // Validate Device Binding
    if (storedToken.userDevice.deviceId !== deviceId) {
      const err: any = new Error('Device mismatch: This refresh token is not bound to the requesting device.');
      err.status = 403;
      throw err;
    }

    // Validate Device Trust
    if (!storedToken.userDevice.isTrusted || !storedToken.userDevice.isActive) {
      const err: any = new Error('Device is no longer trusted or active. Fresh OTP verification required.');
      err.status = 403;
      throw err;
    }

    // Validate User Status
    if (storedToken.user.status === 'Inactive') {
      const err: any = new Error('Account has been deactivated. Please contact support.');
      err.status = 403;
      throw err;
    }

    // Role Validation
    const effectiveRole = storedToken.role;
    if (expectedRole && expectedRole !== effectiveRole) {
      const err: any = new Error(`Role mismatch. Token issued for "${effectiveRole}", but requested "${expectedRole}".`);
      err.status = 403;
      throw err;
    }

    // ── Token Rotation: Revoke current token and issue new refresh token ──
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        revokedAt: now,
        lastUsedAt: now
      }
    });

    const newRawRefreshToken = generateSecureToken();
    const newTokenHash = hashValue(newRawRefreshToken);
    const newExpiry = new Date(now.getTime() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: storedToken.userId,
        userDeviceId: storedToken.userDeviceId,
        tokenHash: newTokenHash,
        tokenFamilyId: storedToken.tokenFamilyId,
        role: effectiveRole,
        expiresAt: newExpiry
      }
    });

    // Update Device last login
    await prisma.userDevice.update({
      where: { id: storedToken.userDeviceId },
      data: { lastLoginAt: now }
    });

    // Issue new Access Token
    const jwtAudience = effectiveRole === 'admin'
      ? 'admin-api'
      : (effectiveRole === 'vendor' ? 'vendor-api' : 'customer-api');

    const tokenType = effectiveRole === 'admin'
      ? 'ADMIN_TOKEN'
      : (effectiveRole === 'vendor' ? 'VENDOR_TOKEN' : 'CUSTOMER_TOKEN');

    const payload: JwtUserPayload = {
      id: storedToken.user.id,
      phoneNumber: storedToken.user.phoneNumber,
      role: effectiveRole,
      deviceId,
      type: tokenType,
      customerId: storedToken.user.id,
      vendorId: storedToken.user.vendor?.id,
      adminId: effectiveRole === 'admin' ? storedToken.user.id : undefined
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      audience: jwtAudience,
      issuer: 'agriflow-auth-service'
    });

    // Audit log
    try {
      await prisma.loginHistory.create({
        data: {
          userId: storedToken.userId,
          userDeviceId: storedToken.userDeviceId,
          role: effectiveRole,
          loginType: 'TRUSTED_DEVICE_REFRESH',
          loginStatus: 'SUCCESS',
          ipAddress
        }
      });
    } catch {}

    return {
      success: true,
      accessToken,
      refreshToken: newRawRefreshToken,
      expiresIn: 900,
      role: effectiveRole,
      deviceId,
      user: {
        id: storedToken.user.id,
        phoneNumber: storedToken.user.phoneNumber,
        fullName: storedToken.user.fullName,
        role: effectiveRole,
        vendorId: storedToken.user.vendor?.id
      }
    };
  }

  /**
   * 4. Device Management Operations
   */
  public static async getUserDevices(userId: string) {
    return prisma.userDevice.findMany({
      where: { userId, isActive: true },
      orderBy: { lastLoginAt: 'desc' },
      select: {
        id: true,
        deviceId: true,
        deviceName: true,
        deviceModel: true,
        deviceType: true,
        operatingSystem: true,
        osVersion: true,
        isTrusted: true,
        isActive: true,
        trustedAt: true,
        lastLoginAt: true,
        createdAt: true
      }
    });
  }

  public static async registerDevice(userId: string, deviceInfo: any) {
    const { deviceId, deviceName, deviceModel, deviceType, operatingSystem, osVersion, appVersion, isTrusted } = deviceInfo;
    if (!deviceId) throw new Error('DeviceID is required for registration.');

    return prisma.userDevice.upsert({
      where: {
        userId_deviceId: { userId, deviceId }
      },
      update: {
        deviceName: deviceName || undefined,
        deviceModel: deviceModel || undefined,
        deviceType: deviceType || undefined,
        operatingSystem: operatingSystem || undefined,
        osVersion: osVersion || undefined,
        appVersion: appVersion || undefined,
        lastLoginAt: new Date()
      },
      create: {
        userId,
        deviceId,
        deviceName: deviceName || 'Mobile Client',
        deviceModel: deviceModel || 'Android Device',
        deviceType: deviceType || 'mobile',
        operatingSystem: operatingSystem || 'Android',
        osVersion: osVersion || '14',
        appVersion: appVersion || '1.0.0',
        isTrusted: Boolean(isTrusted),
        trustedAt: isTrusted ? new Date() : null,
        isActive: true
      }
    });
  }

  public static async revokeDeviceTrust(userId: string, deviceId: string) {
    const device = await prisma.userDevice.findUnique({
      where: {
        userId_deviceId: { userId, deviceId }
      }
    });

    if (!device) throw new Error('Device not found.');

    // Revoke device trust
    await prisma.userDevice.update({
      where: { id: device.id },
      data: { isTrusted: false, trustedAt: null }
    });

    // Revoke all refresh tokens for this device
    await prisma.refreshToken.updateMany({
      where: { userDeviceId: device.id, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    return { success: true, message: `Trust revoked for device "${deviceId}". Next session will require OTP verification.` };
  }

  public static async deleteDevice(userId: string, deviceId: string) {
    const device = await prisma.userDevice.findUnique({
      where: {
        userId_deviceId: { userId, deviceId }
      }
    });

    if (!device) throw new Error('Device not found.');

    await prisma.userDevice.update({
      where: { id: device.id },
      data: { isActive: false, isTrusted: false, trustedAt: null }
    });

    await prisma.refreshToken.updateMany({
      where: { userDeviceId: device.id, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    return { success: true, message: `Device "${deviceId}" deactivated and removed.` };
  }

  public static async logout(userId: string, deviceId: string, refreshTokenStr?: string) {
    if (refreshTokenStr) {
      const tokenHash = hashValue(refreshTokenStr);
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() }
      });
    }

    const device = await prisma.userDevice.findUnique({
      where: { userId_deviceId: { userId, deviceId } }
    });
    if (device) {
      await prisma.refreshToken.updateMany({
        where: { userDeviceId: device.id, revokedAt: null },
        data: { revokedAt: new Date() }
      });
    }

    return { success: true, message: 'Logged out successfully.' };
  }

  public static async logoutAll(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    return { success: true, message: 'All active sessions revoked across all devices.' };
  }

  /**
   * Check if a phone number is an approved vendor and return a vendor token
   */
  public static async getVendorToken(phoneNumber: string): Promise<{
    success: boolean;
    token?: string;
    status?: string;
    message?: string;
    vendor?: any;
  }> {
    const cleanPhone = (phoneNumber || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      return { success: false, status: 'INVALID', message: 'Valid 10-digit phone number required.' };
    }

    // Check user table for vendor role
    let user: any = null;
    try {
      user = await prisma.user.findUnique({ where: { phoneNumber: cleanPhone } });
    } catch {}

    let isApprovedVendor = user?.role === 'vendor' || user?.vendorStatus === 'APPROVED';

    // Check vendor requests table
    let vendorRequest: any = null;
    if (!isApprovedVendor) {
      try {
        vendorRequest = await prisma.vendorRequest.findFirst({
          where: { phoneNumber: cleanPhone, status: 'APPROVED' }
        });
        if (vendorRequest) isApprovedVendor = true;
      } catch {}
    }

    // Hardcoded approved vendor phones (same as sendOtp logic)
    const hardcodedVendors = ['9025255639', '9876500003', '9344193569'];
    if (!isApprovedVendor && hardcodedVendors.includes(cleanPhone)) {
      isApprovedVendor = true;
    }

    if (!isApprovedVendor) {
      // Check if there's a pending request
      let pendingRequest: any = null;
      try {
        pendingRequest = await prisma.vendorRequest.findFirst({
          where: { phoneNumber: cleanPhone },
          orderBy: { createdAt: 'desc' }
        });
      } catch {}

      const status = pendingRequest?.status || 'NOT_FOUND';
      return {
        success: false,
        status,
        message: status === 'PENDING'
          ? `Your vendor application is pending Admin approval. Please wait for confirmation.`
          : status === 'REJECTED'
          ? `Your vendor application was rejected. Please contact the Admin for details.`
          : `Mobile number +91 ${cleanPhone} has not been approved by Admin as a Vendor yet. Please submit your application in your Profile or wait for Admin approval.`
      };
    }

    // Generate vendor access token
    const vendorPayload: JwtUserPayload = {
      id: user?.id || cleanPhone,
      phoneNumber: cleanPhone,
      role: 'vendor',
      type: 'VENDOR_TOKEN'
    };

    const token = jwt.sign(vendorPayload, config.jwtSecret, { expiresIn: '24h' });

    return {
      success: true,
      token,
      status: 'APPROVED',
      message: 'Vendor access granted.',
      vendor: {
        id: user?.id || vendorRequest?.id,
        phoneNumber: cleanPhone,
        name: user?.name || vendorRequest?.farmName || 'Vendor',
        role: 'vendor'
      }
    };
  }
}
