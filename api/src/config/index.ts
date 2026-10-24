import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: process.env.PORT || 5050,
  jwtSecret: process.env.JWT_SECRET || 'agriflow_organic_secret_2026',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'bbdmypjc',
    apiKey: process.env.CLOUDINARY_API_KEY || '755222413141583',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'vVwB-Gy4ncfN0tmRSXWKAbPCBYQ'
  }
};

export default config;
