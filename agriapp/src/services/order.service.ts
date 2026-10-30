// Order & Delivery API Service
import { API_ENDPOINTS, extractDataList } from './api.client';
import axios from 'axios';

export interface OrderItem {
  id: string;
  vendorId?: string;
  vendorName?: string;
  vendor?: {
    id: string;
    businessName: string;
    ownerName?: string;
    phoneNumber?: string;
    address?: string;
    rating?: number;
  };
  customerName?: string;
  customerPhone?: string;
  phoneNumber?: string;
  products?: string;
  items?: any[];
  amount?: number;
  totalAmount?: number;
  deliveryStatus?: string;
  status?: string;
  deliveryTime?: string;
  address?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  deliveryOtp?: string;
  rejectionReason?: string;
  prepTimeMinutes?: string;
  createdAt?: string;
}

export const orderService = {
  // Fetch orders (strictly filtered by user phone if provided)
  getOrders: async (userPhone?: string): Promise<OrderItem[]> => {
    try {
      const cleanPhone = userPhone ? String(userPhone).replace(/[^0-9]/g, '') : '';
      const endpoint = cleanPhone ? API_ENDPOINTS.userOrders(cleanPhone) : API_ENDPOINTS.orders;
      const res = await axios.get(endpoint, { timeout: 12000 });
      return extractDataList<OrderItem>(res.data);
    } catch (err: any) {
      console.warn('⚠️ [OrderService.getOrders] Error:', err.message);
      return [];
    }
  },

  // Fetch orders for a specific vendor
  getVendorOrders: async (vendorId: string): Promise<OrderItem[]> => {
    try {
      const res = await axios.get(API_ENDPOINTS.vendorOrders(vendorId), { timeout: 12000 });
      return extractDataList<OrderItem>(res.data);
    } catch (err: any) {
      console.warn('⚠️ [OrderService.getVendorOrders] Error:', err.message);
      return [];
    }
  },

  getAll: async (userPhone?: string): Promise<OrderItem[]> => {
    return orderService.getOrders(userPhone);
  },

  // Create new order
  createOrder: async (data: Partial<OrderItem>): Promise<{ success: boolean; data?: OrderItem; message?: string }> => {
    try {
      const res = await axios.post(API_ENDPOINTS.orders, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [OrderService.createOrder] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Update order status (Accepted, Shipped, Delivered, Rejected)
  updateOrderStatus: async (id: string, status: string, prepTime?: string): Promise<{ success: boolean }> => {
    try {
      const res = await axios.put(`${API_ENDPOINTS.orders}/${id}/status`, { status, prepTime }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [OrderService.updateOrderStatus] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Verify delivery with 4-digit OTP
  verifyDeliveryOtp: async (orderId: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await axios.post(API_ENDPOINTS.verifyDeliveryOtp(orderId), { otp }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [OrderService.verifyDeliveryOtp] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Fetch deliveries dispatch list
  getDeliveries: async (): Promise<any[]> => {
    try {
      const res = await axios.get(API_ENDPOINTS.deliveries, { timeout: 10000 });
      return extractDataList(res.data);
    } catch (err: any) {
      console.warn('⚠️ [OrderService.getDeliveries] Error:', err.message);
      return [];
    }
  },

  // Fetch subscriptions (strictly filtered by user phone if provided)
  getSubscriptions: async (userPhone?: string): Promise<any[]> => {
    try {
      const cleanPhone = userPhone ? String(userPhone).replace(/[^0-9]/g, '') : '';
      const endpoint = cleanPhone ? API_ENDPOINTS.userSubscriptions(cleanPhone) : API_ENDPOINTS.subscriptions;
      const res = await axios.get(endpoint, { timeout: 10000 });
      return extractDataList(res.data);
    } catch (err: any) {
      console.warn('⚠️ [OrderService.getSubscriptions] Error:', err.message);
      return [];
    }
  },

  // Create new recurring subscription
  createSubscription: async (data: any): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const res = await axios.post(API_ENDPOINTS.subscriptions, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [OrderService.createSubscription] Error:', err.response?.data || err.message);
      throw err;
    }
  },
};

export default orderService;
