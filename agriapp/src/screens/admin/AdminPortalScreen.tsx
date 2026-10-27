import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminTabKey, AdminPortalScreensProps } from './types';
import { AdminDashboardScreen } from './AdminDashboardScreen';
import { AdminBannersScreen } from './AdminBannersScreen';
import { AdminVendorsScreen } from './AdminVendorsScreen';
import { AdminProductsScreen } from './AdminProductsScreen';
import { AdminCategoriesScreen } from './AdminCategoriesScreen';
import { AdminBrandsScreen } from './AdminBrandsScreen';
import { AdminCustomersScreen } from './AdminCustomersScreen';
import { AdminOrdersScreen } from './AdminOrdersScreen';
import { AdminLogsScreen } from './AdminLogsScreen';

export const AdminPortalScreen: React.FC<AdminPortalScreensProps> = ({
  activeTab: propActiveTab,
  onSelectTab,
}) => {
  const [internalTab, setInternalTab] = useState<AdminTabKey>('dashboard');
  const activeTab = (propActiveTab as AdminTabKey) || internalTab;

  const handleTabChange = (tab: AdminTabKey) => {
    setInternalTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardScreen onNavigateTab={handleTabChange} />;
      case 'banners':
        return <AdminBannersScreen />;
      case 'vendorRequests':
        return <AdminVendorsScreen />;
      case 'products':
        return <AdminProductsScreen />;
      case 'categories':
        return <AdminCategoriesScreen />;
      case 'brands':
        return <AdminBrandsScreen />;
      case 'customers':
        return <AdminCustomersScreen />;
      case 'orders':
        return <AdminOrdersScreen />;
      case 'logs':
        return <AdminLogsScreen />;
      default:
        return <AdminDashboardScreen onNavigateTab={handleTabChange} />;
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F0F4F1]"
      edges={['left', 'right', 'bottom']}
    >
      <View className="flex-1 bg-[#F0F4F1] p-3">{renderContent()}</View>
    </SafeAreaView>
  );
};

// Aliased export for compatibility with legacy import naming
export const AdminPortalScreens = AdminPortalScreen;
export default AdminPortalScreen;
