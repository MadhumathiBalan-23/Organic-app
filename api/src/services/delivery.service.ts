import { prisma } from '../config/db';

export class DeliveryService {
  public static async getAllDeliveries() {
    return prisma.delivery.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  public static async createDelivery(data: any) {
    return prisma.delivery.create({
      data: {
        customerName: data.customerName,
        address: data.address,
        products: data.products,
        quantity: data.quantity || '1 Item',
        deliveryTime: data.deliveryTime || '06:30 AM',
        status: data.status || 'Assigned'
      }
    });
  }

  public static async updateDelivery(id: string, data: any) {
    return prisma.delivery.update({
      where: { id },
      data
    });
  }

  public static async deleteDelivery(id: string) {
    return prisma.delivery.delete({
      where: { id }
    });
  }
}
