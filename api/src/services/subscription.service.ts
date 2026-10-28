import { prisma } from '../config/db';

export class SubscriptionService {
  public static async getAllSubscriptions(phoneNumber?: string) {
    const cleanPhone = phoneNumber ? String(phoneNumber).replace(/[^0-9]/g, '') : '';
    const where: any = {};
    if (cleanPhone) {
      where.user = { phoneNumber: cleanPhone };
    }

    const subs = await prisma.subscription.findMany({
      where,
      include: { product: true, user: true },
      orderBy: { createdAt: 'desc' }
    });

    return subs.map((s: any) => ({
      ...s,
      product: s.product ? {
        ...s.product,
        category: s.product.categoryName || 'Organic'
      } : null
    }));
  }

  public static async createSubscription(data: any) {
    const { product, id, createdAt, user, ...rest } = data;

    let userId = rest.userId;
    const phone = data.userPhone || data.phoneNumber || data.phone;
    if (!userId && phone) {
      const cleanPhone = String(phone).replace(/[^0-9]/g, '');
      try {
        const found = await prisma.user.findUnique({ where: { phoneNumber: cleanPhone } });
        if (found) {
          userId = found.id;
        }
      } catch {}
    }

    return prisma.subscription.create({
      data: {
        productId: rest.productId || (product ? product.id : undefined),
        userId: userId || undefined,
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
