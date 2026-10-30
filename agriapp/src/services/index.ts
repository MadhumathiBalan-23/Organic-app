// Unified Services Barrel Export
export * from './api.client';
export * from './banner.service';
export * from './product.service';
export * from './order.service';
export * from './vendor.service';
export * from './auth.service';
export * from './location.service';
export * from './cart.service';
export * from './subscription.service';
export * from './customer.service';

import { bannerService, uploadBannerImage } from './banner.service';
import { productService } from './product.service';
import { orderService } from './order.service';
import { vendorService } from './vendor.service';
import { authService } from './auth.service';
import { locationService } from './location.service';
import { cartService } from './cart.service';
import { subscriptionService } from './subscription.service';
import { customerService } from './customer.service';

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
  cart: {
    getCart: cartService.getCart,
    addToCart: cartService.addToCart,
    updateCartQty: cartService.updateCartQty,
    removeFromCart: cartService.removeFromCart,
    clearCart: cartService.clearCart,
    syncCart: cartService.syncCart,
  },
};

export const Services = {
  banners: bannerService,
  products: productService,
  orders: orderService,
  vendors: vendorService,
  auth: authService,
  location: locationService,
  cart: cartService,
};

export default Services;
