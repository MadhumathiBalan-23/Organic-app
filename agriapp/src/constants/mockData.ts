// =============================================
// AgriApp — Live API Data Service Layer
// (Mock data removed: all data retrieved directly via SQLite Prisma API)
// =============================================

import { API_BASE } from '../services/api';

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

export const ORGANIC_PRODUCT_PRESETS = [
  // Dairy & Pure Ghee
  { label: 'A2 Cow Milk', category: 'Dairy & Pure Ghee', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600' },
  { label: 'Bilona Cow Ghee', category: 'Dairy & Pure Ghee', url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=600' },
  { label: 'Fresh Malai Paneer', category: 'Dairy & Pure Ghee', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600' },
  { label: 'Country Eggs', category: 'Dairy & Pure Ghee', url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=600' },
  { label: 'Clay Pot Curd', category: 'Dairy & Pure Ghee', url: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&q=80&w=600' },

  // Fresh Vegetables
  { label: 'Vine Fresh Tomatoes', category: 'Fresh Vegetables', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600' },
  { label: 'Baby Spinach (Palak)', category: 'Fresh Vegetables', url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=600' },
  { label: 'Mountain Carrots', category: 'Fresh Vegetables', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=600' },
  { label: 'Green Bell Peppers', category: 'Fresh Vegetables', url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&q=80&w=600' },
  { label: 'Fresh Broccoli', category: 'Fresh Vegetables', url: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&q=80&w=600' },
  { label: 'Button Mushrooms', category: 'Fresh Vegetables', url: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&q=80&w=600' },
  { label: 'Baby Potatoes', category: 'Fresh Vegetables', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600' },

  // Fresh Fruits
  { label: 'Robusta Bananas', category: 'Fresh Fruits', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=600' },
  { label: 'Shimla Royal Apples', category: 'Fresh Fruits', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=600' },
  { label: 'Ruby Pomegranates', category: 'Fresh Fruits', url: 'https://images.unsplash.com/photo-1541344999736-83eca872f241?auto=format&fit=crop&q=80&w=600' },
  { label: 'Organic Strawberries', category: 'Fresh Fruits', url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=600' },
  { label: 'Sweet Farm Oranges', category: 'Fresh Fruits', url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=80&w=600' },

  // Groceries & Grains
  { label: 'Basmati Brown Rice', category: 'Groceries & Grains', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600' },
  { label: 'Organic Wheat Grain', category: 'Groceries & Grains', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600' },

  // Oils & Dry Fruits
  { label: 'Cold-Pressed Groundnut Oil', category: 'Organic Oils', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600' },
  { label: 'Virgin Coconut Oil', category: 'Organic Oils', url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=600' },
  { label: 'Wild Forest Raw Honey', category: 'Dry Fruits & Snacks', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600' },
  { label: 'Raw California Almonds', category: 'Dry Fruits & Snacks', url: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=600' },
];

export const defaultProduct: Product = {
  id: 'p-default',
  name: 'Organic Desi Produce',
  category: 'Dairy & Pure Ghee',
  price: 85,
  unit: 'Litre',
  rating: 4.8,
  stock: 100,
  minStock: 20,
  availabilityStart: '05:00 AM',
  availabilityEnd: '10:00 AM',
  description: 'Farm-fresh certified organic produce sourced directly from accredited farmers.',
  benefits: ['100% Pesticide Free', 'Certified Organic', 'Farm-to-Door Dispatch'],
  imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600',
  subscriptionAllowed: true,
  oneTimeAllowed: true,
  organicCertified: true
};

export interface Subscription {
  id: string;
  product: Product;
  quantity: number;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Alternative Days';
  deliveryTime: string;
  duration: number;
  startDate: string;
  paymentStatus: 'Paid' | 'Pending';
  status: 'Active' | 'Paused' | 'Cancelled';
  priceTotal: number;
  autoRenew: boolean;
  confirmationRequired: boolean;
  skippedDates: string[];
}

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

// Zero mock records — collections populated live from the backend API
// A safe Proxy fallback ensures index-0 access before API loads never causes undefined crashes
const createSafeArray = <T>(fallback: T): T[] => {
  const arr: T[] = [];
  return new Proxy(arr, {
    get(target, prop, receiver) {
      if (prop === '0' && target.length === 0) {
        return fallback;
      }
      return Reflect.get(target, prop, receiver);
    }
  });
};

export const MockProducts: Product[] = createSafeArray<Product>(defaultProduct);
export const MockSubscriptions: Subscription[] = [];
export const MockOrders: any[] = [];
export const MockAIAlerts: any[] = [];
export const MockTransactions: any[] = [];
export const MockDeliveries: any[] = [];

export const AdminCategories: AdminCategory[] = [];
export const AdminBrands: AdminBrand[] = [];
export const AdminCustomers: AdminCustomer[] = [];
export const AdminOrders: AdminOrder[] = [];
export const AdminUserLogs: AdminUserLog[] = [];

// ── LIVE API FETCHERS ─────────────────────────────────────────

export async function fetchProductsFromDB(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/products`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map((p: any) => ({
        ...p,
        category: typeof p.category === 'object' && p.category !== null ? p.category.name : (p.categoryName || p.category || 'Organic'),
        benefits: Array.isArray(p.benefits) ? p.benefits : (typeof p.benefits === 'string' ? JSON.parse(p.benefits || '[]') : [])
      }));
    }
  } catch (e) {
    console.warn('API fetch products error:', e);
  }
  return [];
}

export async function fetchSubscriptionsFromDB(): Promise<Subscription[]> {
  try {
    const res = await fetch(`${API_BASE}/subscriptions`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map((s: any) => ({
        id: s.id,
        product: s.product || defaultProduct,
        quantity: s.quantity || 1,
        frequency: s.frequency as any,
        deliveryTime: s.deliveryTime,
        duration: s.duration,
        startDate: s.startDate,
        paymentStatus: s.paymentStatus as any,
        status: s.status as any,
        priceTotal: s.priceTotal,
        autoRenew: s.autoRenew,
        confirmationRequired: s.confirmationRequired,
        skippedDates: typeof s.skippedDates === 'string' ? JSON.parse(s.skippedDates) : (Array.isArray(s.skippedDates) ? s.skippedDates : [])
      }));
    }
  } catch (e) {
    console.warn('API fetch subscriptions error:', e);
  }
  return [];
}

export async function fetchDeliveriesFromDB(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/deliveries`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (e) {
    console.warn('API fetch deliveries error:', e);
  }
  return [];
}

export async function fetchAIAlertsFromDB(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/ai-alerts`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (e) {
    console.warn('API fetch AI alerts error:', e);
  }
  return [];
}

export async function fetchCategoriesFromDB(): Promise<AdminCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#d97706', '#f97316', '#84cc16'];
      return json.data.map((c: any, i: number) => ({
        id: c.id,
        name: c.name,
        emoji: '',
        productCount: c.productCount || 0,
        color: colors[i % colors.length]
      }));
    }
  } catch (e) {
    console.warn('API fetch categories error:', e);
  }
  return [];
}

export async function fetchBrandsFromDB(): Promise<AdminBrand[]> {
  try {
    const res = await fetch(`${API_BASE}/brands`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map((b: any) => ({
        id: b.id,
        name: b.name,
        emoji: '',
        origin: b.origin || 'India',
        productCount: b.productCount || 0,
        rating: b.rating || 4.5
      }));
    }
  } catch (e) {
    console.warn('API fetch brands error:', e);
  }
  return [];
}

export async function fetchCustomersFromDB(): Promise<AdminCustomer[]> {
  try {
    const res = await fetch(`${API_BASE}/customers`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map((u: any) => ({
        id: u.id,
        name: u.fullName || 'Customer',
        phone: u.phoneNumber,
        location: u.location || 'India',
        totalOrders: u.totalOrders || 0,
        totalSpend: u.totalSpend || 0,
        status: (u.status || 'Active') as any,
        joinDate: u.createdAt ? u.createdAt.substring(0, 10) : '2026-01-01',
        lastActive: 'Today'
      }));
    }
  } catch (e) {
    console.warn('API fetch customers error:', e);
  }
  return [];
}

export async function fetchOrdersFromDB(): Promise<AdminOrder[]> {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map((o: any) => ({
        id: o.id,
        customerId: o.userId || 'cu-1',
        customerName: o.customerName || 'Registered Customer',
        items: o.items && o.items.length > 0 ? o.items.map((i: any) => `${i.product?.name || 'Organic item'} ×${i.quantity}`).join(', ') : 'Organic items',
        total: o.totalAmount,
        status: o.deliveryStatus === 'DELIVERED' ? 'Delivered' : (o.deliveryStatus === 'PROCESSING' ? 'Processing' : (o.deliveryStatus === 'CANCELLED' ? 'Cancelled' : 'Pending')),
        date: o.createdAt ? o.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10),
        paymentMethod: o.paymentMethod || 'UPI'
      }));
    }
  } catch (e) {
    console.warn('API fetch orders error:', e);
  }
  return [];
}

export async function fetchUserLogsFromDB(): Promise<AdminUserLog[]> {
  try {
    const res = await fetch(`${API_BASE}/user-logs`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map((l: any, i: number) => ({
        id: l.id || 'log-' + (i + 1),
        user: l.user,
        role: l.role,
        action: l.action,
        module: l.module,
        timestamp: l.timestamp,
        type: l.type as any
      }));
    }
  } catch (e) {
    console.warn('API fetch user logs error:', e);
  }
  return [];
}
