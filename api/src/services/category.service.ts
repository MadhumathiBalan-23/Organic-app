import { prisma } from '../config/db';

export class CategoryService {
  public static async getAllCategories(includeInactive = false) {
    const where: any = includeInactive ? {} : { isActive: true };
    const list = await prisma.category.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    return list.map((c: any) => ({
      ...c,
      productCount: c._count?.products || 0
    }));
  }

  public static async createCategory(data: {
    name: string;
    emoji?: string;
    description?: string;
    imageUrl?: string;
    cloudinaryPublicId?: string;
    displayOrder?: number;
    isActive?: boolean;
  }) {
    return prisma.category.create({
      data: {
        name: data.name,
        emoji: data.emoji || '🌱',
        description: data.description || '',
        imageUrl: data.imageUrl || null,
        cloudinaryPublicId: data.cloudinaryPublicId || null,
        displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      }
    });
  }

  public static async updateCategory(id: string, data: any) {
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

export default CategoryService;
