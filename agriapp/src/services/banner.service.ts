// Banner API Service
import { API_ENDPOINTS, extractDataList, getApiBase } from './api.client';
import axios from 'axios';

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  tag?: string;
  category?: string;
  imageUrl?: string;
  linkUrl?: string;
  backgroundColor?: string;
  accentColor?: string;
  targetType?: string;
  targetId?: string;
  displayOrder?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export const uploadBannerImage = async (base64OrUri: string, fileName?: string): Promise<string> => {
  try {
    const url = `${getApiBase()}/upload`;
    console.log(`📡 [BannerService.uploadImage]: Uploading image to ${url}...`);
    const res = await axios.post(url, {
      image: base64OrUri,
      fileName: fileName || `banner-${Date.now()}.jpg`,
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    const data = res.data;
    if (data && data.success && data.url) {
      console.log(`✅ [BannerService.uploadImage]: Uploaded! URL: ${data.url}`);
      return data.url;
    }
  } catch (err: any) {
    console.warn('❌ [BannerService.uploadImage Error]:', err.response?.data || err.message);
  }
  return base64OrUri;
};

export const bannerService = {
  // Fetch active banners for Customer Home Screen
  getActiveBanners: async (): Promise<BannerItem[]> => {
    try {
      const res = await axios.get(API_ENDPOINTS.banners, { timeout: 10000 });
      return extractDataList<BannerItem>(res.data);
    } catch (err: any) {
      console.warn('⚠️ [BannerService.getActiveBanners] Failed:', err.message);
      return [];
    }
  },

  getAll: async (): Promise<BannerItem[]> => {
    return bannerService.getActiveBanners();
  },

  // Fetch all banners for Admin CMS
  getAllAdminBanners: async (): Promise<BannerItem[]> => {
    try {
      const res = await axios.get(API_ENDPOINTS.allBanners, { timeout: 10000 });
      return extractDataList<BannerItem>(res.data);
    } catch (err: any) {
      console.warn('⚠️ [BannerService.getAllAdminBanners] Failed:', err.message);
      return [];
    }
  },

  // Create new promotional banner
  createBanner: async (data: Partial<BannerItem>): Promise<{ success: boolean; data?: BannerItem; message?: string }> => {
    try {
      const res = await axios.post(API_ENDPOINTS.createBanner, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [BannerService.createBanner] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Update existing promotional banner
  updateBanner: async (id: string, data: Partial<BannerItem>): Promise<{ success: boolean; data?: BannerItem }> => {
    try {
      const res = await axios.put(API_ENDPOINTS.updateBanner(id), data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [BannerService.updateBanner] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Delete promotional banner
  deleteBanner: async (id: string): Promise<{ success: boolean }> => {
    try {
      const res = await axios.delete(API_ENDPOINTS.deleteBanner(id), { timeout: 15000 });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [BannerService.deleteBanner] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Upload image
  uploadImage: uploadBannerImage,
};

export default bannerService;
