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
    const { product, id, createdAt, user, ...rest } = data;
    return prisma.subscription.create({
      data: {
        productId: rest.productId || (product ? product.id : undefined),
        userId: rest.userId,
        quantity: parseInt(rest.quantity, 10) || 1,
        frequency: rest.frequency || 'Daily',
        deliveryTime: rest.deliveryTime || rest.time || rest.timeSlot || '06:30 AM',
        duration: parseInt(rest.duration, 10) || 30,
        startDate: rest.startDate || new Date().toISOString().split('T')[0],
        paymentStatus: rest.paymentStatus || 'Paid',
        status: rest.status || 'Active',
        priceTotal: parseFloat(rest.priceTotal || rest.totalAmount) || 0,
        autoRenew: rest.autoRenew !== undefined ? Boolean(rest.autoRenew) : true,
        confirmationRequired: rest.confirmationRequired !== undefined ? Boolean(rest.confirmationRequired) : true,
        skippedDates: typeof rest.skippedDates === 'string' ? rest.skippedDates : JSON.stringify(rest.skippedDates || [])
      },
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
