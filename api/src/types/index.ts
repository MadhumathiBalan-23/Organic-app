import { Request } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  count?: number;
  data?: T;
  error?: string;
}

export interface JwtUserPayload {
  id: string;
  phoneNumber: string;
  role: 'admin' | 'vendor' | 'customer' | string;
  type?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}
