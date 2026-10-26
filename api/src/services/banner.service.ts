import { prisma } from '../config/db';

export class BannerService {
  /**
   * Retrieve active promotional banners within their scheduled window,
   * sorted by displayOrder.
   */
  public static async getActiveBanners() {
    const now = new Date();
    return prisma.banner.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { startAt: null },
              { startAt: { lte: now } },
            ],
          },
          {
            OR: [
              { endAt: null },
              { endAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  public static async getAllBanners() {
    return prisma.banner.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  public static async getBannerById(id: string) {
    return prisma.banner.findUnique({
      where: { id },
    });
  }

  public static async createBanner(data: {
    title: string;
    subtitle?: string;
    imageUrl: string;
    cloudinaryPublicId?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    buttonText?: string;
    targetType?: string;
    targetId?: string;
    displayOrder?: number;
    isActive?: boolean;
    startAt?: string | Date;
    endAt?: string | Date;
  }) {
    return prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle || null,
        imageUrl: data.imageUrl,
        cloudinaryPublicId: data.cloudinaryPublicId || null,
        backgroundColor: data.backgroundColor || '#EBF6EE',
        textColor: data.textColor || '#003B25',
        buttonColor: data.buttonColor || '#F2C500',
        buttonTextColor: data.buttonTextColor || '#18352B',
        buttonText: data.buttonText || 'Shop Now →',
        targetType: data.targetType || 'SCREEN',
        targetId: data.targetId || 'ALL_PRODUCTS',
        displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        startAt: data.startAt ? new Date(data.startAt) : null,
        endAt: data.endAt ? new Date(data.endAt) : null,
      },
    });
  }

  public static async updateBanner(id: string, data: any) {
    const payload: any = { ...data };
    if (payload.startAt !== undefined) {
      payload.startAt = payload.startAt ? new Date(payload.startAt) : null;
    }
    if (payload.endAt !== undefined) {
      payload.endAt = payload.endAt ? new Date(payload.endAt) : null;
    }
    return prisma.banner.update({
      where: { id },
      data: payload,
    });
  }

  public static async deleteBanner(id: string) {
    return prisma.banner.delete({
      where: { id },
    });
  }
}

export default BannerService;
