import { prisma } from '../config/db';

export class SubscriptionService {
  public static async getAllSubscriptions() {
    const subs = await prisma.subscription.findMany({
      include: { product: true, user: true },
      orderBy: { createdAt: 'desc' }
    });

    return subs.map(s => ({
      ...s,
      product: s.product ? {
        ...s.product,
        category: s.product.categoryName || 'Organic'
      } : null
    }));
  }

  public static async createSubscription(data: any) {
    const { product, ...rest } = data;
    return prisma.subscription.create({
      data: rest,
      include: { product: true }
    });
  }

  public static async updateSubscription(id: string, data: any) {
    const { product, ...rest } = data;
    return prisma.subscription.update({
      where: { id },
      data: rest,
      include: { product: true }
    });
  }

  public static async deleteSubscription(id: string) {
    return prisma.subscription.delete({
      where: { id }
    });
  }
}
