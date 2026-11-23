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
  // Fetch user's persistent cart from database
  getCart: async (userPhone: string): Promise<CartItemModel[]> => {
    try {
      const cleanPhone = String(userPhone || '').replace(/[^0-9]/g, '');
      if (!cleanPhone || cleanPhone.length < 10) return [];
      const url = API_ENDPOINTS.userCart(cleanPhone);

      // 1. Try native fetch with timeout for optimal mobile Android/iOS compatibility
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const json = await res.json();
          return extractDataList<CartItemModel>(json);
        }
      } catch {
        // Fall through to Axios attempt
      }

      // 2. Fallback to Axios if fetch did not resolve
      const res = await axios.get(url, {
        headers: { 'Accept': 'application/json' },
        timeout: 10000,
      });
      return extractDataList<CartItemModel>(res.data);
    } catch {
      return [];
    }
  },

  // Add item to persistent database cart
  addToCart: async (userPhone: string, productId: string, qty = 1): Promise<CartItemModel[]> => {
    try {
      const cleanPhone = String(userPhone || '').replace(/[^0-9]/g, '');
      if (!cleanPhone || cleanPhone.length < 10 || !productId) return [];
      const url = API_ENDPOINTS.addToCart;
      const payload = JSON.stringify({ phoneNumber: cleanPhone, productId, qty });

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: payload,
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const json = await res.json();
          return extractDataList<CartItemModel>(json);
        }
      } catch { }

      const res = await axios.post(
        url,
        { phoneNumber: cleanPhone, productId, qty },
        { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, timeout: 10000 }
      );
      return extractDataList<CartItemModel>(res.data);
    } catch {
      return [];
    }
  },

  // Update item quantity in database
  updateCartQty: async (userPhone: string, productId: string, delta?: number, qty?: number): Promise<CartItemModel[]> => {
    try {
      const cleanPhone = String(userPhone || '').replace(/[^0-9]/g, '');
      if (!cleanPhone || cleanPhone.length < 10 || !productId) return [];
      const url = API_ENDPOINTS.updateCartQty;
      const payload = JSON.stringify({ phoneNumber: cleanPhone, productId, delta, qty });

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: payload,
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const json = await res.json();
          return extractDataList<CartItemModel>(json);
        }
      } catch { }

      const res = await axios.put(
        url,
        { phoneNumber: cleanPhone, productId, delta, qty },
        { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, timeout: 10000 }
      );
      return extractDataList<CartItemModel>(res.data);
    } catch {
      return [];
    }
  },

  // Remove single item from database cart
  removeFromCart: async (userPhone: string, productId: string): Promise<CartItemModel[]> => {
    try {
      const cleanPhone = String(userPhone || '').replace(/[^0-9]/g, '');
      if (!cleanPhone || cleanPhone.length < 10 || !productId) return [];
      const url = API_ENDPOINTS.removeFromCart(productId, cleanPhone);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const json = await res.json();
          return extractDataList<CartItemModel>(json);
        }
      } catch { }

      const res = await axios.delete(url, { timeout: 10000 });
      return extractDataList<CartItemModel>(res.data);
    } catch {
      return [];
    }
  },

  // Clear customer's entire cart in database (e.g. after order placement)
  clearCart: async (userPhone: string): Promise<boolean> => {
    try {
      const cleanPhone = String(userPhone || '').replace(/[^0-9]/g, '');
      if (!cleanPhone || cleanPhone.length < 10) return true;
      const url = API_ENDPOINTS.clearCart(cleanPhone);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) return true;
      } catch { }

      await axios.delete(url, { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  },

  // Sync client cart items into database cart on login
  syncCart: async (userPhone: string, items: { product: { id: string }; qty: number }[]): Promise<CartItemModel[]> => {
    try {
      const cleanPhone = String(userPhone || '').replace(/[^0-9]/g, '');
      if (!cleanPhone || cleanPhone.length < 10) return [];
      const formattedItems = (items || [])
        .filter(i => i && i.product && i.product.id)
        .map(i => ({ productId: i.product.id, qty: i.qty }));
      const url = API_ENDPOINTS.syncCart;
      const payload = JSON.stringify({ phoneNumber: cleanPhone, items: formattedItems });

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: payload,
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const json = await res.json();
          return extractDataList<CartItemModel>(json);
        }
      } catch { }

      const res = await axios.post(
        url,
        { phoneNumber: cleanPhone, items: formattedItems },
        { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, timeout: 10000 }
      );
      return extractDataList<CartItemModel>(res.data);
    } catch {
      return [];
    }
  },
};
