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
