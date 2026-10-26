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

// In-memory registry with sensible default organic hubs (Salem, Bangalore, Chennai)
const deliverySettingsStore = new Map<string, VendorDeliveryConfig>([
  [
    '8888888888',
    {
      vendorPhone: '8888888888',
      vendorName: 'Mathira Organic Salem Farm',
      shopAddress: 'Plot 45, Green Valley Organic Fields, Salem, Tamil Nadu',
      latitude: 11.6643,
      longitude: 78.1460,
      deliveryRadiusKm: 25.0,
      baseDeliveryCharge: 20.0,
      perKmCharge: 6.0,
      freeDistanceKm: 3.0,
      minOrderAmount: 150.0,
      maxDeliveryDistanceKm: 35.0,
      operatingHoursStart: '06:00 AM',
      operatingHoursEnd: '09:00 PM',
      isAcceptingOrders: true,
      applyPerKmToFullDistance: false,
    },
  ],
  [
    'default',
    {
      vendorPhone: '9876543210',
      vendorName: 'Mathira Certified Farmers Hub',
      shopAddress: '12 Organic Corridor, Indiranagar, Bangalore, Karnataka',
      latitude: 12.9784,
      longitude: 77.6408,
      deliveryRadiusKm: 15.0,
      baseDeliveryCharge: 15.0,
      perKmCharge: 5.0,
      freeDistanceKm: 2.0,
      minOrderAmount: 100.0,
      maxDeliveryDistanceKm: 20.0,
      operatingHoursStart: '05:30 AM',
      operatingHoursEnd: '09:30 PM',
      isAcceptingOrders: true,
      applyPerKmToFullDistance: false,
    },
  ],
]);

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
    if (deliverySettingsStore.has(cleanPhone)) {
      return deliverySettingsStore.get(cleanPhone)!;
    }
    return deliverySettingsStore.get('default')!;
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
