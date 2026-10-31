import React from 'react';
import { View } from 'react-native';
import { BottomNavBar } from './BottomNavBar';
import { VendorBottomNavBar } from './VendorBottomNavBar';

export interface AppFooterProps {
  role: 'customer' | 'vendor' | 'admin' | null;
  currentScreen?: string;
  onNavigate: (screen: string) => void;
  onSwitchToVendor?: () => void;
  isSwitchingToVendor?: boolean;
  isApprovedVendor?: boolean;
  themeColor?: string;
  // Vendor-specific props
  vendorTab?: string;
  onSelectVendorTab?: (tab: string) => void;
  onOpenAddProduct?: () => void;
  onSwitchToCustomer?: () => void;
  pendingOrdersCount?: number;
  cropsCount?: number;
  // Admin-specific props
  adminTab?: string;
  onSelectAdminTab?: (tab: string) => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({
  role = 'customer',
  currentScreen = 'HOME',
  onNavigate,
  onSwitchToVendor,
  isSwitchingToVendor = false,
  isApprovedVendor = false,
  themeColor,
  vendorTab = 'dashboard',
  onSelectVendorTab,
  onOpenAddProduct,
  onSwitchToCustomer,
  pendingOrdersCount = 0,
  cropsCount = 0,
}) => {
  // If role is admin, do not render any bottom bar (admin navigation is exclusively via Sidebar Drawer)
  if (role === 'admin') {
    return null;
  }

  // If role is vendor, render VendorBottomNavBar
  if (role === 'vendor' && onSelectVendorTab && onOpenAddProduct && onSwitchToCustomer) {
    return (
      <VendorBottomNavBar
        currentTab={vendorTab as any}
        onSelectTab={onSelectVendorTab}
        onOpenAddProduct={onOpenAddProduct}
        onSwitchToCustomer={onSwitchToCustomer}
        pendingOrdersCount={pendingOrdersCount}
        cropsCount={cropsCount}
      />
    );
  }

  // If role is customer, render BottomNavBar on main screens
  const showCustomerFooter =
    role === 'customer' &&
    ['HOME', 'ALL_PRODUCTS', 'MY_SUBSCRIPTIONS', 'PROFILE', 'ORDER_HISTORY', 'CART'].includes(currentScreen);

  if (!showCustomerFooter) {
    return null;
  }

  return (
    <View className="w-full bg-white z-[90]">
      <BottomNavBar
        currentScreen={currentScreen}
        onNavigate={onNavigate}
        onSwitchToVendor={onSwitchToVendor}
        isSwitchingToVendor={isSwitchingToVendor}
        isApprovedVendor={isApprovedVendor}
        themeColor={themeColor}
      />
    </View>
  );
};

export default AppFooter;
