import React from 'react';
import { AdminPortalScreens } from './AdminScreens';
import { VendorScreens } from './VendorScreens';

interface VendorAndAdminScreensProps {
  role: 'vendor' | 'admin';
  triggerRefresh: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onSwitchToCustomer?: () => void;
  showAddModal?: boolean;
  setShowAddModal?: (show: boolean) => void;
  userPhone?: string;
}

export const VendorAndAdminScreens: React.FC<VendorAndAdminScreensProps> = ({ 
  role, 
  triggerRefresh, 
  activeTab, 
  onSelectTab, 
  onSwitchToCustomer,
  showAddModal,
  setShowAddModal,
  userPhone,
}) => {
  if (role === 'vendor') {
    return (
      <VendorScreens 
        triggerRefresh={triggerRefresh} 
        activeTab={activeTab} 
        onSelectTab={onSelectTab} 
        onSwitchToCustomer={onSwitchToCustomer} 
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        userPhone={userPhone}
      />
    );
  }

  // --- SUPER ADMIN PORTAL VIEW ---
  return <AdminPortalScreens activeTab={activeTab} onSelectTab={onSelectTab} />;
};
