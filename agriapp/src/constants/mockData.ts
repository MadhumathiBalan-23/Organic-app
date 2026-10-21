export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  rating: number;
  stock: number;
  minStock: number;
  availabilityStart: string;
  availabilityEnd: string;
  description: string;
  benefits: string[];
  imageUrl: string;
  subscriptionAllowed: boolean;
  oneTimeAllowed: boolean;
  organicCertified: boolean;
}

export const Categories = [
  'All',
  'Dairy & Pure Ghee',
  'Fresh Vegetables',
  'Fresh Fruits',
  'Groceries & Grains',
  'Organic Oils',
  'Dry Fruits & Snacks'
];

export const MockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Organic A2 Cow Milk',
    category: 'Dairy & Pure Ghee',
    price: 85,
    unit: 'Litre',
    rating: 4.8,
    stock: 120,
    minStock: 20,
    availabilityStart: '05:00 AM',
    availabilityEnd: '10:00 AM',
    description: 'Fresh organic A2 cow milk sourced directly from local pastures, untouched by synthetic chemicals and processed using organic methods.',
    benefits: ['Rich in A2 Beta-Casein protein', 'No added preservatives', 'Sourced locally from pasture-fed cows'],
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true
  },
  {
    id: 'p2',
    name: 'Pure Desi Cow Ghee',
    category: 'Dairy & Pure Ghee',
    price: 680,
    unit: '500ml',
    rating: 4.9,
    stock: 45,
    minStock: 10,
    availabilityStart: '06:00 AM',
    availabilityEnd: '09:00 PM',
    description: 'Handcrafted Desi Cow Ghee churned using the traditional Bilona method. Offers rich aroma and health properties.',
    benefits: ['Hand-churned via classical Bilona method', 'Great for digestion and immunity booster', 'High smoke point for healthy cooking'],
    imageUrl: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true
  },
  {
    id: 'p3',
    name: 'Fresh Farm Spinach (Palak)',
    category: 'Fresh Vegetables',
    price: 30,
    unit: 'Bunch',
    rating: 4.5,
    stock: 15,
    minStock: 10,
    availabilityStart: '06:00 AM',
    availabilityEnd: '12:00 PM',
    description: 'Freshly harvested spinach leaves, rich in iron and vitamins, sourced from chemical-free soil.',
    benefits: ['Loaded with Iron and Calcium', 'Harvested on the morning of delivery', 'Thoroughly washed with clean running water'],
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=400',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true
  },
  {
    id: 'p4',
    name: 'Native Organic Bananas',
    category: 'Fresh Fruits',
    price: 60,
    unit: 'Dozen',
    rating: 4.6,
    stock: 75,
    minStock: 15,
    availabilityStart: '06:00 AM',
    availabilityEnd: '08:00 PM',
    description: 'Naturally ripened native sweet bananas directly cut from chemical-free organic orchards.',
    benefits: ['100% naturally ripened without carbide', 'Instant natural energy booster', 'Grown using natural animal compost manure'],
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=400',
    subscriptionAllowed: true,
    oneTimeAllowed: true,
    organicCertified: true
  },
  {
    id: 'p5',
    name: 'Wild Forest Raw Honey',
    category: 'Dry Fruits & Snacks',
    price: 240,
    unit: '250g',
    rating: 4.7,
    stock: 9,
    minStock: 10, // Stock level 9 is less than 10, triggering Low Stock status
    availabilityStart: '08:00 AM',
    availabilityEnd: '09:00 PM',
    description: 'Raw unpasteurized honey filtered directly from honeycombs in deep forests. Retains natural pollens.',
    benefits: ['Unheated, unfiltered and 100% raw', 'Natural immunity shield', 'Rich source of trace vitamins & antioxidants'],
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
    subscriptionAllowed: false,
    oneTimeAllowed: true,
    organicCertified: true
  }
];

export interface Subscription {
  id: string;
  product: Product;
  quantity: number;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  deliveryTime: string;
  duration: number; // in days
  startDate: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  status: 'Active' | 'Paused' | 'Cancelled';
  priceTotal: number;
  autoRenew: boolean;
  confirmationRequired: boolean;
  skippedDates: string[];
}

export const MockSubscriptions: Subscription[] = [
  {
    id: 'sub-01',
    product: MockProducts[0], // Milk
    quantity: 2,
    frequency: 'Daily',
    deliveryTime: '06:30 AM',
    duration: 30,
    startDate: '2026-08-20',
    paymentStatus: 'Paid',
    status: 'Active',
    priceTotal: 5100, // 2 Litres * 85 * 30
    autoRenew: true,
    confirmationRequired: true,
    skippedDates: ['2026-08-23']
  },
  {
    id: 'sub-02',
    product: MockProducts[1], // Ghee
    quantity: 1,
    frequency: 'Monthly',
    deliveryTime: '09:00 AM',
    duration: 90,
    startDate: '2026-08-15',
    paymentStatus: 'Paid',
    status: 'Active',
    priceTotal: 2040, // 1 * 680 * 3 months
    autoRenew: false,
    confirmationRequired: false,
    skippedDates: []
  }
];

export const MockOrders = [
  {
    id: 'ord-10492',
    products: 'Organic A2 Cow Milk x 2L, Spinach x 1 Bunch',
    amount: 200,
    date: '2026-08-24',
    paymentStatus: 'SUCCESS',
    deliveryStatus: 'DELIVERED',
    type: 'One-Time'
  },
  {
    id: 'ord-10493',
    products: 'Organic A2 Cow Milk x 2L (Subscription Delivery)',
    amount: 170,
    date: '2026-08-25',
    paymentStatus: 'SUCCESS',
    deliveryStatus: 'CONFIRMED',
    type: 'Subscription'
  }
];

export const MockAIAlerts = [
  { id: 'al-1', type: 'Demand Prediction', text: 'Milk demand expected to rise by 18% tomorrow due to subscription renewals.', time: '2 hrs ago' },
  { id: 'al-2', type: 'Low Stock Alert', text: 'Tomato and Forest Honey stocks may be insufficient for tomorrow\'s orders.', time: '4 hrs ago' },
  { id: 'al-3', type: 'Delivery Analytics', text: '42 deliveries successfully mapped and routes optimized for tomorrow morning.', time: '5 hrs ago' },
];

export const MockTransactions = [
  { id: 'TXN-90231', subId: 'sub-01', amount: 5100, date: '2026-08-19', method: 'UPI (GPay)', status: 'Paid' },
  { id: 'TXN-76452', subId: 'sub-02', amount: 2040, date: '2026-08-14', method: 'Credit Card', status: 'Paid' }
];

export const MockDeliveries = [
  {
    id: 'del-01',
    customerName: 'Ananya Sharma',
    address: 'Flat 402, Green Glen Layout, Outer Ring Road, Bangalore - 560103',
    products: 'Organic A2 Cow Milk (2 Litres), Fresh Spinach (1 Bunch)',
    quantity: '2L, 1 Bunch',
    deliveryTime: '06:30 AM',
    status: 'Assigned' // Assigned, Picked Up, Out for Delivery, Delivered, Failed
  },
  {
    id: 'del-02',
    customerName: 'Rohan Verma',
    address: 'No 45, Ideal Homes Township, Rajarajeshwari Nagar, Bangalore - 560098',
    products: 'Desi Cow Ghee (500ml)',
    quantity: '1 Jar',
    deliveryTime: '09:00 AM',
    status: 'Delivered'
  }
];

// ── ADMIN PANEL DATA ─────────────────────────────────────

export interface AdminCategory {
  id: string;
  name: string;
  emoji: string;
  productCount: number;
  color: string;
}

export interface AdminBrand {
  id: string;
  name: string;
  emoji: string;
  origin: string;
  productCount: number;
  rating: number;
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  location: string;
  totalOrders: number;
  totalSpend: number;
  status: 'Active' | 'VIP' | 'Inactive';
  joinDate: string;
  lastActive: string;
}

export interface AdminOrder {
  id: string;
  customerId: string;
  customerName: string;
  items: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled';
  date: string;
  paymentMethod: string;
}

export interface AdminUserLog {
  id: string;
  user: string;
  role: string;
  action: string;
  module: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view';
}

export const AdminCategories: AdminCategory[] = [
  { id: 'c1', name: 'Dairy & Pure Ghee', emoji: '🥛', productCount: 18, color: '#3b82f6' },
  { id: 'c2', name: 'Fresh Vegetables', emoji: '🥦', productCount: 32, color: '#22c55e' },
  { id: 'c3', name: 'Fresh Fruits', emoji: '🍎', productCount: 24, color: '#f59e0b' },
  { id: 'c4', name: 'Groceries & Grains', emoji: '🌾', productCount: 15, color: '#d97706' },
  { id: 'c5', name: 'Organic Oils', emoji: '🫒', productCount: 9, color: '#84cc16' },
  { id: 'c6', name: 'Dry Fruits & Snacks', emoji: '🍯', productCount: 11, color: '#f97316' },
];

export const AdminBrands: AdminBrand[] = [
  { id: 'b1', name: 'NatureFarm', emoji: '🌱', origin: 'Tamil Nadu', productCount: 34, rating: 4.8 },
  { id: 'b2', name: 'Pure Harvest', emoji: '🌾', origin: 'Punjab', productCount: 22, rating: 4.6 },
  { id: 'b3', name: 'GreenRoots', emoji: '🌿', origin: 'Kerala', productCount: 18, rating: 4.7 },
  { id: 'b4', name: 'DesiDairy', emoji: '🐄', origin: 'Gujarat', productCount: 14, rating: 4.9 },
  { id: 'b5', name: 'OrganicOasis', emoji: '🏡', origin: 'Karnataka', productCount: 27, rating: 4.5 },
];

export const AdminCustomers: AdminCustomer[] = [
  { id: 'cu1', name: 'Priya Sharma', phone: '9876543210', location: 'Chennai, TN', totalOrders: 34, totalSpend: 12800, status: 'VIP', joinDate: '2024-01-15', lastActive: '2026-09-26' },
  { id: 'cu2', name: 'Arjun Menon', phone: '9123456789', location: 'Kochi, KL', totalOrders: 18, totalSpend: 7400, status: 'Active', joinDate: '2024-03-20', lastActive: '2026-09-25' },
  { id: 'cu3', name: 'Deepika Nair', phone: '8765432109', location: 'Bangalore, KA', totalOrders: 52, totalSpend: 21000, status: 'VIP', joinDate: '2023-11-05', lastActive: '2026-09-27' },
  { id: 'cu4', name: 'Raj Kumar', phone: '9988776655', location: 'Coimbatore, TN', totalOrders: 8, totalSpend: 2800, status: 'Active', joinDate: '2024-06-10', lastActive: '2026-09-20' },
  { id: 'cu5', name: 'Sneha Patel', phone: '8877665544', location: 'Ahmedabad, GJ', totalOrders: 22, totalSpend: 9600, status: 'Active', joinDate: '2024-02-28', lastActive: '2026-09-22' },
  { id: 'cu6', name: 'Vikram Singh', phone: '7766554433', location: 'Jaipur, RJ', totalOrders: 4, totalSpend: 1200, status: 'Inactive', joinDate: '2023-09-14', lastActive: '2026-07-10' },
];

export const AdminOrders: AdminOrder[] = [
  { id: 'ORD-2001', customerId: 'cu1', customerName: 'Priya Sharma', items: 'A2 Milk ×10, Desi Ghee ×1', total: 1530, status: 'Delivered', date: '2026-09-26', paymentMethod: 'UPI' },
  { id: 'ORD-2002', customerId: 'cu3', customerName: 'Deepika Nair', items: 'Wild Honey ×2, Turmeric ×1', total: 620, status: 'Processing', date: '2026-09-27', paymentMethod: 'COD' },
  { id: 'ORD-2003', customerId: 'cu2', customerName: 'Arjun Menon', items: 'Coconut Oil ×2', total: 520, status: 'Pending', date: '2026-09-27', paymentMethod: 'Card' },
  { id: 'ORD-2004', customerId: 'cu5', customerName: 'Sneha Patel', items: 'Country Eggs ×3', total: 270, status: 'Cancelled', date: '2026-09-24', paymentMethod: 'UPI' },
  { id: 'ORD-2005', customerId: 'cu4', customerName: 'Raj Kumar', items: 'Bananas ×5, Tomatoes ×2', total: 380, status: 'Delivered', date: '2026-09-23', paymentMethod: 'Card' },
  { id: 'ORD-2006', customerId: 'cu1', customerName: 'Priya Sharma', items: 'Raw Honey ×3', total: 720, status: 'Delivered', date: '2026-09-20', paymentMethod: 'UPI' },
];

export const AdminUserLogs: AdminUserLog[] = [
  { id: 'l1', user: 'Admin Jeena', role: 'Admin', action: 'Added product: Organic A2 Cow Milk', module: 'Products', timestamp: '2026-09-27T11:32:00', type: 'create' },
  { id: 'l2', user: 'Admin Jeena', role: 'Admin', action: 'Updated price of Desi Ghee to ₹680', module: 'Products', timestamp: '2026-09-27T10:58:00', type: 'update' },
  { id: 'l3', user: 'Manager Ravi', role: 'Manager', action: 'Logged in to admin dashboard', module: 'Auth', timestamp: '2026-09-27T10:15:00', type: 'login' },
  { id: 'l4', user: 'Manager Ravi', role: 'Manager', action: 'Added new brand: OrganicOasis', module: 'Brands', timestamp: '2026-09-27T10:20:00', type: 'create' },
  { id: 'l5', user: 'Admin Jeena', role: 'Admin', action: 'Deleted old category: Bulk Items', module: 'Categories', timestamp: '2026-09-26T18:44:00', type: 'delete' },
  { id: 'l6', user: 'Admin Jeena', role: 'Admin', action: 'Viewed customer profile: Priya Sharma', module: 'Customers', timestamp: '2026-09-26T17:30:00', type: 'view' },
  { id: 'l7', user: 'Manager Ravi', role: 'Manager', action: 'Updated ORD-2002 status to Processing', module: 'Orders', timestamp: '2026-09-27T09:45:00', type: 'update' },
  { id: 'l8', user: 'Staff Preethi', role: 'Manager', action: 'Logged in to admin dashboard', module: 'Auth', timestamp: '2026-09-25T09:00:00', type: 'login' },
  { id: 'l9', user: 'Admin Jeena', role: 'Admin', action: 'Logged out', module: 'Auth', timestamp: '2026-09-24T20:00:00', type: 'logout' },
  { id: 'l10', user: 'Manager Ravi', role: 'Manager', action: 'Updated stock: Basmati Rice', module: 'Products', timestamp: '2026-09-24T15:10:00', type: 'update' },
];

