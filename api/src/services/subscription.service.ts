import { prisma } from '../config/db';
import { ProductService } from './product.service';

const DAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export class SubscriptionService {
  /**
   * Safe JSON parse helper
   */
  private static parseJson(str: any, fallback: any) {
    if (!str) return fallback;
    if (typeof str !== 'string') return str;
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  }

  /**
   * Format settings record with parsed JSON arrays
   */
  public static formatSettings(settings: any) {
    if (!settings) return null;
    return {
      ...settings,
      allowedFrequencies: SubscriptionService.parseJson(settings.allowedFrequencies, ['Daily', 'Weekly', 'Monthly']),
      unitMultipliers: SubscriptionService.parseJson(settings.unitMultipliers, []),
      allowedDeliverySlots: SubscriptionService.parseJson(settings.allowedDeliverySlots, []),
    };
  }

  /**
   * Retrieve or auto-seed product subscription settings
   */
  public static async getSettingsForProduct(productId: string) {
    if (!productId) {
      throw new Error('Product ID is required to fetch subscription settings.');
    }

    let settings = await prisma.productSubscriptionSettings.findUnique({
      where: { productId },
      include: { product: true }
    });

    if (!settings) {
      // Find product to determine category defaults
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new Error(`Product with ID "${productId}" not found.`);
      }

      const isMilk = product.name.toLowerCase().includes('milk');
      const isVegetableOrFruit =
        product.categoryName === 'Fresh Vegetables' ||
        product.categoryName === 'Fresh Fruits';
      const isDairy = product.categoryName === 'Dairy & Pure Ghee';

      let quantityUnit = product.unit || 'Kg';
      let unitMultipliers: any[] = [];
      let allowedDeliverySlots: any[] = [];
      let categoryNotice = '';
      let badgeText = 'Daily Fresh';
      let eveningDeliveryEnabled = false;
      let defaultSlot = '06:00 AM - 08:00 AM';
      let minQty = 1;

      if (isMilk) {
        quantityUnit = 'Litre';
        minQty = 0.25;
        unitMultipliers = [
          { label: '250 ml', qty: 0.25 },
          { label: '500 ml', qty: 0.5 },
          { label: '1 L', qty: 1 },
          { label: '2 L', qty: 2 }
        ];
        allowedDeliverySlots = [
          { id: 'milk_morning', time: '06:00 AM - 09:00 AM', label: 'Morning Delivery', icon: 'sun' },
          { id: 'milk_evening', time: '05:00 PM - 08:00 PM', label: 'Evening Delivery', icon: 'moon' }
        ];
        categoryNotice = 'Milk is delivered in the morning (6:00 AM – 9:00 AM) and evening (5:00 PM – 8:00 PM).';
        badgeText = 'Fresh & Chilled';
        eveningDeliveryEnabled = true;
        defaultSlot = '06:00 AM - 09:00 AM';
      } else if (isVegetableOrFruit) {
        quantityUnit = 'Kg';
        minQty = 0.5;
        unitMultipliers = [
          { label: '500 g', qty: 0.5 },
          { label: '1 Kg', qty: 1 },
          { label: '2 Kg', qty: 2 },
          { label: '5 Kg', qty: 5 }
        ];
        allowedDeliverySlots = [
          { id: 'veg_early', time: '06:00 AM - 08:00 AM', label: 'Early Morning', icon: 'sunrise' },
          { id: 'veg_morning', time: '08:00 AM - 10:00 AM', label: 'Morning', icon: 'sun' }
        ];
        categoryNotice = 'Vegetables and fruits are delivered fresh in the morning between 6:00 AM – 10:00 AM.';
        badgeText = 'Daily Fresh';
        defaultSlot = '06:00 AM - 08:00 AM';
      } else if (isDairy) {
        quantityUnit = product.unit || 'Kg';
        minQty = 0.5;
        unitMultipliers = [
          { label: '250 g/ml', qty: 0.5 },
          { label: '500 g/ml', qty: 1 },
          { label: '1 Kg/L', qty: 2 },
          { label: '2 Kg/L', qty: 4 }
        ];
        allowedDeliverySlots = [
          { id: 'dairy_morning', time: '06:00 AM - 09:00 AM', label: 'Morning Delivery', icon: 'sun' },
          { id: 'dairy_evening', time: '05:00 PM - 08:00 PM', label: 'Evening Delivery', icon: 'moon' }
        ];
        categoryNotice = 'Fresh farm dairy delivered in designated morning and evening delivery windows.';
        badgeText = 'Pure Farm Dairy';
        eveningDeliveryEnabled = true;
        defaultSlot = '06:00 AM - 09:00 AM';
      } else {
        quantityUnit = product.unit || 'Kg';
        minQty = 1;
        unitMultipliers = [
          { label: `1 ${quantityUnit}`, qty: 1 },
          { label: `2 ${quantityUnit}`, qty: 2 },
          { label: `5 ${quantityUnit}`, qty: 5 }
        ];
        allowedDeliverySlots = [
          { id: 'groc_morning', time: '07:00 AM - 10:00 AM', label: 'Morning Slot', icon: 'sun' },
          { id: 'groc_evening', time: '04:00 PM - 07:00 PM', label: 'Evening Slot', icon: 'moon' }
        ];
        categoryNotice = 'Pantry essentials & organic staples delivered in your scheduled drop.';
        badgeText = 'Certified Organic';
        eveningDeliveryEnabled = true;
        defaultSlot = '07:00 AM - 10:00 AM';
      }

      settings = await prisma.productSubscriptionSettings.create({
        data: {
          productId: product.id,
          isSubscriptionEnabled: true,
          allowedFrequencies: JSON.stringify(['Daily', 'Weekly', 'Monthly']),
          minimumQuantity: minQty,
          maximumQuantity: 20,
          quantityUnit,
          unitMultipliers: JSON.stringify(unitMultipliers),
          allowedDeliverySlots: JSON.stringify(allowedDeliverySlots),
          customTimeAllowed: true,
          morningDeliveryEnabled: true,
          eveningDeliveryEnabled,
          defaultSlot,
          minimumDuration: 15,
          maximumDuration: 90,
          deliveryCutoffTime: '21:00',
          categoryNotice,
          badgeText
        },
        include: { product: true }
      });
    }

    return SubscriptionService.formatSettings(settings);
  }

  /**
   * Retrieve all subscription settings
   */
  public static async getAllSettings() {
    const list = await prisma.productSubscriptionSettings.findMany({
      include: { product: true }
    });
    return list.map(SubscriptionService.formatSettings);
  }

  /**
   * Calculate delivery dates, schedule, and dynamic price
   */
  public static async calculateSchedule(params: {
    productId: string;
    quantity: number;
    frequency: 'Daily' | 'Alternate' | 'Weekly' | 'Monthly' | string;
    selectedDays?: string[];
    selectedDates?: number[];
    duration?: number;
    startDate?: string;
    customEndDate?: string;
    skippedDates?: string[];
  }) {
    const {
      productId,
      quantity = 1,
      frequency = 'Daily',
      selectedDays = ['Mon', 'Wed', 'Fri'],
      selectedDates = [1, 15],
      duration = 30,
      startDate,
      customEndDate,
      skippedDates = []
    } = params;

    let product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true }
    });

    if (!product && productId) {
      product = await prisma.product.findFirst({
        where: {
          OR: [
            { name: { contains: productId } },
            { id: { contains: productId } }
          ]
        },
        include: { category: true }
      });
    }

    if (!product) {
      product = await prisma.product.findFirst({ include: { category: true } });
    }

    if (!product) {
      throw new Error(`Product with ID "${productId}" not found.`);
    }

    // Default start date to tomorrow (or earliest eligible day)
    let start = new Date();
    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) start = new Date();
    } else {
      start.setDate(start.getDate() + 1);
    }
    start.setHours(0, 0, 0, 0);

    // End date calculation
    let end = new Date(start);
    if (customEndDate) {
      end = new Date(customEndDate);
      if (isNaN(end.getTime()) || end < start) {
        end = new Date(start);
        end.setDate(end.getDate() + duration - 1);
      }
    } else {
      end.setDate(end.getDate() + duration - 1);
    }
    end.setHours(23, 59, 59, 999);

    const deliveryDates: string[] = [];
    const dayIndices = (selectedDays || []).map(d => DAY_MAP[d] ?? -1).filter(idx => idx !== -1);
    const monthDatesSet = new Set((selectedDates || []).map(Number));

    const curr = new Date(start);
    while (curr <= end) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      let matches = false;
      if (frequency === 'Daily') {
        matches = true;
      } else if (frequency === 'Alternate') {
        const diffDays = Math.round((curr.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        matches = diffDays % 2 === 0;
      } else if (frequency === 'Weekly') {
        const dayOfWeek = curr.getDay();
        matches = dayIndices.includes(dayOfWeek);
      } else if (frequency === 'Monthly') {
        const dayOfMonth = curr.getDate();
        matches = monthDatesSet.has(dayOfMonth);
      }

      if (matches) {
        deliveryDates.push(dateStr);
      }

      curr.setDate(curr.getDate() + 1);
    }

    const skippedSet = new Set(skippedDates || []);
    const activeDeliveries = deliveryDates.filter(d => !skippedSet.has(d));
    const totalDeliveries = Math.max(0, activeDeliveries.length);

    const unitPrice = product.price;
    const pricePerDelivery = Number((unitPrice * quantity).toFixed(2));
    const priceTotal = Math.round(pricePerDelivery * totalDeliveries);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    return {
      product: ProductService.formatProduct(product),
      quantity,
      unit: product.unit || 'Kg',
      frequency,
      selectedDays,
      selectedDates,
      duration: Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1),
      startDate: startStr,
      endDate: endStr,
      totalDeliveries,
      deliveryDates,
      nextDeliveryDate: activeDeliveries[0] || startStr,
      pricePerDelivery,
      priceTotal,
      formula: `${quantity} ${product.unit || 'unit'} × ${totalDeliveries} deliveries × ₹${unitPrice}`
    };
  }

  /**
   * Fetch all subscriptions, optionally filtered by user mobile phone
   */
  public static async getAllSubscriptions(phoneNumber?: string, vendorId?: string) {
    const cleanPhone = phoneNumber ? String(phoneNumber).replace(/[^0-9]/g, '') : '';
    const where: any = {};
    if (cleanPhone) {
      where.OR = [
        { customerPhone: cleanPhone },
        { user: { phoneNumber: cleanPhone } }
      ];
    }
    if (vendorId) {
      const cleanVendorPhone = String(vendorId).replace(/[^0-9]/g, '');
      const vendor = await prisma.vendor.findFirst({
        where: {
          OR: [
            { id: vendorId },
            ...(cleanVendorPhone ? [{ phoneNumber: cleanVendorPhone }] : [])
          ]
        }
      });
      if (vendor) {
        where.vendorId = vendor.id;
      } else {
        where.vendorId = vendorId;
      }
    }

    const subs = await prisma.subscription.findMany({
      where,
      include: {
        vendor: true,
        product: { include: { category: true, subscriptionSettings: true, vendor: true } },
        user: true,
        schedules: { orderBy: { deliveryDate: 'asc' }, take: 10 }
      },
      orderBy: { createdAt: 'desc' }
    });

    return subs.map((s: any) => ({
      ...s,
      vendorName: s.vendor?.businessName || s.product?.vendor?.businessName || 'Certified Organic Partner',
      selectedDays: SubscriptionService.parseJson(s.selectedDays, []),
      selectedDates: SubscriptionService.parseJson(s.selectedDates, []),
      skippedDates: SubscriptionService.parseJson(s.skippedDates, []),
      product: ProductService.formatProduct(s.product)
    }));
  }

  /**
   * Create a new subscription with full database schedule generation
   */
  public static async createSubscription(data: any) {
    const {
      product,
      productId: propProductId,
      quantity = 1,
      frequency = 'Daily',
      selectedDays = [],
      selectedDates = [],
      deliveryTime = '06:30 AM',
      deliverySlot,
      slotType = 'RECOMMENDED',
      duration = 30,
      startDate,
      endDate,
      totalDeliveries: propTotalDeliveries,
      priceTotal: propPriceTotal,
      userPhone,
      phoneNumber,
      phone,
      customerName,
      deliveryAddress,
      autoRenew = true,
      confirmationRequired = true,
      skippedDates = []
    } = data;

    const targetProductId = propProductId || (product ? product.id : null);
    if (!targetProductId) {
      throw new Error('Product ID is required to create a subscription.');
    }

    const cleanPhone = String(userPhone || phoneNumber || phone || '').replace(/[^0-9]/g, '');

    // Associate userId if user exists in database
    let userId: string | null = null;
    if (cleanPhone) {
      try {
        const foundUser = await prisma.user.findUnique({ where: { phoneNumber: cleanPhone } });
        if (foundUser) userId = foundUser.id;
      } catch {}
    }

    // Resolve vendorId strictly
    let targetProduct = await prisma.product.findUnique({
      where: { id: targetProductId },
      include: { vendor: true }
    });
    if (!targetProduct && targetProductId) {
      targetProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { id: { contains: targetProductId } },
            { name: { contains: targetProductId } }
          ]
        },
        include: { vendor: true }
      });
    }
    if (!targetProduct) {
      targetProduct = await prisma.product.findFirst({ include: { vendor: true } });
    }
    const resolvedProductId = targetProduct?.id || targetProductId;
    let resolvedVendorId: string | null = data.vendorId || targetProduct?.vendorId || targetProduct?.vendor?.id || null;
    if (resolvedVendorId) {
      const cleanVPhone = String(resolvedVendorId).replace(/[^0-9]/g, '');
      const v = await prisma.vendor.findFirst({
        where: {
          OR: [
            { id: resolvedVendorId },
            ...(cleanVPhone ? [{ phoneNumber: cleanVPhone }] : [])
          ]
        }
      });
      if (v) resolvedVendorId = v.id;
    }

    // Calculate actual delivery dates and schedule
    const schedule = await SubscriptionService.calculateSchedule({
      productId: resolvedProductId,
      quantity: Number(quantity) || 1,
      frequency,
      selectedDays: Array.isArray(selectedDays) ? selectedDays : SubscriptionService.parseJson(selectedDays, []),
      selectedDates: Array.isArray(selectedDates) ? selectedDates : SubscriptionService.parseJson(selectedDates, []),
      duration: parseInt(String(duration), 10) || 30,
      startDate: startDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      customEndDate: endDate,
      skippedDates: Array.isArray(skippedDates) ? skippedDates : SubscriptionService.parseJson(skippedDates, [])
    });

    const finalPriceTotal = propPriceTotal !== undefined ? Number(propPriceTotal) : schedule.priceTotal;
    const finalTotalDeliveries = propTotalDeliveries !== undefined ? Number(propTotalDeliveries) : schedule.totalDeliveries;

    // Create main Subscription row
    const sub = await prisma.subscription.create({
      data: {
        productId: resolvedProductId,
        vendorId: resolvedVendorId,
        userId: userId || undefined,
        customerPhone: cleanPhone || undefined,
        customerName: customerName || (userId ? undefined : 'Customer'),
        deliveryAddress: deliveryAddress || '',
        quantity: schedule.quantity,
        unit: schedule.unit,
        frequency,
        selectedDays: JSON.stringify(schedule.selectedDays),
        selectedDates: JSON.stringify(schedule.selectedDates),
        deliveryTime: deliveryTime || '06:30 AM',
        deliverySlot: deliverySlot || schedule.product?.name,
        slotType,
        duration: schedule.duration,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        totalDeliveries: finalTotalDeliveries,
        pricePerDelivery: schedule.pricePerDelivery,
        priceTotal: finalPriceTotal,
        paymentStatus: 'Paid',
        status: 'Active',
        autoRenew: Boolean(autoRenew),
        confirmationRequired: Boolean(confirmationRequired),
        skippedDates: JSON.stringify(skippedDates || [])
      },
      include: {
        product: { include: { category: true, vendor: true } },
        vendor: true,
        user: true
      }
    });

    // Batch insert individual schedule drop dates for the subscription
    if (schedule.deliveryDates && schedule.deliveryDates.length > 0) {
      try {
        const scheduleRecords = schedule.deliveryDates.map(date => ({
          subscriptionId: sub.id,
          deliveryDate: date,
          deliveryTime: sub.deliveryTime,
          status: 'SCHEDULED'
        }));
        await prisma.subscriptionDeliverySchedule.createMany({
          data: scheduleRecords
        });
      } catch (err: any) {
        console.warn('⚠️ Could not insert delivery schedules:', err.message);
      }
    }

    const refreshed = await prisma.subscription.findUnique({
      where: { id: sub.id },
      include: {
        product: { include: { category: true } },
        user: true,
        schedules: { orderBy: { deliveryDate: 'asc' }, take: 10 }
      }
    });

    return {
      ...refreshed,
      selectedDays: schedule.selectedDays,
      selectedDates: schedule.selectedDates,
      skippedDates: skippedDates || [],
      product: ProductService.formatProduct(refreshed?.product)
    };
  }

  /**
   * Toggle skip date for an active subscription
   */
  public static async skipDate(id: string, dateToSkip: string) {
    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new Error('Subscription not found');

    const skipped: string[] = SubscriptionService.parseJson(sub.skippedDates, []);
    let updatedSkipped: string[];
    let newStatus = 'SKIPPED';

    if (skipped.includes(dateToSkip)) {
      updatedSkipped = skipped.filter(d => d !== dateToSkip);
      newStatus = 'SCHEDULED';
    } else {
      updatedSkipped = [...skipped, dateToSkip];
      newStatus = 'SKIPPED';
    }

    await prisma.subscription.update({
      where: { id },
      data: { skippedDates: JSON.stringify(updatedSkipped) }
    });

    // Update schedule table
    try {
      await prisma.subscriptionDeliverySchedule.updateMany({
        where: { subscriptionId: id, deliveryDate: dateToSkip },
        data: { status: newStatus }
      });
    } catch {}

    return { success: true, skippedDates: updatedSkipped };
  }

  /**
   * Pause or Resume subscription
   */
  public static async togglePause(id: string) {
    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new Error('Subscription not found');

    const nextStatus = sub.status === 'Active' ? 'Paused' : 'Active';
    const updated = await prisma.subscription.update({
      where: { id },
      data: { status: nextStatus },
      include: { product: true }
    });

    return {
      success: true,
      status: nextStatus,
      subscription: {
        ...updated,
        product: ProductService.formatProduct(updated.product)
      }
    };
  }

  /**
   * Update subscription details
   */
  public static async updateSubscription(id: string, data: any) {
    const { product, schedules, user, ...rest } = data;
    return prisma.subscription.update({
      where: { id },
      data: rest,
      include: { product: true, schedules: true }
    });
  }

  /**
   * Delete / Cancel subscription
   */
  public static async deleteSubscription(id: string) {
    return prisma.subscription.delete({
      where: { id }
    });
  }
}
