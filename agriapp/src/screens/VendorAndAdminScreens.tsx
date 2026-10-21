import React from 'react';
import { AdminPortalScreens } from './AdminScreens';
import { VendorScreens } from './VendorScreens';

interface VendorAndAdminScreensProps {
  role: 'vendor' | 'admin';
  triggerRefresh: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const VendorAndAdminScreens: React.FC<VendorAndAdminScreensProps> = ({ role, triggerRefresh, activeTab, onSelectTab }) => {
  if (role === 'vendor') {
    return <VendorScreens triggerRefresh={triggerRefresh} activeTab={activeTab} onSelectTab={onSelectTab} />;
  }

  // --- SUPER ADMIN PORTAL VIEW ---
  return <AdminPortalScreens activeTab={activeTab} onSelectTab={onSelectTab} />;
};
