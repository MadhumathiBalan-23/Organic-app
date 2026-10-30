// Cart API Service for Database Persistence
import { API_ENDPOINTS, extractDataList } from './api.client';
import axios from 'axios';
import { Product } from '../constants/mockData';

export interface CartItemModel {
  id?: string;
  qty: number;
  product: Product;
  unit?: string;
  price?: number;
  subtotal?: number;
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
}

export const cartService = {
  // Fetch user's persistent cart from PostgreSQL database
  getCart: async (userPhone: string): Promise<CartItemModel[]> => {
    try {
      const cleanPhone = String(userPhone || '').replace(/[^0-9]/g, '');
      if (!cleanPhone) return [];
      const res = await axios.get(API_ENDPOINTS.userCart(cleanPhone), { timeout: 10000 });
      return extractDataList<CartItemModel>(res.data);
    } catch (err: any) {
      console.warn('⚠️ [CartService.getCart] Error:', err.message);
      return [];
    }
  },

  // Add item to persistent database cart
  addToCart: async (userPhone: string, productId: string, qty = 1): Promise<CartItemModel[]> => {
    try {
      const cleanPhone = String(userPhone || '').replace(/[^0-9]/g, '');
      if (!cleanPhone || !productId) return [];
      const res = await axios.post(
        API_ENDPOINTS.addToCart,
        { phoneNumber: cleanPhone, productId, qty },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );
      return extractDataList<CartItemModel>(res.data);
    } catch (err: any) {
      console.warn('⚠️ [CartService.addToCart] Error:', err.message);
      return [];
    }
  },

  // Update item quantity in database
  updateCartQty: async (userPhone: string, productId: string, delta?: number, qty?: number): Promise<CartItemModel[]> => {
    try {
      const cleanPhone = String(userPhone || '').replace(/[^0-9]/g, '');
      if (!cleanPhone || !productId) return [];
      const res = await axios.put(
        API_ENDPOINTS.updateCartQty,
        { phoneNumber: cleanPhone, productId, delta, qty },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );
      return extractDataList<CartItemModel>(res.data);
    } catch (err: any) {
      console.warn('⚠️ [CartService.updateCartQty] Error:', err.message);
      return [];
    }
  },

  // Remove single item from database cart
  removeFromCart: async (userPhone: string, productId: string): Promise<CartItemModel[]> => {
    try {
      const cleanPhone = String(userPhone || '').replace(/[^0-9]/g, '');
      if (!cleanPhone || !productId) return [];
      const res = await axios.delete(API_ENDPOINTS.removeFromCart(productId, cleanPhone), { timeout: 10000 });
      return extractDataList<CartItemModel>(res.data);
    } catch (err: any) {
      console.warn('⚠️ [CartService.removeFromCart] Error:', err.message);
      return [];
    }
  },

  // Clear customer's entire cart in database (e.g. after order placement)
  clearCart: async (userPhone: string): Promise<boolean> => {
    try {
      const cleanPhone = String(userPhone || '').replace(/[^0-9]/g, '');
      if (!cleanPhone) return true;
      await axios.delete(API_ENDPOINTS.clearCart(cleanPhone), { timeout: 10000 });
      return true;
    } catch (err: any) {
      console.warn('⚠️ [CartService.clearCart] Error:', err.message);
      return false;
    }
  },

  // Sync client cart items into database cart on login
  syncCart: async (userPhone: string, items: { product: { id: string }; qty: number }[]): Promise<CartItemModel[]> => {
    try {
      const cleanPhone = String(userPhone || '').replace(/[^0-9]/g, '');
      if (!cleanPhone) return [];
      const formattedItems = (items || [])
        .filter(i => i && i.product && i.product.id)
        .map(i => ({ productId: i.product.id, qty: i.qty }));

      const res = await axios.post(
        API_ENDPOINTS.syncCart,
        { phoneNumber: cleanPhone, items: formattedItems },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );
      return extractDataList<CartItemModel>(res.data);
    } catch (err: any) {
      console.warn('⚠️ [CartService.syncCart] Error:', err.message);
      return [];
    }
  },
};
