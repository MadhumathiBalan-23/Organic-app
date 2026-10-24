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
          fullName: 'Ananya Sharma',
          email: 'ananya.sharma@mathira.org',
          role: 'customer',
          location: 'Flat 402, Green Valley Apts, Indiranagar, Bangalore - 560038',
          status: 'Active',
          vendorStatus: 'NONE'
        },
        include: { subscriptions: true, orders: true }
      });
    }

    return {
      id: user.id,
      fullName: user.fullName || 'Ananya Sharma',
      phoneNumber: user.phoneNumber,
      email: user.email || 'ananya.sharma@mathira.org',
      location: user.location || 'Flat 402, Green Valley Apts, Indiranagar, Bangalore - 560038',
      role: user.role,
      status: user.status,
      vendorStatus: user.vendorStatus || 'NONE',
      totalOrders: user.orders ? user.orders.length : user.totalOrders || 0,
      activeSubscriptions: user.subscriptions ? user.subscriptions.length : 1,
      totalSpend: user.totalSpend || 3450,
      loyaltyPoints: 280
    };
  }

  public static async updateProfile(phoneNumber: string, data: { fullName?: string; email?: string; location?: string }) {
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    const { fullName, email, location } = data;

    return prisma.user.upsert({
      where: { phoneNumber: cleanPhone },
      update: {
        fullName: fullName ? String(fullName).trim() : undefined,
        email: email ? String(email).trim() : undefined,
        location: location ? String(location).trim() : undefined
      },
      create: {
        phoneNumber: cleanPhone,
        fullName: fullName ? String(fullName).trim() : 'Ananya Sharma',
        email: email ? String(email).trim() : 'ananya.sharma@mathira.org',
        location: location ? String(location).trim() : 'Flat 402, Green Valley Apts, Indiranagar, Bangalore - 560038',
        role: 'customer',
        status: 'Active'
      }
    });
  }
}
