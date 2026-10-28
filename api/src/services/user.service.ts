import { prisma } from '../config/db';

export class UserService {
  public static async getAllUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  public static async getOrCreateProfile(phoneNumber: string) {
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    let user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone },
      include: { subscriptions: true, orders: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber: cleanPhone,
          fullName: '',
          email: null,
          role: 'customer',
          location: '',
          status: 'Active',
          vendorStatus: 'NONE'
        },
        include: { subscriptions: true, orders: true }
      });
    }

    const calculatedTotalSpend = user.orders && user.orders.length > 0
      ? user.orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0)
      : (user.totalSpend || 0);

    const activeSubsCount = user.subscriptions
      ? user.subscriptions.filter((s: any) => s.status === 'Active').length
      : 0;

    // 1 loyalty point per 100 spent
    const loyaltyPoints = Math.floor(calculatedTotalSpend / 100);

    return {
      id: user.id,
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber,
      email: user.email || '',
      location: user.location || '',
      role: user.role,
      status: user.status,
      vendorStatus: user.vendorStatus || 'NONE',
      totalOrders: user.orders ? user.orders.length : (user.totalOrders || 0),
      activeSubscriptions: activeSubsCount,
      totalSpend: calculatedTotalSpend,
      loyaltyPoints
    };
  }

  public static async updateProfile(phoneNumber: string, data: { fullName?: string; email?: string; location?: string }) {
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    const { fullName, email, location } = data;

    return prisma.user.upsert({
      where: { phoneNumber: cleanPhone },
      update: {
        fullName: fullName !== undefined ? String(fullName).trim() : undefined,
        email: email !== undefined ? (email ? String(email).trim() : null) : undefined,
        location: location !== undefined ? String(location).trim() : undefined
      },
      create: {
        phoneNumber: cleanPhone,
        fullName: fullName ? String(fullName).trim() : '',
        email: email ? String(email).trim() : null,
        location: location ? String(location).trim() : '',
        role: 'customer',
        status: 'Active'
      }
    });
  }
}
