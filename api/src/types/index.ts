import { Request } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  count?: number;
  data?: T;
  error?: string;
}

export interface JwtUserPayload {
  id: string; // UserID
  customerId?: string;
  vendorId?: string;
  adminId?: string;
  phoneNumber: string;
  role: 'admin' | 'vendor' | 'customer' | string;
  deviceId?: string;
  type?: 'CUSTOMER_TOKEN' | 'VENDOR_TOKEN' | 'ADMIN_TOKEN' | string;
  aud?: string;
  iss?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
  device?: any;
}

