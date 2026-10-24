import { prisma } from '../config/db';

export class CategoryService {
  public static async getAllCategories() {
    const list = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    return list.map(c => ({
      ...c,
      productCount: c._count?.products || 0
    }));
  }

  public static async createCategory(data: { name: string; emoji?: string; description?: string }) {
    return prisma.category.create({
      data: {
        name: data.name,
        emoji: data.emoji || '🌱',
        description: data.description || ''
      }
    });
  }

  public static async updateCategory(id: string, data: { name?: string; emoji?: string; description?: string }) {
    return prisma.category.update({
      where: { id },
      data
    });
  }

  public static async deleteCategory(id: string) {
    return prisma.category.delete({
      where: { id }
    });
  }
}
