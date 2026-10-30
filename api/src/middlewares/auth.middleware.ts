import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticatedRequest, JwtUserPayload } from '../types';

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : (authHeader || req.query.token as string);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Missing or invalid authorization token.'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(403).json({
      success: false,
      message: 'Token verification failed or token has expired.'
    });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient privileges.'
      });
    }
    next();
  };
};

export const requireCustomerAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  authenticateToken(req, res, () => {
    if (!req.user || (req.user.role !== 'customer' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Customer access required.'
      });
    }
    if (req.user.aud && req.user.aud !== 'customer-api' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Invalid token audience for Customer API.'
      });
    }
    next();
  });
};

export const requireVendorAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  authenticateToken(req, res, () => {
    if (!req.user || req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Vendor access required.'
      });
    }
    if (req.user.aud && req.user.aud !== 'vendor-api') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Invalid token audience for Vendor API.'
      });
    }
    next();
  });
};

export const requireAdminAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  authenticateToken(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Super Admin access required.'
      });
    }
    if (req.user.aud && req.user.aud !== 'admin-api') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Invalid token audience for Admin API.'
      });
    }
    next();
  });
};

