import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * POST /api/upload
 * Handles base64 image upload from device gallery, camera, or file picker
 */
router.post('/upload', async (req: Request, res: Response) => {
  try {
    const { image, fileName: customName } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'No image data provided. Please provide a base64 encoded image string.',
      });
    }

    // Determine MIME type and clean base64 data
    let ext = 'jpg';
    let base64Data = image;

    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mime = matches[1].toLowerCase();
        if (mime.includes('png')) ext = 'png';
        else if (mime.includes('webp')) ext = 'webp';
        else if (mime.includes('gif')) ext = 'gif';
        else ext = 'jpg';

        base64Data = matches[2];
      }
    }

    const uniqueName = customName
      ? `${Date.now()}-${customName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      : `crop-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;

    const filePath = path.join(UPLOADS_DIR, uniqueName);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    // Build public URL dynamically from request host
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5050';
    const fileUrl = `${protocol}://${host}/uploads/${uniqueName}`;

    console.log(`[Upload]: File saved successfully to ${filePath} -> ${fileUrl}`);

    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully from device gallery',
      url: fileUrl,
      fileName: uniqueName,
    });
  } catch (error: any) {
    console.error('[Upload Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image',
    });
  }
});

export default router;
