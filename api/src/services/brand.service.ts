import { prisma } from '../config/db';

export class BrandService {
  public static async getAllBrands() {
    return prisma.brand.findMany({
      orderBy: { rating: 'desc' }
    });
  }

  public static async createBrand(data: { name: string; origin?: string; rating?: number; productCount?: number }) {
    return prisma.brand.create({
      data: {
        name: data.name,
        origin: data.origin || 'India',
        rating: data.rating !== undefined ? Number(data.rating) : 4.5,
        productCount: data.productCount || 0
      }
    });
  }

  public static async updateBrand(id: string, data: any) {
    return prisma.brand.update({
      where: { id },
      data: {
        ...data,
        rating: data.rating !== undefined ? Number(data.rating) : undefined
      }
    });
  }

  public static async deleteBrand(id: string) {
    return prisma.brand.delete({
      where: { id }
    });
  }
}
