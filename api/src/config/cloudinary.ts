import { v2 as cloudinary } from 'cloudinary';
import { config } from './index';

// Initialize Cloudinary with configured credentials
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true
});

export { cloudinary };
export default cloudinary;
