const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSettings() {
  console.log('Seeding ProductSubscriptionSettings for all products in database...');
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products.`);

  for (const product of products) {
    const isMilk = product.name.toLowerCase().includes('milk');
    const isVegetableOrFruit =
      product.categoryName === 'Fresh Vegetables' ||
      product.categoryName === 'Fresh Fruits';
    const isDairy = product.categoryName === 'Dairy & Pure Ghee';

    let quantityUnit = product.unit || 'Kg';
    let unitMultipliers = [];
    let allowedDeliverySlots = [];
    let categoryNotice = '';
    let badgeText = 'Daily Fresh';
    let morningDeliveryEnabled = true;
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
      eveningDeliveryEnabled = false;
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

    await prisma.productSubscriptionSettings.upsert({
      where: { productId: product.id },
      update: {
        isSubscriptionEnabled: true,
        allowedFrequencies: JSON.stringify(['Daily', 'Weekly', 'Monthly']),
        minimumQuantity: minQty,
        maximumQuantity: 20,
        quantityUnit,
        unitMultipliers: JSON.stringify(unitMultipliers),
        allowedDeliverySlots: JSON.stringify(allowedDeliverySlots),
        customTimeAllowed: true,
        morningDeliveryEnabled,
        eveningDeliveryEnabled,
        defaultSlot,
        minimumDuration: 15,
        maximumDuration: 90,
        deliveryCutoffTime: '21:00',
        categoryNotice,
        badgeText
      },
      create: {
        productId: product.id,
        isSubscriptionEnabled: true,
        allowedFrequencies: JSON.stringify(['Daily', 'Weekly', 'Monthly']),
        minimumQuantity: minQty,
        maximumQuantity: 20,
        quantityUnit,
        unitMultipliers: JSON.stringify(unitMultipliers),
        allowedDeliverySlots: JSON.stringify(allowedDeliverySlots),
        customTimeAllowed: true,
        morningDeliveryEnabled,
        eveningDeliveryEnabled,
        defaultSlot,
        minimumDuration: 15,
        maximumDuration: 90,
        deliveryCutoffTime: '21:00',
        categoryNotice,
        badgeText
      }
    });
  }

  console.log('✅ Successfully seeded ProductSubscriptionSettings for all products!');
}

seedSettings()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
