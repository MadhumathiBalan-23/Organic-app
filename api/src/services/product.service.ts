import { prisma } from '../config/db';

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
    const catName = rest.categoryName || (typeof category === 'string' ? category : category?.name) || 'Fresh Vegetables';

    // Ensure category exists in SQLite or create it
    try {
      await prisma.category.upsert({
        where: { name: catName },
        update: {},
        create: { name: catName, description: `${catName} category` }
      });
    } catch {
      // Ignored if already existing
    }

    const product = await prisma.product.create({
      data: {
        name: rest.name || 'Organic Harvest',
        categoryName: catName,
        brand: rest.brand || 'NatureFarm',
        price: parseFloat(rest.price) || 50,
        unit: rest.unit || 'Kg',
        stock: parseInt(rest.stock, 10) || 50,
        minStock: parseInt(rest.minStock, 10) || 10,
        rating: parseFloat(rest.rating) || 4.8,
        availabilityStart: rest.availabilityStart || '06:00 AM',
        availabilityEnd: rest.availabilityEnd || '09:00 PM',
        description: rest.description || `${rest.name || 'Organic product'} direct from certified organic farms.`,
        imageUrl: rest.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        benefits: Array.isArray(benefits) ? JSON.stringify(benefits) : (typeof benefits === 'string' ? benefits : '["100% Organic", "Farm Fresh"]'),
        subscriptionAllowed: rest.subscriptionAllowed !== undefined ? Boolean(rest.subscriptionAllowed) : true,
        oneTimeAllowed: rest.oneTimeAllowed !== undefined ? Boolean(rest.oneTimeAllowed) : true,
        organicCertified: rest.organicCertified !== undefined ? Boolean(rest.organicCertified) : true,
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
