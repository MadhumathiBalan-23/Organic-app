// =============================================
// AgriFlow AI Admin — Mock Data Layer
// =============================================

export interface Product {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  unit: string;
  status: 'Active' | 'Inactive' | 'Low Stock';
  sales: number;
  emoji: string;
}

export interface Category {
  id: number;
  name: string;
  emoji: string;
  description: string;
  productCount: number;
  color: string;
}

export interface Brand {
  id: number;
  name: string;
  emoji: string;
  origin: string;
  productCount: number;
  established: string;
  rating: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  totalOrders: number;
  totalSpend: number;
  status: 'Active' | 'Inactive' | 'VIP';
  avatar: string;
  lastActive: string;
}

export interface Order {
  id: string;
  customerId: number;
  customerName: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled' | 'Returned';
  date: string;
  address: string;
  paymentMethod: string;
}

export interface UserLog {
  id: number;
  user: string;
  role: 'Admin' | 'Manager' | 'Farmer' | 'Customer';
  action: string;
  module: string;
  ip: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view';
}

// ── Categories ──────────────────────────────
export const categories: Category[] = [
  { id: 1, name: 'Dairy Products', emoji: '🥛', description: 'Fresh milk, curd, ghee, paneer, butter', productCount: 18, color: '#3b82f6' },
  { id: 2, name: 'Fresh Vegetables', emoji: '🥦', description: 'Farm-fresh organic vegetables', productCount: 32, color: '#22c55e' },
  { id: 3, name: 'Fresh Fruits', emoji: '🍎', description: 'Seasonal & exotic organic fruits', productCount: 24, color: '#f59e0b' },
  { id: 4, name: 'Grains & Cereals', emoji: '🌾', description: 'Rice, wheat, oats, millets & pulses', productCount: 15, color: '#d97706' },
  { id: 5, name: 'Honey & Preserves', emoji: '🍯', description: 'Raw honey, jams, pickles, chutneys', productCount: 11, color: '#f97316' },
  { id: 6, name: 'Cold Pressed Oils', emoji: '🫒', description: 'Groundnut, coconut, sesame, mustard oils', productCount: 9, color: '#84cc16' },
  { id: 7, name: 'Herbal & Ayurvedic', emoji: '🌿', description: 'Herbs, spices, Ayurvedic products', productCount: 20, color: '#10b981' },
  { id: 8, name: 'Eggs & Poultry', emoji: '🥚', description: 'Free-range eggs, country chicken', productCount: 6, color: '#ef4444' },
];

// ── Brands ──────────────────────────────────
export const brands: Brand[] = [
  { id: 1, name: 'NatureFarm', emoji: '🌱', origin: 'Tamil Nadu', productCount: 34, established: '2018', rating: 4.8 },
  { id: 2, name: 'Pure Harvest', emoji: '🌾', origin: 'Punjab', productCount: 22, established: '2015', rating: 4.6 },
  { id: 3, name: 'GreenRoots', emoji: '🌿', origin: 'Kerala', productCount: 18, established: '2019', rating: 4.7 },
  { id: 4, name: 'DesiDairy', emoji: '🐄', origin: 'Gujarat', productCount: 14, established: '2016', rating: 4.9 },
  { id: 5, name: 'OrganicOasis', emoji: '🏡', origin: 'Karnataka', productCount: 27, established: '2017', rating: 4.5 },
  { id: 6, name: 'RuralRich', emoji: '🌻', origin: 'Rajasthan', productCount: 19, established: '2020', rating: 4.4 },
];

// ── Products ─────────────────────────────────
export const products: Product[] = [
  { id: 1, name: 'Organic A2 Cow Milk', category: 'Dairy Products', brand: 'DesiDairy', price: 85, stock: 1420, unit: 'L', status: 'Active', sales: 1420, emoji: '🥛' },
  { id: 2, name: 'Pure Desi Cow Ghee', category: 'Dairy Products', brand: 'DesiDairy', price: 680, stock: 310, unit: 'Jar', status: 'Active', sales: 310, emoji: '🍯' },
  { id: 3, name: 'Wild Forest Raw Honey', category: 'Honey & Preserves', brand: 'NatureFarm', price: 240, stock: 240, unit: 'Jar', status: 'Active', sales: 240, emoji: '🍯' },
  { id: 4, name: 'Native Organic Bananas', category: 'Fresh Fruits', brand: 'GreenRoots', price: 60, stock: 780, unit: 'Dozen', status: 'Active', sales: 780, emoji: '🍌' },
  { id: 5, name: 'Cold Pressed Groundnut Oil', category: 'Cold Pressed Oils', brand: 'OrganicOasis', price: 320, stock: 18, unit: 'L', status: 'Low Stock', sales: 190, emoji: '🫒' },
  { id: 6, name: 'Organic Turmeric Powder', category: 'Herbal & Ayurvedic', brand: 'NatureFarm', price: 140, stock: 400, unit: 'Kg', status: 'Active', sales: 330, emoji: '🌿' },
  { id: 7, name: 'Free Range Country Eggs', category: 'Eggs & Poultry', brand: 'RuralRich', price: 90, stock: 600, unit: 'Dozen', status: 'Active', sales: 500, emoji: '🥚' },
  { id: 8, name: 'Organic Basmati Rice', category: 'Grains & Cereals', brand: 'Pure Harvest', price: 195, stock: 5, unit: 'Kg', status: 'Low Stock', sales: 900, emoji: '🌾' },
  { id: 9, name: 'Farm Fresh Tomatoes', category: 'Fresh Vegetables', brand: 'GreenRoots', price: 40, stock: 0, unit: 'Kg', status: 'Inactive', sales: 650, emoji: '🍅' },
  { id: 10, name: 'Organic Coconut Oil', category: 'Cold Pressed Oils', brand: 'OrganicOasis', price: 260, stock: 200, unit: 'L', status: 'Active', sales: 420, emoji: '🥥' },
];

// ── Customers ────────────────────────────────
export const customers: Customer[] = [
  { id: 1, name: 'Priya Sharma', email: 'priya.sharma@gmail.com', phone: '9876543210', location: 'Chennai, TN', joinDate: '2024-01-15', totalOrders: 34, totalSpend: 12800, status: 'VIP', avatar: 'PS', lastActive: '2026-09-26' },
  { id: 2, name: 'Arjun Menon', email: 'arjun.menon@email.com', phone: '9123456789', location: 'Kochi, KL', joinDate: '2024-03-20', totalOrders: 18, totalSpend: 7400, status: 'Active', avatar: 'AM', lastActive: '2026-09-25' },
  { id: 3, name: 'Deepika Nair', email: 'deepika.n@email.com', phone: '8765432109', location: 'Bangalore, KA', joinDate: '2023-11-05', totalOrders: 52, totalSpend: 21000, status: 'VIP', avatar: 'DN', lastActive: '2026-09-27' },
  { id: 4, name: 'Raj Kumar', email: 'raj.kumar@email.com', phone: '9988776655', location: 'Coimbatore, TN', joinDate: '2024-06-10', totalOrders: 8, totalSpend: 2800, status: 'Active', avatar: 'RK', lastActive: '2026-09-20' },
  { id: 5, name: 'Sneha Patel', email: 'sneha.patel@email.com', phone: '8877665544', location: 'Ahmedabad, GJ', joinDate: '2024-02-28', totalOrders: 22, totalSpend: 9600, status: 'Active', avatar: 'SP', lastActive: '2026-09-22' },
  { id: 6, name: 'Vikram Singh', email: 'vikram.s@email.com', phone: '7766554433', location: 'Jaipur, RJ', joinDate: '2023-09-14', totalOrders: 4, totalSpend: 1200, status: 'Inactive', avatar: 'VS', lastActive: '2026-07-10' },
  { id: 7, name: 'Ananya Krishnan', email: 'ananya.k@email.com', phone: '9955443322', location: 'Hyderabad, TS', joinDate: '2024-04-01', totalOrders: 29, totalSpend: 14500, status: 'VIP', avatar: 'AK', lastActive: '2026-09-27' },
  { id: 8, name: 'Rohit Gupta', email: 'rohit.g@email.com', phone: '8844332211', location: 'Delhi, DL', joinDate: '2025-01-20', totalOrders: 6, totalSpend: 1800, status: 'Active', avatar: 'RG', lastActive: '2026-09-24' },
];

// ── Orders ───────────────────────────────────
export const orders: Order[] = [
  { id: 'ORD-2001', customerId: 1, customerName: 'Priya Sharma', items: [{ name: 'A2 Cow Milk', qty: 10, price: 85 }, { name: 'Desi Ghee', qty: 1, price: 680 }], total: 1530, status: 'Delivered', date: '2026-09-26', address: '12 MG Road, Chennai', paymentMethod: 'UPI' },
  { id: 'ORD-2002', customerId: 3, customerName: 'Deepika Nair', items: [{ name: 'Wild Honey', qty: 2, price: 240 }, { name: 'Turmeric Powder', qty: 1, price: 140 }], total: 620, status: 'Processing', date: '2026-09-27', address: '45 Koramangala, Bangalore', paymentMethod: 'COD' },
  { id: 'ORD-2003', customerId: 2, customerName: 'Arjun Menon', items: [{ name: 'Coconut Oil', qty: 2, price: 260 }], total: 520, status: 'Pending', date: '2026-09-27', address: '7 Marine Drive, Kochi', paymentMethod: 'Card' },
  { id: 'ORD-2004', customerId: 7, customerName: 'Ananya Krishnan', items: [{ name: 'Organic Rice', qty: 5, price: 195 }, { name: 'A2 Milk', qty: 20, price: 85 }], total: 2675, status: 'Delivered', date: '2026-09-25', address: '33 Banjara Hills, Hyderabad', paymentMethod: 'UPI' },
  { id: 'ORD-2005', customerId: 5, customerName: 'Sneha Patel', items: [{ name: 'Country Eggs', qty: 3, price: 90 }], total: 270, status: 'Cancelled', date: '2026-09-24', address: '19 CG Road, Ahmedabad', paymentMethod: 'UPI' },
  { id: 'ORD-2006', customerId: 4, customerName: 'Raj Kumar', items: [{ name: 'Bananas', qty: 5, price: 60 }, { name: 'Tomatoes', qty: 2, price: 40 }], total: 380, status: 'Delivered', date: '2026-09-23', address: '8 RS Puram, Coimbatore', paymentMethod: 'Card' },
  { id: 'ORD-2007', customerId: 8, customerName: 'Rohit Gupta', items: [{ name: 'Groundnut Oil', qty: 2, price: 320 }], total: 640, status: 'Pending', date: '2026-09-27', address: '22 Lajpat Nagar, Delhi', paymentMethod: 'COD' },
  { id: 'ORD-2008', customerId: 1, customerName: 'Priya Sharma', items: [{ name: 'Raw Honey', qty: 3, price: 240 }], total: 720, status: 'Delivered', date: '2026-09-20', address: '12 MG Road, Chennai', paymentMethod: 'UPI' },
];

// ── User Logs ────────────────────────────────
export const userLogs: UserLog[] = [
  { id: 1, user: 'Admin Jeena', role: 'Admin', action: 'Added new product: Organic A2 Cow Milk', module: 'Products', ip: '192.168.1.10', timestamp: '2026-09-27T11:32:00', type: 'create' },
  { id: 2, user: 'Admin Jeena', role: 'Admin', action: 'Updated price of Desi Ghee to ₹680', module: 'Products', ip: '192.168.1.10', timestamp: '2026-09-27T10:58:00', type: 'update' },
  { id: 3, user: 'Manager Ravi', role: 'Manager', action: 'Logged in to admin dashboard', module: 'Auth', ip: '192.168.1.22', timestamp: '2026-09-27T10:15:00', type: 'login' },
  { id: 4, user: 'Manager Ravi', role: 'Manager', action: 'Added new brand: OrganicOasis', module: 'Brands', ip: '192.168.1.22', timestamp: '2026-09-27T10:20:00', type: 'create' },
  { id: 5, user: 'Admin Jeena', role: 'Admin', action: 'Deleted category: Old Stock', module: 'Categories', ip: '192.168.1.10', timestamp: '2026-09-26T18:44:00', type: 'delete' },
  { id: 6, user: 'Admin Jeena', role: 'Admin', action: 'Viewed customer profile: Priya Sharma', module: 'Customers', ip: '192.168.1.10', timestamp: '2026-09-26T17:30:00', type: 'view' },
  { id: 7, user: 'Manager Ravi', role: 'Manager', action: 'Updated order ORD-2002 status to Processing', module: 'Orders', ip: '192.168.1.22', timestamp: '2026-09-27T09:45:00', type: 'update' },
  { id: 8, user: 'Admin Jeena', role: 'Admin', action: 'Added new category: Herbal & Ayurvedic', module: 'Categories', ip: '192.168.1.10', timestamp: '2026-09-25T14:22:00', type: 'create' },
  { id: 9, user: 'Staff Preethi', role: 'Manager', action: 'Logged in to admin dashboard', module: 'Auth', ip: '192.168.2.5', timestamp: '2026-09-25T09:00:00', type: 'login' },
  { id: 10, user: 'Staff Preethi', role: 'Manager', action: 'Marked order ORD-2006 as Delivered', module: 'Orders', ip: '192.168.2.5', timestamp: '2026-09-25T09:30:00', type: 'update' },
  { id: 11, user: 'Admin Jeena', role: 'Admin', action: 'Logged out', module: 'Auth', ip: '192.168.1.10', timestamp: '2026-09-24T20:00:00', type: 'logout' },
  { id: 12, user: 'Manager Ravi', role: 'Manager', action: 'Updated stock for Basmati Rice', module: 'Products', ip: '192.168.1.22', timestamp: '2026-09-24T15:10:00', type: 'update' },
];

// ── Customer Orders helper ───────────────────
export function getCustomerOrders(customerId: number): Order[] {
  return orders.filter(o => o.customerId === customerId);
}

// ── KPI ─────────────────────────────────────
export const kpiData = {
  totalRevenue: 284600,
  totalOrders: orders.length,
  totalCustomers: customers.length,
  pendingOrders: orders.filter(o => o.status === 'Pending').length,
  processingOrders: orders.filter(o => o.status === 'Processing').length,
  totalProducts: products.length,
  lowStockProducts: products.filter(p => p.status === 'Low Stock').length,
};
