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

    return orders.map((o: any) => ({
      ...o,
      items: o.items.map((i: any) => ({
        ...i,
        product: i.product ? {
          ...i.product,
          category: i.product.categoryName || 'Organic'
        } : null
      }))
    }));
  }

  public static async createOrder(orderPayload: any) {
    const { items, id, createdAt, ...orderData } = orderPayload;
    return prisma.order.create({
      data: {
        customerName: orderData.customerName || 'Ananya Sharma',
        customerPhone: orderData.customerPhone || '9876543210',
        deliveryAddress: orderData.deliveryAddress || 'Indiranagar, Bangalore',
        totalAmount: parseFloat(orderData.totalAmount) || 0,
        orderType: orderData.orderType || 'One-Time',
        paymentStatus: orderData.paymentStatus || 'SUCCESS',
        deliveryStatus: orderData.deliveryStatus || 'CONFIRMED',
        paymentMethod: orderData.paymentMethod || 'UPI',
        items: items && items.length > 0 ? {
          create: items.map((it: any) => ({
            productId: it.productId,
            quantity: parseInt(it.quantity, 10) || 1,
            price: parseFloat(it.price) || 0
          }))
        } : undefined
      },
      include: { items: { include: { product: true } } }
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
