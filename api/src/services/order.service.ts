import { prisma } from '../config/db';

export class OrderService {
  public static async getAllOrders() {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return orders.map(o => ({
      ...o,
      items: o.items.map(i => ({
        ...i,
        product: i.product ? {
          ...i.product,
          category: i.product.categoryName || 'Organic'
        } : null
      }))
    }));
  }

  public static async createOrder(orderPayload: any) {
    const { items, ...orderData } = orderPayload;
    return prisma.order.create({
      data: {
        ...orderData,
        items: items ? {
          create: items.map((it: any) => ({
            productId: it.productId,
            quantity: it.quantity || 1,
            price: it.price || 0
          }))
        } : undefined
      },
      include: { items: true }
    });
  }

  public static async updateOrder(id: string, data: any) {
    const { status, deliveryStatus, paymentStatus } = data;
    return prisma.order.update({
      where: { id },
      data: {
        deliveryStatus: status || deliveryStatus,
        paymentStatus: paymentStatus
      }
    });
  }

  public static async deleteOrder(id: string) {
    // Delete items first if relation cascade isn't automatic
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    return prisma.order.delete({
      where: { id }
    });
  }
}
