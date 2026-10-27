// Unified Services Barrel Export
export * from './api.client';
export * from './banner.service';
export * from './product.service';
export * from './order.service';
export * from './vendor.service';
export * from './auth.service';
export * from './location.service';

import { bannerService, uploadBannerImage } from './banner.service';
import { productService } from './product.service';
import { orderService } from './order.service';
import { vendorService } from './vendor.service';
import { authService } from './auth.service';
import { locationService } from './location.service';

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

export const Services = {
  banners: bannerService,
  products: productService,
  orders: orderService,
  vendors: vendorService,
  auth: authService,
  location: locationService,
};

export default Services;
