import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialCategories = [
  { name: 'Dairy & Pure Ghee', emoji: '🥛', description: 'Fresh A2 milk, cultured curd, churned ghee, and butter', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=300', displayOrder: 1, isActive: true },
  { name: 'Fresh Vegetables', emoji: '🥦', description: 'Chemical-free, farm-picked fresh daily vegetables', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=300', displayOrder: 2, isActive: true },
  { name: 'Fresh Fruits', emoji: '🍎', description: 'Naturally ripened, pesticide-free seasonal fruits', imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=300', displayOrder: 3, isActive: true },
  { name: 'Groceries & Grains', emoji: '🌾', description: 'Heritage grains, brown rice, pulses, and unrefined flours', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300', displayOrder: 4, isActive: true },
  { name: 'Organic Oils', emoji: '🫒', description: 'Wood-churned cold pressed unrefined oils', imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=300', displayOrder: 5, isActive: true },
  { name: 'Dry Fruits & Snacks', emoji: '🍯', description: 'Raw forest honey, organic nuts, and roasted seeds', imageUrl: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=300', displayOrder: 6, isActive: true },
  { name: 'Honey & Preserves', emoji: '🍯', description: 'Raw honey, jams, pickles, chutneys', imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=300', displayOrder: 7, isActive: true },
  { name: 'Eggs & Poultry', emoji: '🥚', description: 'Free-range eggs, country chicken', imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=300', displayOrder: 8, isActive: true },
];

const initialBanners = [
  {
    id: 'banner-1',
    title: 'Grand Festive Harvest 🪔',
    subtitle: 'Pure A2 Bilona Ghee, organic jaggery & sweets made with 100% farm purity.',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600',
    backgroundColor: '#C2410C', // Festive Terracotta / Warm Saffron
    textColor: '#FFFFFF',
    buttonColor: '#FDE047',
    buttonTextColor: '#78350F',
    buttonText: 'Celebrate Now ✨',
    targetType: 'CATEGORY',
    targetId: 'Dairy & Pure Ghee',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'banner-2',
    title: 'Daily Morning A2 Desi Milk 🥛',
    subtitle: 'Chilled glass bottles delivered straight from grass-fed cows by 6:30 AM.',
    imageUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&q=80&w=600',
    backgroundColor: '#0F766E', // Morning Deep Pure Teal
    textColor: '#FFFFFF',
    buttonColor: '#FEF08A',
    buttonTextColor: '#134E4A',
    buttonText: 'Subscribe Daily 🥛',
    targetType: 'SCREEN',
    targetId: 'MY_SUBSCRIPTIONS',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'banner-3',
    title: 'Farm Fresh Organic Harvest 🌿',
    subtitle: 'Zero chemicals, 100% certified pesticide-free from local accredited farms.',
    imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=600',
    backgroundColor: '#07843D', // Deep Emerald Organic Green
    textColor: '#FFFFFF',
    buttonColor: '#F2C500',
    buttonTextColor: '#18352B',
    buttonText: 'Shop Harvest →',
    targetType: 'SCREEN',
    targetId: 'ALL_PRODUCTS',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'banner-4',
    title: 'Royal Festive Hampers 🎁',
    subtitle: 'Premium organic almonds, cashews, forest honey & festive gift baskets.',
    imageUrl: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=600',
    backgroundColor: '#831843', // Royal Festive Ruby / Magenta
    textColor: '#FFFFFF',
    buttonColor: '#FBBF24',
    buttonTextColor: '#4C0519',
    buttonText: 'Gift Health 🎁',
    targetType: 'CATEGORY',
    targetId: 'Dry Fruits & Snacks',
    displayOrder: 4,
    isActive: true,
  },
];

const initialBrands = [
  { name: 'DesiDairy', emoji: '🐄', origin: 'Gujarat', productCount: 14, established: '2016', rating: 4.9 },
  { name: 'NatureFarm', emoji: '🌱', origin: 'Tamil Nadu', productCount: 34, established: '2018', rating: 4.8 },
  { name: 'GreenRoots', emoji: '🌿', origin: 'Kerala', productCount: 18, established: '2019', rating: 4.7 },
  { name: 'Pure Harvest', emoji: '🌾', origin: 'Punjab', productCount: 22, established: '2015', rating: 4.6 },
  { name: 'OrganicOasis', emoji: '🏡', origin: 'Karnataka', productCount: 27, established: '2017', rating: 4.5 },
  { name: 'RuralRich', emoji: '🌻', origin: 'Rajasthan', productCount: 19, established: '2020', rating: 4.4 },
];

const initialProducts = [
  {
    id: 'p1',
    name: 'Organic A2 Desi Cow Milk',
    categoryName: 'Dairy & Pure Ghee',
    brand: 'DesiDairy',
    price: 85,
    unit: 'Litre',
    rating: 4.8,
    stock: 120,
    minStock: 20,
    availabilityStart: '05:00 AM',
    availabilityEnd: '10:00 AM',
    description: 'Fresh organic A2 cow milk sourced directly from local pastures, untouched by synthetic chemicals and processed using traditional organic methods.',
    benefits: JSON.stringify(['Rich in A2 Beta-Casein protein', 'No added preservatives or antibiotics', 'Sourced locally from pasture-fed desi cows']),
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🥛'
  },
  {
    id: 'p2',
    name: 'Pure Desi Cow Bilona Ghee',
    categoryName: 'Dairy & Pure Ghee',
    brand: 'DesiDairy',
    price: 680,
    unit: '500ml',
    rating: 4.9,
    stock: 45,
    minStock: 10,
    availabilityStart: '06:00 AM',
    availabilityEnd: '09:00 PM',
    description: 'Handcrafted Desi Cow Ghee churned using the traditional wooden Bilona method. Offers divine aroma, golden granules, and natural immunity booster.',
    benefits: JSON.stringify(['Hand-churned via classical Bilona method', 'Rich in fat-soluble vitamins A, D, E & K', 'High smoke point for healthy digestive cooking']),
    imageUrl: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🍯'
  },
  {
    id: 'p3',
    name: 'Farm Fresh Baby Spinach (Palak)',
    categoryName: 'Fresh Vegetables',
    brand: 'GreenRoots',
    price: 30,
    unit: 'Bunch',
    rating: 4.6,
    stock: 60,
    minStock: 15,
    availabilityStart: '06:00 AM',
    availabilityEnd: '12:00 PM',
    description: 'Freshly harvested tender spinach leaves, rich in iron, folic acid, and natural chlorophyll, grown in chemical-free virgin soil.',
    benefits: JSON.stringify(['Loaded with natural Iron & Calcium', 'Harvested on the morning of delivery', 'Thoroughly washed with organic bio-purifiers']),
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🥦'
  },
  {
    id: 'p4',
    name: 'Native Organic Robusta Bananas',
    categoryName: 'Fresh Fruits',
    brand: 'GreenRoots',
    price: 60,
    unit: 'Dozen',
    rating: 4.7,
    stock: 75,
    minStock: 15,
    availabilityStart: '06:00 AM',
    availabilityEnd: '08:00 PM',
    description: '100% naturally tree-ripened native sweet bananas harvested from organic hillside orchards without artificial calcium carbide chemicals.',
    benefits: JSON.stringify(['Zero carbide ripening chemicals', 'High potassium & natural dietary fibre', 'Sourced from smallholder organic farmers']),
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🍌'
  },
  {
    id: 'p5',
    name: 'Wild Forest Raw Organic Honey',
    categoryName: 'Dry Fruits & Snacks',
    brand: 'NatureFarm',
    price: 240,
    unit: '250g',
    rating: 4.9,
    stock: 35,
    minStock: 10,
    availabilityStart: '08:00 AM',
    availabilityEnd: '09:00 PM',
    description: 'Raw unpasteurized organic honey filtered directly from wild forest beehives. Packed with active bee pollen, beneficial enzymes, and natural nectar.',
    benefits: JSON.stringify(['Unheated, unfiltered & 100% pure raw nectar', 'Natural antibacterial & immunity booster', 'Sustainably harvested without hurting bee colonies']),
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: false,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🍯'
  },
  {
    id: 'p6',
    name: 'Wood Churned Groundnut Oil',
    categoryName: 'Organic Oils',
    brand: 'OrganicOasis',
    price: 320,
    unit: '1 Litre',
    rating: 4.8,
    stock: 40,
    minStock: 10,
    availabilityStart: '07:00 AM',
    availabilityEnd: '09:00 PM',
    description: 'Cold-pressed in traditional wooden chekku apparatus at low temperatures. Retains authentic nutty aroma, heart-friendly mono-unsaturated fats, and natural vitamin E.',
    benefits: JSON.stringify(['Extracted at cold temperatures below 40°C', 'Free from chemical hexane refining solvents', 'Zero trans fats and unadulterated pure seed oil']),
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🫒'
  },
  {
    id: 'p7',
    name: 'Farm-Fresh Vine Country Tomatoes',
    categoryName: 'Fresh Vegetables',
    brand: 'GreenRoots',
    price: 45,
    unit: '1 Kg',
    rating: 4.5,
    stock: 85,
    minStock: 20,
    availabilityStart: '06:00 AM',
    availabilityEnd: '06:00 PM',
    description: 'Juicy, plump heirloom country tomatoes picked ripe from the vine at dawn. Naturally sweet, tangy, and bursting with fresh flavor and lycopene.',
    benefits: JSON.stringify(['Rich in antioxidant Lycopene & Vitamin C', 'Grown in nutrient-rich organic compost', 'Delivered within 24 hours of farm harvest']),
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🍅'
  },
  {
    id: 'p8',
    name: 'Organic Aged Basmati Brown Rice',
    categoryName: 'Groceries & Grains',
    brand: 'Pure Harvest',
    price: 195,
    unit: '1 Kg',
    rating: 4.7,
    stock: 90,
    minStock: 15,
    availabilityStart: '07:00 AM',
    availabilityEnd: '09:00 PM',
    description: 'Single-origin Himalayan foothills whole grain brown basmati rice. High in natural dietary fiber and slow-release low GI energy with a delicate nutty fragrance.',
    benefits: JSON.stringify(['Naturally low Glycemic Index (GI)', 'Retains healthy outer bran and germ layers', '100% certified pesticide-free organic paddy']),
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🌾'
  },
  {
    id: 'p9',
    name: 'Pure Virgin Cold-Pressed Coconut Oil',
    categoryName: 'Organic Oils',
    brand: 'OrganicOasis',
    price: 260,
    unit: '500ml',
    rating: 4.9,
    stock: 50,
    minStock: 12,
    availabilityStart: '07:00 AM',
    availabilityEnd: '09:00 PM',
    description: 'Centrifuged pure virgin coconut oil made from fresh organic coconuts within 2 hours of harvest. Pristine water-clear clarity with heavenly fresh coconut aroma.',
    benefits: JSON.stringify(['Abundant in Medium Chain Triglycerides (MCTs)', 'Zero heating or chemical bleaching applied', 'Ideal for ketogenic diets, cooking & holistic skin care']),
    imageUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🥥'
  },
  {
    id: 'p10',
    name: 'Pasture-Raised Free-Range Eggs',
    categoryName: 'Dairy & Pure Ghee',
    brand: 'RuralRich',
    price: 95,
    unit: 'Pack of 6',
    rating: 4.8,
    stock: 65,
    minStock: 15,
    availabilityStart: '06:00 AM',
    availabilityEnd: '11:00 AM',
    description: 'Farm-fresh country eggs laid by pasture-foraged free-range hens fed on natural grains, herbs, and morning sunlight. Deep golden yolks packed with natural Omega-3.',
    benefits: JSON.stringify(['Hens raised cage-free on organic green pastures', 'No hormones, artificial coloring or antibiotic feeds', 'Twice the Omega-3 fatty acids of factory eggs']),
    imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🥚'
  },
  {
    id: 'p11',
    name: 'Crunchy Farm Fresh Carrots',
    categoryName: 'Fresh Vegetables',
    brand: 'GreenRoots',
    price: 55,
    unit: '1 Kg',
    rating: 4.8,
    stock: 95,
    minStock: 20,
    availabilityStart: '06:00 AM',
    availabilityEnd: '06:00 PM',
    description: 'Crisp, sweet organic carrots harvested directly from mountain soil in Ooty. Loaded with natural beta-carotene and dietary fiber.',
    benefits: JSON.stringify(['High in Vitamin A & Beta-Carotene', 'Naturally sweet and pesticide-free', 'Harvested fresh from hillside beds']),
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🥕'
  },
  {
    id: 'p12',
    name: 'Crisp Shimla Royal Apples',
    categoryName: 'Fresh Fruits',
    brand: 'RuralRich',
    price: 180,
    unit: '1 Kg',
    rating: 4.9,
    stock: 70,
    minStock: 15,
    availabilityStart: '07:00 AM',
    availabilityEnd: '08:00 PM',
    description: 'Juicy, fragrant organic Shimla apples harvested from high-altitude Himalayan orchards with zero wax coating or artificial shine.',
    benefits: JSON.stringify(['100% Wax-Free natural skin', 'Rich in dietary antioxidants & Vitamin C', 'Picked directly from high-altitude orchards']),
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🍎'
  },
  {
    id: 'p13',
    name: 'Organic Fresh Malai Paneer',
    categoryName: 'Dairy & Pure Ghee',
    brand: 'DesiDairy',
    price: 120,
    unit: '200g',
    rating: 4.9,
    stock: 55,
    minStock: 10,
    availabilityStart: '05:30 AM',
    availabilityEnd: '11:00 AM',
    description: 'Melt-in-the-mouth cottage cheese crafted from pure whole A2 cow milk using organic lemon curdling. Ultra soft and protein dense.',
    benefits: JSON.stringify(['Prepared fresh every morning', 'Rich in milk protein and calcium', 'Zero preservatives or starch fillers']),
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🧀'
  },
  {
    id: 'p14',
    name: 'Farm-Fresh Green Bell Peppers',
    categoryName: 'Fresh Vegetables',
    brand: 'NatureFarm',
    price: 45,
    unit: '500g',
    rating: 4.7,
    stock: 60,
    minStock: 15,
    availabilityStart: '06:00 AM',
    availabilityEnd: '06:00 PM',
    description: 'Crisp, aromatic green capsicums cultivated in organic polyhouses with natural bio-fertilizers. Crunchy texture and fresh aroma.',
    benefits: JSON.stringify(['High in Vitamin C and antioxidants', 'Crisp texture ideal for salads & cooking', 'Zero chemical pesticide residues']),
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🫑'
  },
  {
    id: 'p15',
    name: 'Fresh Organic Button Mushrooms',
    categoryName: 'Fresh Vegetables',
    brand: 'OrganicOasis',
    price: 65,
    unit: '200g Pack',
    rating: 4.8,
    stock: 50,
    minStock: 10,
    availabilityStart: '06:30 AM',
    availabilityEnd: '07:00 PM',
    description: 'Plump, spotless white button mushrooms grown in climate-controlled organic compost beds. High in selenium, potassium, and Vitamin D.',
    benefits: JSON.stringify(['Natural source of Vitamin D & Selenium', 'Harvested daily at button stage for max tenderness', 'Unbleached and chemical-free']),
    imageUrl: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🍄'
  },
  {
    id: 'p16',
    name: 'Ruby Red Fresh Pomegranates',
    categoryName: 'Fresh Fruits',
    brand: 'Pure Harvest',
    price: 160,
    unit: '1 Kg',
    rating: 4.9,
    stock: 45,
    minStock: 12,
    availabilityStart: '07:00 AM',
    availabilityEnd: '08:00 PM',
    description: 'Plump, glossy ruby red pomegranates loaded with sweet, antioxidant-rich arils. Handpicked from certified organic orchards in Maharashtra.',
    benefits: JSON.stringify(['Extremely rich in Punicalagin antioxidants', 'Supports heart health and immunity', 'Sun-ripened on the tree naturally']),
    imageUrl: 'https://images.unsplash.com/photo-1541344999736-83eca872f241?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🍎'
  },
  {
    id: 'p17',
    name: 'Raw California Organic Almonds',
    categoryName: 'Dry Fruits & Snacks',
    brand: 'NatureFarm',
    price: 380,
    unit: '250g',
    rating: 4.9,
    stock: 40,
    minStock: 10,
    availabilityStart: '08:00 AM',
    availabilityEnd: '09:00 PM',
    description: 'Premium unpasteurized whole organic almonds. Plump kernels packed with natural Vitamin E, heart-healthy magnesium, and plant protein.',
    benefits: JSON.stringify(['Unroasted, unsalted, 100% natural', 'High in Vitamin E & healthy fats', 'Airtight packaging for max freshness']),
    imageUrl: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: false,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🥜'
  },
  {
    id: 'p18',
    name: 'Cold-Pressed Pure Sesame Gingelly Oil',
    categoryName: 'Organic Oils',
    brand: 'OrganicOasis',
    price: 290,
    unit: '1 Litre',
    rating: 4.8,
    stock: 35,
    minStock: 10,
    availabilityStart: '07:00 AM',
    availabilityEnd: '09:00 PM',
    description: 'Traditional wood-pressed gingelly oil extracted from premium organic black sesame seeds with palm jaggery. Rich nutty aroma and high smoke point.',
    benefits: JSON.stringify(['Extracted using Vaagai wood press', 'Rich in natural Sesamol antioxidants', 'Zero chemical refining or bleaching']),
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true,
    emoji: '🫒'
  }
];

const initialUsers = [
  { id: 'usr-admin', fullName: 'AgriFlow Admin', email: 'admin@agriflow.org', phoneNumber: '9999999999', role: 'admin', passwordHash: 'OTP_VERIFIED', location: 'Chennai, TN', status: 'Active', totalOrders: 0, totalSpend: 0 },
  { id: 'usr-vendor-jeena', fullName: 'Jeena Farming', email: 'jeenafarming@gmail.com', phoneNumber: '9025255639', role: 'vendor', passwordHash: 'OTP_VERIFIED', location: 'Dharmapuri, TN', status: 'Active', totalOrders: 0, totalSpend: 0 },
  { id: 'usr-c1', fullName: 'Priya Sharma', email: 'priya.sharma@gmail.com', phoneNumber: '9876543210', role: 'customer', passwordHash: 'OTP_VERIFIED', location: 'Chennai, TN', status: 'VIP', totalOrders: 34, totalSpend: 12800 },
  { id: 'usr-c2', fullName: 'Arjun Menon', email: 'arjun.menon@email.com', phoneNumber: '9123456789', role: 'customer', passwordHash: 'OTP_VERIFIED', location: 'Kochi, KL', status: 'Active', totalOrders: 18, totalSpend: 7400 },
  { id: 'usr-c3', fullName: 'Deepika Nair', email: 'deepika.n@email.com', phoneNumber: '8765432109', role: 'customer', passwordHash: 'OTP_VERIFIED', location: 'Bangalore, KA', status: 'VIP', totalOrders: 52, totalSpend: 21000 },
  { id: 'usr-c4', fullName: 'Raj Kumar', email: 'raj.kumar@email.com', phoneNumber: '9988776655', role: 'customer', passwordHash: 'OTP_VERIFIED', location: 'Coimbatore, TN', status: 'Active', totalOrders: 8, totalSpend: 2800 },
  { id: 'usr-c5', fullName: 'Sneha Patel', email: 'sneha.patel@email.com', phoneNumber: '8877665544', role: 'customer', passwordHash: 'OTP_VERIFIED', location: 'Ahmedabad, GJ', status: 'Active', totalOrders: 22, totalSpend: 9600 },
  { id: 'usr-c6', fullName: 'Vikram Singh', email: 'vikram.s@email.com', phoneNumber: '7766554433', role: 'customer', passwordHash: 'OTP_VERIFIED', location: 'Jaipur, RJ', status: 'Inactive', totalOrders: 4, totalSpend: 1200 },
  { id: 'usr-c7', fullName: 'Ananya Krishnan', email: 'ananya.k@email.com', phoneNumber: '9955443322', role: 'customer', passwordHash: 'OTP_VERIFIED', location: 'Hyderabad, TS', status: 'VIP', totalOrders: 29, totalSpend: 14500 },
  { id: 'usr-c8', fullName: 'Rohit Gupta', email: 'rohit.g@email.com', phoneNumber: '8844332211', role: 'customer', passwordHash: 'OTP_VERIFIED', location: 'Delhi, DL', status: 'Active', totalOrders: 6, totalSpend: 1800 },
];

const initialSubscriptions = [
  {
    id: 'sub-01',
    userId: 'usr-c1',
    productId: 'p1', // Milk
    quantity: 2,
    frequency: 'Daily',
    deliveryTime: '06:30 AM',
    duration: 30,
    startDate: '2026-08-20',
    paymentStatus: 'Paid',
    status: 'Active',
    priceTotal: 5100,
    autoRenew: true,
    confirmationRequired: true,
    skippedDates: JSON.stringify(['2026-08-23'])
  },
  {
    id: 'sub-02',
    userId: 'usr-c1',
    productId: 'p2', // Ghee
    quantity: 1,
    frequency: 'Monthly',
    deliveryTime: '09:00 AM',
    duration: 90,
    startDate: '2026-08-15',
    paymentStatus: 'Paid',
    status: 'Active',
    priceTotal: 2040,
    autoRenew: false,
    confirmationRequired: false,
    skippedDates: JSON.stringify([])
  },
  {
    id: 'sub-03',
    userId: 'usr-c3',
    productId: 'p10', // Eggs
    quantity: 2,
    frequency: 'Weekly',
    deliveryTime: '07:00 AM',
    duration: 60,
    startDate: '2026-08-10',
    paymentStatus: 'Paid',
    status: 'Active',
    priceTotal: 1520,
    autoRenew: true,
    confirmationRequired: false,
    skippedDates: JSON.stringify([])
  },
  {
    id: 'sub-04',
    userId: 'usr-c7',
    productId: 'p3', // Spinach
    quantity: 1,
    frequency: 'Daily',
    deliveryTime: '06:30 AM',
    duration: 30,
    startDate: '2026-08-25',
    paymentStatus: 'Paid',
    status: 'Active',
    priceTotal: 900,
    autoRenew: true,
    confirmationRequired: true,
    skippedDates: JSON.stringify([])
  }
];

const initialOrders = [
  {
    id: 'ORD-2001',
    userId: 'usr-c1',
    customerName: 'Priya Sharma',
    customerPhone: '9876543210',
    deliveryAddress: '12 MG Road, Chennai',
    totalAmount: 1530,
    orderType: 'One-Time',
    paymentStatus: 'SUCCESS',
    deliveryStatus: 'DELIVERED',
    paymentMethod: 'UPI'
  },
  {
    id: 'ORD-2002',
    userId: 'usr-c3',
    customerName: 'Deepika Nair',
    customerPhone: '8765432109',
    deliveryAddress: '45 Koramangala, Bangalore',
    totalAmount: 620,
    orderType: 'One-Time',
    paymentStatus: 'SUCCESS',
    deliveryStatus: 'PROCESSING',
    paymentMethod: 'COD'
  },
  {
    id: 'ORD-2003',
    userId: 'usr-c2',
    customerName: 'Arjun Menon',
    customerPhone: '9123456789',
    deliveryAddress: '7 Marine Drive, Kochi',
    totalAmount: 520,
    orderType: 'One-Time',
    paymentStatus: 'SUCCESS',
    deliveryStatus: 'PENDING',
    paymentMethod: 'Card'
  },
  {
    id: 'ORD-2004',
    userId: 'usr-c7',
    customerName: 'Ananya Krishnan',
    customerPhone: '9955443322',
    deliveryAddress: '33 Banjara Hills, Hyderabad',
    totalAmount: 2675,
    orderType: 'Subscription Delivery',
    paymentStatus: 'SUCCESS',
    deliveryStatus: 'DELIVERED',
    paymentMethod: 'UPI'
  },
  {
    id: 'ORD-2005',
    userId: 'usr-c5',
    customerName: 'Sneha Patel',
    customerPhone: '8877665544',
    deliveryAddress: '19 CG Road, Ahmedabad',
    totalAmount: 270,
    orderType: 'One-Time',
    paymentStatus: 'REFUNDED',
    deliveryStatus: 'CANCELLED',
    paymentMethod: 'UPI'
  },
  {
    id: 'ORD-2006',
    userId: 'usr-c4',
    customerName: 'Raj Kumar',
    customerPhone: '9988776655',
    deliveryAddress: '8 RS Puram, Coimbatore',
    totalAmount: 380,
    orderType: 'One-Time',
    paymentStatus: 'SUCCESS',
    deliveryStatus: 'DELIVERED',
    paymentMethod: 'Card'
  },
  {
    id: 'ORD-2007',
    userId: 'usr-c8',
    customerName: 'Rohit Gupta',
    customerPhone: '8844332211',
    deliveryAddress: '22 Lajpat Nagar, Delhi',
    totalAmount: 640,
    orderType: 'One-Time',
    paymentStatus: 'PENDING',
    deliveryStatus: 'PENDING',
    paymentMethod: 'COD'
  },
  {
    id: 'ORD-2008',
    userId: 'usr-c1',
    customerName: 'Priya Sharma',
    customerPhone: '9876543210',
    deliveryAddress: '12 MG Road, Chennai',
    totalAmount: 720,
    orderType: 'One-Time',
    paymentStatus: 'SUCCESS',
    deliveryStatus: 'DELIVERED',
    paymentMethod: 'UPI'
  }
];

const initialDeliveries = [
  {
    id: 'del-01',
    customerName: 'Ananya Sharma',
    address: 'Flat 402, Green Glen Layout, Outer Ring Road, Bangalore - 560103',
    products: 'Organic A2 Cow Milk (2 Litres), Fresh Spinach (1 Bunch)',
    quantity: '2L, 1 Bunch',
    deliveryTime: '06:30 AM',
    status: 'Assigned'
  },
  {
    id: 'del-02',
    customerName: 'Rohan Verma',
    address: 'No 45, Ideal Homes Township, Rajarajeshwari Nagar, Bangalore - 560098',
    products: 'Desi Cow Ghee (500ml)',
    quantity: '1 Jar',
    deliveryTime: '09:00 AM',
    status: 'Delivered'
  },
  {
    id: 'del-03',
    customerName: 'Priya Sharma',
    address: '12 MG Road, Chennai - 600001',
    products: 'Organic A2 Cow Milk (2 Litres)',
    quantity: '2 Litres',
    deliveryTime: '06:30 AM',
    status: 'Out for Delivery'
  }
];

const initialUserLogs = [
  { id: 'l1', user: 'Admin Jeena', role: 'Admin', action: 'Added product: Organic A2 Desi Cow Milk', module: 'Products', type: 'create' },
  { id: 'l2', user: 'Admin Jeena', role: 'Admin', action: 'Updated price of Pure Desi Cow Bilona Ghee to ₹680', module: 'Products', type: 'update' },
  { id: 'l3', user: 'Manager Ravi', role: 'Manager', action: 'Logged in to admin dashboard', module: 'Auth', type: 'login' },
  { id: 'l4', user: 'Manager Ravi', role: 'Manager', action: 'Verified certified brand: OrganicOasis', module: 'Brands', type: 'create' },
  { id: 'l5', user: 'Admin Jeena', role: 'Admin', action: 'Synced certified inventory with local farms', module: 'Inventory', type: 'update' },
  { id: 'l6', user: 'Admin Jeena', role: 'Admin', action: 'Viewed VIP customer profile: Priya Sharma', module: 'Customers', type: 'view' },
  { id: 'l7', user: 'Manager Ravi', role: 'Manager', action: 'Updated ORD-2002 status to Processing', module: 'Orders', type: 'update' },
  { id: 'l8', user: 'Staff Preethi', role: 'Manager', action: 'Verified morning delivery schedule', module: 'Deliveries', type: 'update' },
  { id: 'l9', user: 'Admin Jeena', role: 'Admin', action: 'Reviewed monthly crop yield forecasts', module: 'AI Analytics', type: 'view' },
  { id: 'l10', user: 'Manager Ravi', role: 'Manager', action: 'Updated stock: Aged Basmati Rice', module: 'Products', type: 'update' }
];

const initialAIAlerts = [
  { id: 'al-1', type: 'Demand Prediction', text: 'Milk demand expected to rise by 18% tomorrow due to subscription renewals.', time: '2 hrs ago', severity: 'info' },
  { id: 'al-2', type: 'Low Stock Alert', text: 'Tomato and Forest Honey stocks may be insufficient for tomorrow\'s morning orders.', time: '4 hrs ago', severity: 'warning' },
  { id: 'al-3', type: 'Delivery Analytics', text: '42 deliveries successfully mapped and routes optimized for early morning delivery.', time: '5 hrs ago', severity: 'success' }
];

export async function main() {
  console.log('🌱 [Prisma SQLite]: Seeding all organic database records into dev.db...');

  // 1. Categories
  for (const cat of initialCategories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: cat,
      create: cat,
    });
  }
  console.log(`✓ Seeded ${initialCategories.length} Categories into Prisma.`);

  // 2. Brands
  for (const b of initialBrands) {
    await prisma.brand.upsert({
      where: { name: b.name },
      update: b,
      create: b,
    });
  }
  console.log(`✓ Seeded ${initialBrands.length} Brands into Prisma.`);

  // 3. Products
  for (const prod of initialProducts) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: prod,
      create: prod,
    });
  }
  console.log(`✓ Seeded ${initialProducts.length} Products with images & benefits into Prisma.`);

  // 4. Users
  for (const u of initialUsers) {
    await prisma.user.upsert({
      where: { phoneNumber: u.phoneNumber },
      update: u,
      create: u,
    });
  }
  console.log(`✓ Seeded ${initialUsers.length} Users/Customers into Prisma.`);

  // 4b. Single Authorized Vendor: Jeena Farming
  await prisma.vendorRequest.deleteMany({});
  await prisma.vendorRequest.create({
    data: {
      id: 'vr-jeena-01',
      userName: 'Jeena Farming',
      phoneNumber: '9025255639',
      farmName: 'Jeena Farming',
      farmLocation: 'Dharmapuri, Tamil Nadu',
      cropCategories: 'Organic Vegetables, Dairy & Natural Crops',
      experienceYears: '5',
      certificateNo: 'TN-ORG-JEENA-2026',
      status: 'APPROVED',
    }
  });
  console.log(`✓ Seeded single authorized vendor: Jeena Farming (9025255639)`);

  // 5. Subscriptions
  for (const s of initialSubscriptions) {
    await prisma.subscription.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }
  console.log(`✓ Seeded ${initialSubscriptions.length} Subscriptions into Prisma.`);

  // 6. Orders
  for (const o of initialOrders) {
    await prisma.order.upsert({
      where: { id: o.id },
      update: o,
      create: o,
    });
  }
  console.log(`✓ Seeded ${initialOrders.length} Orders into Prisma.`);

  // 7. Deliveries
  for (const d of initialDeliveries) {
    await prisma.delivery.upsert({
      where: { id: d.id },
      update: d,
      create: d,
    });
  }
  console.log(`✓ Seeded ${initialDeliveries.length} Deliveries into Prisma.`);

  // 8. UserLogs
  for (const l of initialUserLogs) {
    await prisma.userLog.upsert({
      where: { id: l.id },
      update: l,
      create: l,
    });
  }
  console.log(`✓ Seeded ${initialUserLogs.length} UserLogs into Prisma.`);

  // 9. AI Alerts
  for (const a of initialAIAlerts) {
    await prisma.aIAlert.upsert({
      where: { id: a.id },
      update: a,
      create: a,
    });
  }
  console.log(`✓ Seeded ${initialAIAlerts.length} AI Alerts into Prisma.`);

  // 10. Promotional Banners
  for (const b of initialBanners) {
    await prisma.banner.upsert({
      where: { id: b.id },
      update: b,
      create: b,
    });
  }
  console.log(`✓ Seeded ${initialBanners.length} Promotional Banners into Prisma.`);

  console.log('✅ [Prisma PostgreSQL]: Entire database seeded and fully stored in agriflow_db!');
}

main()
  .catch((e) => {
    console.error('❌ Prisma seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
