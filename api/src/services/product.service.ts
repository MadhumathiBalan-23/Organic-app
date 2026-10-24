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
    const { benefits, ...rest } = data;
    const product = await prisma.product.create({
      data: {
        ...rest,
        benefits: Array.isArray(benefits) ? JSON.stringify(benefits) : benefits || '[]'
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
