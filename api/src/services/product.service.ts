import { prisma } from '../config/db';
import { CloudinaryService } from './cloudinary.service';

export class ProductService {
  public static formatProduct(product: any) {
    if (!product) return null;
    return {
      ...product,
      category: product.category?.name || product.categoryName || 'Organic',
      categoryDetails: product.category,
      benefits: (() => {
        try {
          return JSON.parse(product.benefits);
        } catch {
          return [product.benefits];
        }
      })()
    };
  }

  public static async getAllProducts(category?: string, search?: string) {
    const where: any = {};
    if (category && category !== 'All') {
      where.categoryName = String(category);
    }
    if (search) {
      where.name = { contains: String(search) };
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'asc' }
    });

    return products.map(ProductService.formatProduct);
  }

  public static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });
    return ProductService.formatProduct(product);
  }

  public static async createProduct(data: any) {
    const { benefits, category, categoryDetails, id, createdAt, updatedAt, ...rest } = data;
    const catName = rest.categoryName || (typeof category === 'string' ? category : category?.name) || 'General';

    // Ensure category exists or create it
    try {
      await prisma.category.upsert({
        where: { name: catName },
        update: {},
        create: { name: catName, description: `${catName} category` }
      });
    } catch {
      // Ignored if already existing
    }

    if (!rest.name || !String(rest.name).trim()) {
      throw new Error('Product name is required.');
    }

    const price = parseFloat(rest.price);
    if (isNaN(price) || price < 0) {
      throw new Error('A valid product price is required.');
    }

    let finalImageUrl = rest.imageUrl || '';

    // Auto-optimize directly in Cloudinary if base64 image data is provided
    if (finalImageUrl && (finalImageUrl.startsWith('data:image/') || (!finalImageUrl.startsWith('http://') && !finalImageUrl.startsWith('https://')))) {
      try {
        const cloudUpload = await CloudinaryService.uploadProductImage(finalImageUrl, `prod_${rest.name || 'crop'}`);
        finalImageUrl = cloudUpload.url;
      } catch (err: any) {
        console.warn('[ProductService]: Cloudinary upload failed during product create, saving image directly:', err.message || err);
      }
    }

    const product = await prisma.product.create({
      data: {
        name: String(rest.name).trim(),
        categoryName: catName,
        brand: rest.brand ? String(rest.brand).trim() : '',
        price,
        unit: rest.unit || 'Kg',
        stock: parseInt(rest.stock, 10) >= 0 ? parseInt(rest.stock, 10) : 0,
        minStock: parseInt(rest.minStock, 10) >= 0 ? parseInt(rest.minStock, 10) : 0,
        rating: parseFloat(rest.rating) || 5.0,
        availabilityStart: rest.availabilityStart || '06:00 AM',
        availabilityEnd: rest.availabilityEnd || '09:00 PM',
        description: rest.description ? String(rest.description).trim() : '',
        imageUrl: finalImageUrl,
        benefits: Array.isArray(benefits) ? JSON.stringify(benefits) : (typeof benefits === 'string' ? benefits : '[]'),
        subscriptionAllowed: rest.subscriptionAllowed !== undefined ? Boolean(rest.subscriptionAllowed) : true,
        oneTimeAllowed: rest.oneTimeAllowed !== undefined ? Boolean(rest.oneTimeAllowed) : true,
        organicCertified: rest.organicCertified !== undefined ? Boolean(rest.organicCertified) : true,
        originalPrice: rest.originalPrice ? parseFloat(rest.originalPrice) : undefined,
        discountBadge: rest.discountBadge || undefined,
        vendorId: rest.vendorId || undefined,
        cloudinaryPublicId: rest.cloudinaryPublicId || undefined,
        emoji: rest.emoji || '🌱'
      },
      include: { category: true }
    });
    return ProductService.formatProduct(product);
  }

  public static async updateProduct(id: string, data: any) {
    const { benefits, category, categoryDetails, ...rest } = data;
    const updateData: any = { ...rest };
    if (benefits !== undefined) {
      updateData.benefits = Array.isArray(benefits) ? JSON.stringify(benefits) : String(benefits);
    }
    if (data.categoryName || category) {
      updateData.categoryName = data.categoryName || (typeof category === 'string' ? category : category?.name);
    }

    // Auto-optimize directly in Cloudinary if base64 image data is provided in update
    if (updateData.imageUrl && (updateData.imageUrl.startsWith('data:image/') || (!updateData.imageUrl.startsWith('http://') && !updateData.imageUrl.startsWith('https://')))) {
      try {
        const cloudUpload = await CloudinaryService.uploadProductImage(updateData.imageUrl, `prod_${updateData.name || id}`);
        updateData.imageUrl = cloudUpload.url;
      } catch (err: any) {
        console.warn('[ProductService]: Cloudinary upload failed during product update:', err.message || err);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true }
    });
    return ProductService.formatProduct(updated);
  }

  public static async deleteProduct(id: string) {
    return prisma.product.delete({
      where: { id }
    });
  }

  public static async getProductCount() {
    return prisma.product.count();
  }
}
