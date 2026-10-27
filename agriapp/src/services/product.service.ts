// Product & Catalog API Service
import { API_ENDPOINTS, extractDataList } from './api.client';
import axios from 'axios';
import { Product } from '../constants/mockData';

export const productService = {
  // Fetch all active products
  getProducts: async (): Promise<Product[]> => {
    try {
      const res = await axios.get(API_ENDPOINTS.products, { timeout: 12000 });
      return extractDataList<Product>(res.data);
    } catch (err: any) {
      console.warn('⚠️ [ProductService.getProducts] Error:', err.message);
      return [];
    }
  },

  getAll: async (): Promise<Product[]> => {
    return productService.getProducts();
  },

  // Create new product (Farmer/Admin)
  createProduct: async (data: Partial<Product>): Promise<{ success: boolean; data?: Product; message?: string }> => {
    try {
      const res = await axios.post(API_ENDPOINTS.products, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [ProductService.createProduct] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Update existing product
  updateProduct: async (id: string, data: Partial<Product>): Promise<{ success: boolean; data?: Product }> => {
    try {
      const res = await axios.put(`${API_ENDPOINTS.products}/${id}`, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [ProductService.updateProduct] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Delete product
  deleteProduct: async (id: string): Promise<{ success: boolean }> => {
    try {
      const res = await axios.delete(`${API_ENDPOINTS.products}/${id}`, { timeout: 15000 });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [ProductService.deleteProduct] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Fetch product categories
  getCategories: async (): Promise<any[]> => {
    try {
      const res = await axios.get(API_ENDPOINTS.categories, { timeout: 10000 });
      return extractDataList(res.data);
    } catch (err: any) {
      console.warn('⚠️ [ProductService.getCategories] Error:', err.message);
      return [];
    }
  },

  // Fetch brands
  getBrands: async (): Promise<any[]> => {
    try {
      const res = await axios.get(API_ENDPOINTS.brands, { timeout: 10000 });
      return extractDataList(res.data);
    } catch (err: any) {
      console.warn('⚠️ [ProductService.getBrands] Error:', err.message);
      return [];
    }
  },
};

export default productService;
