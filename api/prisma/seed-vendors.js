const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Vendors and Vendor-Specific Products...');

  // 1. Create or upsert Vendors
  const vendorsData = [
    {
      id: 'v-jeena',
      businessName: 'Jeena Farming',
      ownerName: 'Jeena',
      phoneNumber: '9025255639',
      email: 'jeenafarming@gmail.com',
      address: 'Dharmapuri, Tamil Nadu',
      latitude: 12.1211,
      longitude: 78.1582,
      deliveryRadiusKm: 25.0,
      rating: 4.9,
      status: 'ACTIVE',
    },
    {
      id: 'v-sundaram',
      businessName: 'Organic Valley Farms',
      ownerName: 'Sundaram Farmer',
      phoneNumber: '9876500003',
      email: 'sundaram@organicvalley.in',
      address: 'Salem, Tamil Nadu',
      latitude: 11.6643,
      longitude: 78.1460,
      deliveryRadiusKm: 20.0,
      rating: 4.8,
      status: 'ACTIVE',
    },
    {
      id: 'v-greenearth',
      businessName: 'Green Earth Organics',
      ownerName: 'Kavitha R.',
      phoneNumber: '9344193569',
      email: 'kavitha@greenearth.org',
      address: 'Erode, Tamil Nadu',
      latitude: 11.3410,
      longitude: 77.7172,
      deliveryRadiusKm: 30.0,
      rating: 4.7,
      status: 'ACTIVE',
    },
  ];

  for (const v of vendorsData) {
    // Find matching user by phone if exists
    const user = await prisma.user.findUnique({ where: { phoneNumber: v.phoneNumber } });
    await prisma.vendor.upsert({
      where: { phoneNumber: v.phoneNumber },
      update: {
        id: v.id,
        businessName: v.businessName,
        ownerName: v.ownerName,
        address: v.address,
        latitude: v.latitude,
        longitude: v.longitude,
        deliveryRadiusKm: v.deliveryRadiusKm,
        rating: v.rating,
        status: v.status,
        userId: user ? user.id : undefined,
      },
      create: {
        id: v.id,
        businessName: v.businessName,
        ownerName: v.ownerName,
        phoneNumber: v.phoneNumber,
        email: v.email,
        address: v.address,
        latitude: v.latitude,
        longitude: v.longitude,
        deliveryRadiusKm: v.deliveryRadiusKm,
        rating: v.rating,
        status: v.status,
        userId: user ? user.id : undefined,
      },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'vendor', vendorStatus: 'APPROVED' },
      });
    }
  }
  console.log('Vendors seeded successfully.');

  // 2. Assign existing products to vendors
  // Vendor A (Jeena Farming): p1 (Milk), p11 (Carrot), p12 (Tomato), p3 (Spinach), p5 (Honey), p6 (Groundnut Oil)
  const jeenaProductIds = ['p1', 'p11', 'p12', 'p3', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'];
  await prisma.product.updateMany({
    where: { id: { in: jeenaProductIds } },
    data: { vendorId: 'v-jeena', brand: 'Jeena Farming' },
  });

  // Ensure p11 is ₹50/Kg for Vendor A as specified in the prompt
  await prisma.product.update({
    where: { id: 'p11' },
    data: { price: 50, vendorId: 'v-jeena', brand: 'Jeena Farming' },
  });

  // Ensure p1 is ₹60/Litre for Vendor A as specified in the prompt
  await prisma.product.update({
    where: { id: 'p1' },
    data: { price: 60, vendorId: 'v-jeena', brand: 'Jeena Farming' },
  });

  // Vendor B (Organic Valley Farms): p2 (Bilona Ghee), p4 (Bananas), p13 (Apples), p14 (Eggs), p16 (Coconuts)
  const sundaramProductIds = ['p2', 'p4', 'p13', 'p14', 'p16', 'p18', 'p19', 'p20'];
  await prisma.product.updateMany({
    where: { id: { in: sundaramProductIds } },
    data: { vendorId: 'v-sundaram', brand: 'Organic Valley' },
  });

  // Vendor C (Green Earth Organics): p15, p17, p21, p22
  const greenEarthProductIds = ['p15', 'p17', 'p21', 'p22'];
  await prisma.product.updateMany({
    where: { id: { in: greenEarthProductIds } },
    data: { vendorId: 'v-greenearth', brand: 'Green Earth' },
  });

  // 3. Create Vendor B's Carrot (₹60/Kg) - separate vendor product listing!
  const carrotB = await prisma.product.upsert({
    where: { id: 'p_carrot_v2' },
    update: {
      name: 'Crunchy Farm Fresh Carrots',
      categoryName: 'Fresh Vegetables',
      price: 60,
      unit: 'Kg',
      stock: 85,
      vendorId: 'v-sundaram',
      brand: 'Organic Valley Farms',
      imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=400',
      description: 'Naturally grown crisp orange carrots cultivated in Salem organic fields.',
      benefits: JSON.stringify(['High in Vitamin A', '100% Organically Harvested', 'Chemical Free']),
      subscriptionAllowed: true,
      oneTimeAllowed: true,
    },
    create: {
      id: 'p_carrot_v2',
      name: 'Crunchy Farm Fresh Carrots',
      categoryName: 'Fresh Vegetables',
      price: 60,
      unit: 'Kg',
      stock: 85,
      vendorId: 'v-sundaram',
      brand: 'Organic Valley Farms',
      imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=400',
      description: 'Naturally grown crisp orange carrots cultivated in Salem organic fields.',
      benefits: JSON.stringify(['High in Vitamin A', '100% Organically Harvested', 'Chemical Free']),
      subscriptionAllowed: true,
      oneTimeAllowed: true,
    },
  });

  // Seed subscription settings for Carrot B
  await prisma.productSubscriptionSettings.upsert({
    where: { productId: 'p_carrot_v2' },
    update: {
      quantityUnit: 'Kg',
      minimumQuantity: 0.5,
      maximumQuantity: 20,
      unitMultipliers: JSON.stringify([
        { label: '500 g', qty: 0.5 },
        { label: '1 Kg', qty: 1 },
        { label: '2 Kg', qty: 2 },
        { label: '5 Kg', qty: 5 },
      ]),
      allowedDeliverySlots: JSON.stringify([
        { id: 'veg_early', time: '06:00 AM - 08:00 AM', label: 'Early Morning', icon: 'sunrise' },
        { id: 'veg_morning', time: '08:00 AM - 10:00 AM', label: 'Morning', icon: 'sun' },
      ]),
      defaultSlot: '06:00 AM - 08:00 AM',
      categoryNotice: 'Vegetables are delivered fresh in the morning between 6:00 AM – 10:00 AM.',
      badgeText: 'Daily Fresh',
    },
    create: {
      productId: 'p_carrot_v2',
      quantityUnit: 'Kg',
      minimumQuantity: 0.5,
      maximumQuantity: 20,
      unitMultipliers: JSON.stringify([
        { label: '500 g', qty: 0.5 },
        { label: '1 Kg', qty: 1 },
        { label: '2 Kg', qty: 2 },
        { label: '5 Kg', qty: 5 },
      ]),
      allowedDeliverySlots: JSON.stringify([
        { id: 'veg_early', time: '06:00 AM - 08:00 AM', label: 'Early Morning', icon: 'sunrise' },
        { id: 'veg_morning', time: '08:00 AM - 10:00 AM', label: 'Morning', icon: 'sun' },
      ]),
      defaultSlot: '06:00 AM - 08:00 AM',
      categoryNotice: 'Vegetables are delivered fresh in the morning between 6:00 AM – 10:00 AM.',
      badgeText: 'Daily Fresh',
    },
  });

  // 4. Create Vendor C's Milk (₹60/Litre) - separate vendor product listing!
  const milkC = await prisma.product.upsert({
    where: { id: 'p_milk_v3' },
    update: {
      name: 'Organic A2 Desi Cow Milk',
      categoryName: 'Dairy & Pure Ghee',
      price: 65,
      unit: 'Litre',
      stock: 60,
      vendorId: 'v-greenearth',
      brand: 'Green Earth Organics',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
      description: 'Chilled pure raw A2 Desi cow milk packaged fresh every sunrise and sunset in Erode.',
      benefits: JSON.stringify(['100% Native A2 Beta-Casein', 'Free from Hormones & Antibiotics', 'Farm Chilled']),
      subscriptionAllowed: true,
      oneTimeAllowed: true,
    },
    create: {
      id: 'p_milk_v3',
      name: 'Organic A2 Desi Cow Milk',
      categoryName: 'Dairy & Pure Ghee',
      price: 65,
      unit: 'Litre',
      stock: 60,
      vendorId: 'v-greenearth',
      brand: 'Green Earth Organics',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
      description: 'Chilled pure raw A2 Desi cow milk packaged fresh every sunrise and sunset in Erode.',
      benefits: JSON.stringify(['100% Native A2 Beta-Casein', 'Free from Hormones & Antibiotics', 'Farm Chilled']),
      subscriptionAllowed: true,
      oneTimeAllowed: true,
    },
  });

  // Seed subscription settings for Milk C
  await prisma.productSubscriptionSettings.upsert({
    where: { productId: 'p_milk_v3' },
    update: {
      quantityUnit: 'Litre',
      minimumQuantity: 0.25,
      maximumQuantity: 20,
      unitMultipliers: JSON.stringify([
        { label: '250 ml', qty: 0.25 },
        { label: '500 ml', qty: 0.5 },
        { label: '1 L', qty: 1 },
        { label: '2 L', qty: 2 },
      ]),
      allowedDeliverySlots: JSON.stringify([
        { id: 'milk_morning', time: '06:00 AM - 09:00 AM', label: 'Morning Delivery', icon: 'sun' },
        { id: 'milk_evening', time: '05:00 PM - 08:00 PM', label: 'Evening Delivery', icon: 'moon' },
      ]),
      defaultSlot: '06:00 AM - 09:00 AM',
      eveningDeliveryEnabled: true,
      categoryNotice: 'Milk is delivered in the morning (6:00 AM – 9:00 AM) and evening (5:00 PM – 8:00 PM).',
      badgeText: 'Fresh & Chilled',
    },
    create: {
      productId: 'p_milk_v3',
      quantityUnit: 'Litre',
      minimumQuantity: 0.25,
      maximumQuantity: 20,
      unitMultipliers: JSON.stringify([
        { label: '250 ml', qty: 0.25 },
        { label: '500 ml', qty: 0.5 },
        { label: '1 L', qty: 1 },
        { label: '2 L', qty: 2 },
      ]),
      allowedDeliverySlots: JSON.stringify([
        { id: 'milk_morning', time: '06:00 AM - 09:00 AM', label: 'Morning Delivery', icon: 'sun' },
        { id: 'milk_evening', time: '05:00 PM - 08:00 PM', label: 'Evening Delivery', icon: 'moon' },
      ]),
      defaultSlot: '06:00 AM - 09:00 AM',
      eveningDeliveryEnabled: true,
      categoryNotice: 'Milk is delivered in the morning (6:00 AM – 9:00 AM) and evening (5:00 PM – 8:00 PM).',
      badgeText: 'Fresh & Chilled',
    },
  });

  console.log('Seeded multi-vendor products with distinct VendorIDs and prices! ✅');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
