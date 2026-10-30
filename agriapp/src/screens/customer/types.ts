import React from 'react';
import { Product } from '../../constants/mockData';

export type CustomerScreenKey =
  | 'HOME'
  | 'ALL_PRODUCTS'
  | 'CATEGORY_PRODUCTS'
  | 'CATEGORY_VENDOR_DISCOVERY'
  | 'VENDOR_STORE'
  | 'PRODUCT_DETAILS'
  | 'CART'
  | 'CHECKOUT'
  | 'SUBSCRIPTION_CREATE'
  | 'SUBSCRIPTION_SUMMARY'
  | 'PAYMENT'
  | 'MY_SUBSCRIPTIONS'
  | 'ORDER_HISTORY'
  | 'PROFILE'
  | 'WHATSAPP_AI'
  | 'AI_VOICE_CALL'
  | 'DAILY_CONFIRMATION';

export interface CartItem {
  product: Product;
  qty: number;
}

export interface LocationData {
  address?: string;
  latitude?: number;
  longitude?: number;
  area?: string;
  pincode?: string;
  [key: string]: any;
}

export interface CustomerScreensProps {
  customerScreen: string;
  setCustomerScreen: (screen: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedProduct: Product;
  setSelectedProduct: (p: Product) => void;
  activeSubscriptionData: any;
  setActiveSubscriptionData: (d: any) => void;
  subscriptions: any[];
  setSubscriptions: React.Dispatch<React.SetStateAction<any[]>>;
  handleLogout: () => void;
  userPhone?: string;
  isApprovedVendor?: boolean;
  vendorApplicationStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  onRefreshVendorStatus?: () => void;
  onSwitchToVendor?: () => void;
  cart?: CartItem[];
  setCart?: React.Dispatch<React.SetStateAction<CartItem[]>>;
  selectedLocation?: LocationData | null;
  onChangeLocation?: () => void;
  onBannerThemeChange?: (color: string) => void;
  scrollY?: any;
}
