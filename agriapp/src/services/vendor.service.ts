// Vendor & Producer API Service
import { API_ENDPOINTS, extractDataList } from './api.client';
import axios from 'axios';

export interface VendorRequest {
  id?: string;
  phoneNumber?: string;
  applicantPhone?: string;
  userName?: string;
  farmName?: string;
  farmLocation?: string;
  cropCategories?: string;
  experience?: string;
  experienceYears?: string;
  certNo?: string;
  certificateNo?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
  [key: string]: any;
}

export const vendorService = {
  // Fetch all vendor accreditation requests (Admin)
  getVendorRequests: async (): Promise<VendorRequest[]> => {
    try {
      const res = await axios.get(API_ENDPOINTS.vendorRequests, { timeout: 10000 });
      return extractDataList<VendorRequest>(res.data);
    } catch (err: any) {
      console.warn('⚠️ [VendorService.getVendorRequests] Error:', err.message);
      return [];
    }
  },

  // Check vendor approval status for a phone number
  getVendorStatus: async (phone: string): Promise<{ success: boolean; isApproved: boolean; request?: any }> => {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const res = await axios.get(API_ENDPOINTS.vendorStatus(cleanPhone), { timeout: 10000 });
      return res.data;
    } catch (err: any) {
      console.warn('⚠️ [VendorService.getVendorStatus] Error:', err.message);
      return { success: false, isApproved: false };
    }
  },

  // Submit vendor/farmer registration request
  applyVendor: async (data: Partial<VendorRequest>): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await axios.post(API_ENDPOINTS.vendorRequests, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [VendorService.applyVendor] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  submitRequest: async (data: Partial<VendorRequest>): Promise<{ success: boolean; message?: string }> => {
    return vendorService.applyVendor(data);
  },

  // Approve vendor request (Admin)
  approveVendor: async (id: string): Promise<{ success: boolean }> => {
    try {
      const res = await axios.post(API_ENDPOINTS.approveVendor(id), {}, { timeout: 15000 });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [VendorService.approveVendor] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Reject vendor request (Admin)
  rejectVendor: async (id: string, reason?: string): Promise<{ success: boolean }> => {
    try {
      const res = await axios.post(API_ENDPOINTS.rejectVendor(id), { reason }, { timeout: 15000 });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [VendorService.rejectVendor] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Fetch vendor delivery radius settings
  getDeliverySettings: async (phone: string): Promise<any> => {
    try {
      const res = await axios.get(API_ENDPOINTS.vendorDeliverySettings(phone), { timeout: 10000 });
      return res.data;
    } catch (err: any) {
      console.warn('⚠️ [VendorService.getDeliverySettings] Error:', err.message);
      return null;
    }
  },

  // Save vendor delivery settings
  saveDeliverySettings: async (settings: any): Promise<{ success: boolean }> => {
    try {
      const res = await axios.post(API_ENDPOINTS.saveVendorDeliverySettings, settings, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return res.data;
    } catch (err: any) {
      console.warn('❌ [VendorService.saveDeliverySettings] Error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Calculate distance-based delivery fee
  calculateDeliveryCharge: async (distanceKm: number): Promise<{ success: boolean; charge: number }> => {
    try {
      const res = await axios.post(API_ENDPOINTS.calculateDeliveryCharge, { distanceKm }, { timeout: 10000 });
      return res.data;
    } catch {
      return { success: true, charge: 20 };
    }
  },

  // Get nearby vendors for customer location
  getNearbyVendors: async (lat: number, lng: number): Promise<any[]> => {
    try {
      const res = await axios.get(API_ENDPOINTS.nearbyVendors(lat, lng), { timeout: 10000 });
      return extractDataList(res.data);
    } catch (err: any) {
      console.warn('⚠️ [VendorService.getNearbyVendors] Error:', err.message);
      return [];
    }
  },
};

export default vendorService;
