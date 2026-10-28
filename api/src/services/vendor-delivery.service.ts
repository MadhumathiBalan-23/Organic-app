import { prisma } from '../config/db';

export interface VendorDeliveryConfig {
  vendorPhone: string;
  vendorName: string;
  shopAddress: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
  baseDeliveryCharge: number;
  perKmCharge: number;
  freeDistanceKm: number;
  minOrderAmount: number;
  maxDeliveryDistanceKm: number;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  isAcceptingOrders: boolean;
  applyPerKmToFullDistance: boolean;
}

// Dynamic in-memory cache for vendor delivery configurations
const deliverySettingsStore = new Map<string, VendorDeliveryConfig>();

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export class VendorDeliveryService {
  public static async getSettings(vendorPhone?: string): Promise<VendorDeliveryConfig> {
    const cleanPhone = String(vendorPhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone && deliverySettingsStore.has(cleanPhone)) {
      return deliverySettingsStore.get(cleanPhone)!;
    }

    // Attempt to lookup vendor details from database
    let vendorName = '';
    let shopAddress = '';
    if (cleanPhone) {
      try {
        const vendorReq = await prisma.vendorRequest.findFirst({
          where: { phoneNumber: cleanPhone },
          orderBy: { createdAt: 'desc' }
        });
        const user = await prisma.user.findUnique({
          where: { phoneNumber: cleanPhone }
        });
        vendorName = vendorReq?.farmName || user?.fullName || '';
        shopAddress = vendorReq?.farmLocation || user?.location || '';
      } catch {}
    }

    const defaultConfig: VendorDeliveryConfig = {
      vendorPhone: cleanPhone,
      vendorName: vendorName || (cleanPhone ? `Vendor ${cleanPhone}` : ''),
      shopAddress: shopAddress || '',
      latitude: 0,
      longitude: 0,
      deliveryRadiusKm: 15.0,
      baseDeliveryCharge: 0.0,
      perKmCharge: 5.0,
      freeDistanceKm: 2.0,
      minOrderAmount: 0.0,
      maxDeliveryDistanceKm: 30.0,
      operatingHoursStart: '06:00 AM',
      operatingHoursEnd: '09:00 PM',
      isAcceptingOrders: true,
      applyPerKmToFullDistance: false,
    };

    if (cleanPhone) {
      deliverySettingsStore.set(cleanPhone, defaultConfig);
    }

    return defaultConfig;
  }

  public static async saveSettings(config: Partial<VendorDeliveryConfig> & { vendorPhone: string }): Promise<VendorDeliveryConfig> {
    const cleanPhone = String(config.vendorPhone || '').replace(/[^0-9]/g, '');
    const current = await this.getSettings(cleanPhone);

    const updated: VendorDeliveryConfig = {
      ...current,
      ...config,
      vendorPhone: cleanPhone,
      latitude: Number(config.latitude ?? current.latitude),
      longitude: Number(config.longitude ?? current.longitude),
      deliveryRadiusKm: Math.max(1, Number(config.deliveryRadiusKm ?? current.deliveryRadiusKm)),
      baseDeliveryCharge: Math.max(0, Number(config.baseDeliveryCharge ?? current.baseDeliveryCharge)),
      perKmCharge: Math.max(0, Number(config.perKmCharge ?? current.perKmCharge)),
      freeDistanceKm: Math.max(0, Number(config.freeDistanceKm ?? current.freeDistanceKm)),
      minOrderAmount: Math.max(0, Number(config.minOrderAmount ?? current.minOrderAmount)),
      maxDeliveryDistanceKm: Math.max(1, Number(config.maxDeliveryDistanceKm ?? current.maxDeliveryDistanceKm)),
      isAcceptingOrders: config.isAcceptingOrders ?? current.isAcceptingOrders,
      applyPerKmToFullDistance: config.applyPerKmToFullDistance ?? current.applyPerKmToFullDistance,
    };

    deliverySettingsStore.set(cleanPhone, updated);
    return updated;
  }

  public static async calculateFee(
    customerLat: number,
    customerLng: number,
    vendorPhone?: string,
    orderSubtotal?: number
  ) {
    const settings = await this.getSettings(vendorPhone);
    const distanceKm = calculateHaversineDistance(
      customerLat,
      customerLng,
      settings.latitude,
      settings.longitude
    );

    const isDeliverable = distanceKm <= settings.deliveryRadiusKm && settings.isAcceptingOrders;
    let fee = 0;

    if (isDeliverable) {
      if (settings.applyPerKmToFullDistance) {
        fee = Math.round(settings.baseDeliveryCharge + distanceKm * settings.perKmCharge);
      } else {
        const billableKm = Math.max(0, distanceKm - settings.freeDistanceKm);
        fee = Math.round(settings.baseDeliveryCharge + billableKm * settings.perKmCharge);
      }
    }

    return {
      distanceKm,
      deliveryFee: fee,
      isDeliverable,
      deliveryRadiusKm: settings.deliveryRadiusKm,
      baseDeliveryCharge: settings.baseDeliveryCharge,
      perKmCharge: settings.perKmCharge,
      freeDistanceKm: settings.freeDistanceKm,
      minOrderAmount: settings.minOrderAmount,
      vendorName: settings.vendorName,
      shopAddress: settings.shopAddress,
      operatingHours: `${settings.operatingHoursStart} - ${settings.operatingHoursEnd}`,
    };
  }

  public static async getEligibleVendors(customerLat: number, customerLng: number) {
    const results = [];
    for (const [, vendor] of deliverySettingsStore) {
      if (!vendor.latitude || !vendor.longitude) continue;
      const distanceKm = calculateHaversineDistance(
        customerLat,
        customerLng,
        vendor.latitude,
        vendor.longitude
      );

      const isWithinRadius = distanceKm <= vendor.deliveryRadiusKm;
      const billableKm = vendor.applyPerKmToFullDistance
        ? distanceKm
        : Math.max(0, distanceKm - vendor.freeDistanceKm);
      const deliveryFee = Math.round(vendor.baseDeliveryCharge + billableKm * vendor.perKmCharge);

      results.push({
        ...vendor,
        distanceKm,
        isWithinRadius,
        deliveryFee,
        isAcceptingOrders: vendor.isAcceptingOrders,
      });
    }

    // Sort by distance (nearest first)
    return results.sort((a, b) => a.distanceKm - b.distanceKm);
  }
}
