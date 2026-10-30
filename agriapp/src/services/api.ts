// Centralized API Bridge & Backward-Compatible Export
export * from './api.client';
export * from './banner.service';
export * from './product.service';
export * from './order.service';
export * from './vendor.service';
export * from './auth.service';
export * from './location.service';
export * from './cart.service';
export * from './subscription.service';

import {
  API_BASE,
  API_ENDPOINTS,
  getApiBase,
  getApiHost,
  setApiHost,
  probeBackend,
} from './api.client';
import { uploadBannerImage } from './banner.service';
import { vendorService } from './vendor.service';
import { orderService } from './order.service';
import { authService } from './auth.service';

export const uploadImageFile = uploadBannerImage;

export const api = {
  vendors: {
    updateDeliverySettings: vendorService.saveDeliverySettings,
    getNearby: vendorService.getNearbyVendors,
  },
  delivery: {
    calculateCharge: vendorService.calculateDeliveryCharge,
  },
  orders: {
    verifyDeliveryOtp: orderService.verifyDeliveryOtp,
  },
  auth: {
    verifyDevice: authService.verifyDevice,
    revokeDevice: authService.revokeDevice,
  },
};

export default {
  API_BASE,
  API_ENDPOINTS,
  getApiBase,
  getApiHost,
  setApiHost,
  probeBackend,
  api,
};
