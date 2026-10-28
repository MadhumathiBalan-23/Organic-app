import { prisma } from '../config/db';

export class DashboardService {
  public static async getStats() {
    const [totalProducts, totalOrders, totalUsers, totalSubs, pendingOrders, processingOrders, lowStockProducts] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.subscription.count(),
      prisma.order.count({ where: { deliveryStatus: { in: ['CONFIRMED', 'Pending', 'pending'] } } }),
      prisma.order.count({ where: { deliveryStatus: { in: ['PROCESSING', 'Processing', 'processing'] } } }),
      prisma.product.count({ where: { stock: { lte: 25 } } })
    ]);
    const orders = await prisma.order.findMany({ select: { totalAmount: true } });
    const calculatedRevenue = orders.reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0);

    return {
      totalRevenue: calculatedRevenue || 0,
      totalOrders,
      totalCustomers: totalUsers,
      totalUsers,
      totalProducts,
      totalSubscriptions: totalSubs,
      pendingOrders,
      processingOrders,
      lowStockProducts
    };
  }
}
