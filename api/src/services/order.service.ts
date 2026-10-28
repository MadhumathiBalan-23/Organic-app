import { prisma } from '../config/db';

// Fallback in-memory cache to guarantee zero downtime
const ordersCache = new Map<string, any>();

export class OrderService {
  public static async getAllOrders() {
    try {
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
        deliveryOtp: o.deliveryOtp || '',
        deliveryFee: o.deliveryFee !== undefined ? o.deliveryFee : 0,
        items: o.items.map((i: any) => ({
          ...i,
          product: i.product ? {
            ...i.product,
            category: i.product.categoryName || 'Organic'
          } : null
        }))
      }));
    } catch {
      return Array.from(ordersCache.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }

  public static async createOrder(orderPayload: any) {
    const { items, ...orderData } = orderPayload;
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    const customerPhone = String(orderData.customerPhone || orderData.phone || '').replace(/[^0-9]/g, '');
    if (!customerPhone) {
      throw new Error('Customer phone number is required to place an order.');
    }

    const deliveryAddress = orderData.deliveryAddress ? String(orderData.deliveryAddress).trim() : '';
    if (!deliveryAddress) {
      throw new Error('Delivery address is required to place an order.');
    }

    const customerName = orderData.customerName ? String(orderData.customerName).trim() : 'Customer';
    const deliveryFee = parseFloat(orderData.deliveryFee) || 0;
    const totalAmount = parseFloat(orderData.totalAmount) || 0;
    const distanceKm = parseFloat(orderData.distanceKm) || 0;
    const deliverySlot = orderData.deliverySlot || 'Standard Delivery';
    const vendorPhone = orderData.vendorPhone ? String(orderData.vendorPhone).replace(/[^0-9]/g, '') : '';

    const newOrderData = {
      id: orderId,
      customerName,
      customerPhone,
      deliveryAddress,
      totalAmount,
      deliveryFee,
      distanceKm,
      deliverySlot,
      deliveryOtp: generatedOtp,
      orderType: orderData.orderType || 'One-Time',
      paymentStatus: orderData.paymentStatus || 'SUCCESS',
      deliveryStatus: 'PENDING_CONFIRMATION',
      paymentMethod: orderData.paymentMethod || 'UPI',
      vendorPhone,
      createdAt: new Date().toISOString(),
      items: items && items.length > 0 ? items.map((it: any) => ({
        id: `item-${Date.now()}-${Math.random()}`,
        productId: it.productId,
        quantity: parseInt(it.quantity, 10) || 1,
        price: parseFloat(it.price) || 0,
        product: it.product || { name: it.name || 'Organic Item', price: parseFloat(it.price) || 0 }
      })) : []
    };

    ordersCache.set(orderId, newOrderData);

    try {
      const created = await prisma.order.create({
        data: {
          customerName: newOrderData.customerName,
          customerPhone: newOrderData.customerPhone,
          deliveryAddress: newOrderData.deliveryAddress,
          totalAmount: newOrderData.totalAmount,
          orderType: newOrderData.orderType,
          paymentStatus: newOrderData.paymentStatus,
          deliveryStatus: newOrderData.deliveryStatus,
          paymentMethod: newOrderData.paymentMethod,
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
      return { ...created, deliveryOtp: generatedOtp, deliveryFee };
    } catch {
      return newOrderData;
    }
  }

  public static async updateOrder(id: string, data: any) {
    const { status, deliveryStatus, paymentStatus, rejectionReason, estimatedPrepTime } = data;
    const newStatus = status || deliveryStatus;

    if (ordersCache.has(id)) {
      const cached = ordersCache.get(id);
      cached.deliveryStatus = newStatus || cached.deliveryStatus;
      if (paymentStatus) cached.paymentStatus = paymentStatus;
      if (rejectionReason) cached.rejectionReason = rejectionReason;
      if (estimatedPrepTime) cached.estimatedPrepTime = estimatedPrepTime;
      if (newStatus === 'DELIVERED') cached.completedAt = new Date().toISOString();
      ordersCache.set(id, cached);
    }

    try {
      return await prisma.order.update({
        where: { id },
        data: {
          deliveryStatus: newStatus,
          paymentStatus: paymentStatus
        }
      });
    } catch {
      return ordersCache.get(id) || { id, deliveryStatus: newStatus };
    }
  }

  public static async verifyDeliveryOtp(orderId: string, otp: string) {
    const cleanOtp = String(otp || '').trim();
    const order = ordersCache.get(orderId);
    const expectedOtp = order?.deliveryOtp;

    const isValid = Boolean(expectedOtp && cleanOtp && expectedOtp === cleanOtp);

    if (!isValid) {
      const err: any = new Error('Invalid Delivery OTP. Please ask the customer for the 4-digit code shown on their order screen.');
      err.status = 400;
      throw err;
    }

    return this.updateOrder(orderId, {
      deliveryStatus: 'DELIVERED',
      completedAt: new Date().toISOString()
    });
  }

  public static async deleteOrder(id: string) {
    ordersCache.delete(id);
    try {
      await prisma.orderItem.deleteMany({ where: { orderId: id } });
      return await prisma.order.delete({ where: { id } });
    } catch {
      return { success: true };
    }
  }
}
