import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, Sparkles, Package, ShoppingCart, UserCheck, Store } from 'lucide-react-native';
import { BottomNavBar } from './BottomNavBar';
import { VendorBottomNavBar } from './VendorBottomNavBar';

export interface AppFooterProps {
  role: 'customer' | 'vendor' | 'admin' | null;
  currentScreen?: string;
  onNavigate: (screen: string) => void;
  onSwitchToVendor?: () => void;
  isSwitchingToVendor?: boolean;
  isApprovedVendor?: boolean;
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
  vendorTab = 'dashboard',
  onSelectVendorTab,
  onOpenAddProduct,
  onSwitchToCustomer,
  pendingOrdersCount = 0,
  cropsCount = 0,
  adminTab = 'dashboard',
  onSelectAdminTab,
}) => {
  const insets = useSafeAreaInsets();

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
    <View style={styles.footerContainer}>
      <BottomNavBar
        currentScreen={currentScreen}
        onNavigate={onNavigate}
        onSwitchToVendor={onSwitchToVendor}
        isSwitchingToVendor={isSwitchingToVendor}
        isApprovedVendor={isApprovedVendor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    zIndex: 90,
  },
  adminFooterContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    zIndex: 90,
  },
  adminNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 2,
  },
  adminIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminIconWrapperActive: {
    backgroundColor: '#DCFCE7',
  },
  adminNavText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  adminNavTextActive: {
    color: '#07843D',
    fontWeight: '800',
  },
});

export default AppFooter;
