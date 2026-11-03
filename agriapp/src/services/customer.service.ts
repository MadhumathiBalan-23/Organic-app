import axios from 'axios';
import { API_ENDPOINTS, extractDataList } from './api.client';
import { Product } from '../constants/mockData';

export interface ProductQueryParams {
  categoryId?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  discount?: boolean | string;
  availability?: 'in_stock' | 'out_of_stock' | 'all';
  subscriptionAvailable?: 'true' | 'subscription' | 'one_time' | 'both';
  deliverySlot?: 'morning' | 'evening' | 'scheduled' | 'today';
  sortBy?: 'recommended' | 'priceLowToHigh' | 'priceHighToLow' | 'highestRated' | 'newest' | 'highestDiscount';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CustomerCategoryItem {
  id: string;
  categoryId: string;
  name: string;
  emoji: string;
  description: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
}

export interface CategoryVendorItem {
  id: string;
  vendorId: string;
  businessName: string;
  ownerName: string;
  phoneNumber: string;
  address: string;
  rating: number;
  deliveryRadiusKm: number;
  deliveryEstimate: string;
  morningDelivery: string;
  minimumOrder: number;
  isServiceable: boolean;
  productCount: number;
  sampleProducts: {
    id: string;
    name: string;
    price: number;
    unit: string;
    imageUrl: string;
  }[];
}

export interface PaginatedProductsResponse {
  success: boolean;
  data: Product[];
  pagination: PaginationMetadata;
  filters?: {
    activeCategory?: string;
    activeVendor?: string;
    availableVendors?: { id: string; name: string; rating: number }[];
  };
}

export interface VendorCatalogResponse {
  success: boolean;
  vendor: {
    id: string;
    businessName: string;
    ownerName: string;
    phoneNumber: string;
    address: string;
    rating: number;
    deliveryRadiusKm: number;
    totalProducts: number;
    categories: string[];
  };
  data: Product[];
  pagination: PaginationMetadata;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  data: {
    products: Product[];
    categories: { id: string; name: string; emoji: string }[];
    vendors: { id: string; name: string; rating: number }[];
  };
}

export const customerService = {
  /**
   * Fetch all active categories with product counts
   */
  async getCategories(): Promise<CustomerCategoryItem[]> {
    try {
      const res = await axios.get(API_ENDPOINTS.customerCategories);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return extractDataList<CustomerCategoryItem>(res.data);
    } catch (err: any) {
      console.warn('⚠️ [customerService.getCategories] Error:', err.message);
      return [];
    }
  },

  /**
   * Fetch category details by ID or Name
   */
  async getCategoryDetails(categoryId: string): Promise<CustomerCategoryItem | null> {
    try {
      const res = await axios.get(API_ENDPOINTS.customerCategoryDetails(categoryId));
      return res.data?.data || null;
    } catch (err: any) {
      console.warn(`⚠️ [customerService.getCategoryDetails] Error for ${categoryId}:`, err.message);
      return null;
    }
  },

  /**
   * Fetch vendors delivering products in a selected category
   */
  async getCategoryVendors(categoryId: string): Promise<CategoryVendorItem[]> {
    try {
      const res = await axios.get(API_ENDPOINTS.customerCategoryVendors(categoryId));
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return extractDataList<CategoryVendorItem>(res.data);
    } catch (err: any) {
      console.warn(`⚠️ [customerService.getCategoryVendors] Error for ${categoryId}:`, err.message);
      return [];
    }
  },

  /**
   * Fetch paginated and filtered product listing
   */
  async getProducts(params: ProductQueryParams = {}): Promise<PaginatedProductsResponse> {
    try {
      const queryParams: Record<string, any> = {};
      if (params.categoryId && params.categoryId !== 'All') queryParams.categoryId = params.categoryId;
      if (params.vendorId && params.vendorId !== 'All') queryParams.vendorId = params.vendorId;
      if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice;
      if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;
      if (params.rating !== undefined) queryParams.rating = params.rating;
      if (params.discount) queryParams.discount = params.discount;
      if (params.availability) queryParams.availability = params.availability;
      if (params.subscriptionAvailable) queryParams.subscriptionAvailable = params.subscriptionAvailable;
      if (params.deliverySlot) queryParams.deliverySlot = params.deliverySlot;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.search) queryParams.search = params.search;
      if (params.page) queryParams.page = params.page;
      if (params.pageSize) queryParams.pageSize = params.pageSize;

      const res = await axios.get(API_ENDPOINTS.customerProducts, { params: queryParams });
      if (res.data && res.data.success) {
        return {
          success: true,
          data: res.data.data || [],
          pagination: res.data.pagination || {
            currentPage: 1,
            pageSize: params.pageSize || 10,
            totalRecords: (res.data.data || []).length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
          filters: res.data.filters,
        };
      }
      return {
        success: false,
        data: [],
        pagination: { currentPage: 1, pageSize: 10, totalRecords: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      };
    } catch (err: any) {
      console.warn('⚠️ [customerService.getProducts] Error:', err.message);
      return {
        success: false,
        data: [],
        pagination: { currentPage: 1, pageSize: 10, totalRecords: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      };
    }
  },

  /**
   * Fetch products for a specific vendor with pagination and filters
   */
  async getVendorProducts(vendorId: string, params: ProductQueryParams = {}): Promise<VendorCatalogResponse | null> {
    try {
      const queryParams: Record<string, any> = {};
      if (params.categoryId && params.categoryId !== 'All') queryParams.categoryId = params.categoryId;
      if (params.search) queryParams.search = params.search;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.page) queryParams.page = params.page;
      if (params.pageSize) queryParams.pageSize = params.pageSize;

      const res = await axios.get(API_ENDPOINTS.customerVendorProducts(vendorId), { params: queryParams });
      if (res.data && res.data.success) {
        return res.data;
      }
      return null;
    } catch (err: any) {
      console.warn(`⚠️ [customerService.getVendorProducts] Error for ${vendorId}:`, err.message);
      return null;
    }
  },

  /**
   * Fetch single product details with full vendor and subscription settings
   */
  async getProductDetails(vendorProductId: string): Promise<Product | null> {
    try {
      const res = await axios.get(API_ENDPOINTS.customerProductDetails(vendorProductId));
      return res.data?.data || null;
    } catch (err: any) {
      console.warn(`⚠️ [customerService.getProductDetails] Error for ${vendorProductId}:`, err.message);
      return null;
    }
  },

  /**
   * Search suggestions across products, categories, and vendors
   */
  async search(query: string, vendorId?: string): Promise<SearchResponse['data']> {
    try {
      const params: Record<string, string> = { q: query };
      if (vendorId) params.vendorId = vendorId;
      const res = await axios.get(API_ENDPOINTS.customerSearch, { params });
      return res.data?.data || { products: [], categories: [], vendors: [] };
    } catch (err: any) {
      console.warn('⚠️ [customerService.search] Error:', err.message);
      return { products: [], categories: [], vendors: [] };
    }
  },

  /**
   * Consolidated Single Landing Page Feed (Requirement 3)
   * Fetches active banners, categories, and products in a single optimized request
   */
  async getLandingFeed(): Promise<{ banners: any[]; categories: any[]; products: Product[] }> {
    try {
      const res = await axios.get(API_ENDPOINTS.customerLanding, { timeout: 10000 });
      if (res.data && res.data.success && res.data.data) {
        return {
          banners: res.data.data.banners || [],
          categories: res.data.data.categories || [],
          products: res.data.data.products || [],
        };
      }
    } catch (err: any) {
      console.log('ℹ️ [customerService.getLandingFeed] Single API not available, fetching fallback:', err.message);
    }

    // Resilient Fallback: parallel fetch
    try {
      const [bannersRes, catRes, prodRes] = await Promise.allSettled([
        axios.get(API_ENDPOINTS.banners, { timeout: 8000 }),
        axios.get(API_ENDPOINTS.customerCategories, { timeout: 8000 }),
        axios.get(API_ENDPOINTS.customerProducts, { timeout: 8000 }),
      ]);

      const banners = bannersRes.status === 'fulfilled' ? extractDataList(bannersRes.value.data) : [];
      const categories = catRes.status === 'fulfilled' ? extractDataList(catRes.value.data) : [];
      const products = prodRes.status === 'fulfilled' ? extractDataList(prodRes.value.data) : [];

      return { banners, categories, products };
    } catch {
      return { banners: [], categories: [], products: [] };
    }
  },

  /**
   * Dynamic Product Reviews (Requirement 5)
   */
  async getProductReviews(productId: string): Promise<any[]> {
    try {
      const res = await axios.get(API_ENDPOINTS.productReviews(productId), { timeout: 8000 });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch (err: any) {
      return [];
    }
  },

  async addProductReview(
    productId: string,
    review: { userName: string; rating: number; comment: string; customerPhone?: string }
  ): Promise<{ success: boolean; data?: any; message?: string; isUpdate?: boolean; field?: string }> {
    try {
      const res = await axios.post(API_ENDPOINTS.productReviews(productId), review, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      return res.data;
    } catch (err: any) {
      return {
        success: false,
        field: err.response?.data?.field,
        message: err.response?.data?.message || err.message,
      };
    }
  },
};

export default customerService;
