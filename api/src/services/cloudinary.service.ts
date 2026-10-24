import { cloudinary } from '../config/cloudinary';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}

export class CloudinaryService {
  /**
   * Upload and optimize image directly on Cloudinary
   * Automatically applies smart compression, WebP/AVIF auto-format, and dimension limits.
   */
  public static async uploadProductImage(
    imageData: string,
    customName?: string
  ): Promise<CloudinaryUploadResult> {
    try {
      // Ensure proper data URI prefix if raw base64 is provided
      let payload = imageData;
      if (!payload.startsWith('data:') && !payload.startsWith('http://') && !payload.startsWith('https://')) {
        payload = `data:image/jpeg;base64,${imageData}`;
      }

      const options: any = {
        folder: 'agriflow_products',
        resource_type: 'image',
        // Cloudinary automatic optimizations
        transformation: [
          { quality: 'auto:good' },      // Smart compression preserving crystal-clear clarity
          { fetch_format: 'auto' },      // Automatically serves modern WebP / AVIF formats
          { width: 1200, crop: 'limit' } // Prevents huge dimensions from slowing down app
        ]
      };

      if (customName) {
        // Strip file extensions and sanitize for Cloudinary public_id
        const cleanName = customName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
        options.public_id = `${Date.now()}_${cleanName}`;
      }

      const uploadResponse = await cloudinary.uploader.upload(payload, options);

      console.log(`[Cloudinary]: Image uploaded and optimized -> ${uploadResponse.secure_url}`);

      return {
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        format: uploadResponse.format,
        bytes: uploadResponse.bytes
      };
    } catch (error: any) {
      console.error('[Cloudinary Upload Error]:', error.message || error);
      throw error;
    }
  }
}

export default CloudinaryService;
