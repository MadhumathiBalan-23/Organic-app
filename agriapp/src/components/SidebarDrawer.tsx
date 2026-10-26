import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X, LayoutDashboard, ShoppingBag, Tags, Sprout, Users,
  Package, FileText, Store, Calendar, Wallet, Home,
  RefreshCw, User, MessageSquare, PhoneCall, LogOut, ChevronRight, MonitorCog,
  Sparkles
} from 'lucide-react-native';
import { UserRole } from './RoleHeader';

interface MenuItem {
  key: string;
  label: string;
  badge?: string;
  icon: React.ReactNode;
}

interface SidebarDrawerProps {
  visible: boolean;
  onClose: () => void;
  role: UserRole;
  activeScreen: string;
  onSelectScreen: (screenKey: string) => void;
  onLogout: () => void;
  isApprovedVendor?: boolean;
  isAdminUser?: boolean;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  visible,
  onClose,
  role,
  activeScreen,
  onSelectScreen,
  onLogout,
  isApprovedVendor = false,
  isAdminUser = false,
}) => {
  // Ultra-clean, simplified menu lists (No clutter headers, standard mobile app names)
  const getAdminMenus = (): MenuItem[] => [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { key: 'banners', label: 'Banners & Gradient CMS', badge: 'NEW', icon: <Sparkles size={16} /> },
    { key: 'products', label: 'Products Catalog', badge: '12', icon: <ShoppingBag size={16} /> },
    { key: 'categories', label: 'Categories', icon: <Tags size={16} /> },
    { key: 'vendorRequests', label: 'Vendor Approvals', badge: 'New', icon: <Users size={16} /> },
    { key: 'brands', label: 'Brands', icon: <Sprout size={16} /> },
    { key: 'customers', label: 'Customers', badge: 'VIP', icon: <Users size={16} /> },
    { key: 'orders', label: 'Orders', badge: 'Live', icon: <Package size={16} /> },
    { key: 'logs', label: 'System Logs', icon: <FileText size={16} /> },
    { key: 'CUSTOMER_SWITCH', label: 'View Customer Market', badge: 'STORE', icon: <Home size={16} /> },
  ];

  const getVendorMenus = (): MenuItem[] => [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { key: 'crops', label: 'My Crops', badge: 'Live', icon: <Store size={16} /> },
    { key: 'orders', label: 'Orders Dispatch', badge: '3', icon: <Package size={16} /> },
    { key: 'harvests', label: 'Harvest Tracker', icon: <Calendar size={16} /> },
    { key: 'payouts', label: 'Payouts', badge: '₹48K', icon: <Wallet size={16} /> },
    { key: 'CUSTOMER_SWITCH', label: 'Back to Customer Market', badge: 'STORE', icon: <Home size={16} /> },
  ];

  const getCustomerMenus = (): MenuItem[] => {
    const menus: MenuItem[] = [
      { key: 'HOME', label: 'Home Market', icon: <Home size={16} /> },
      { key: 'ALL_PRODUCTS', label: 'Products', icon: <ShoppingBag size={16} /> },
      { key: 'CART', label: 'My Cart', icon: <Package size={16} /> },
      { key: 'MY_SUBSCRIPTIONS', label: 'Subscriptions', badge: 'Active', icon: <RefreshCw size={16} /> },
      { key: 'ORDER_HISTORY', label: 'My Orders', icon: <FileText size={16} /> },
      { key: 'PROFILE', label: 'My Profile', icon: <User size={16} /> },
    ];

    // Admin Console & CMS direct switch inside the app
    menus.push({ key: 'ADMIN_SWITCH', label: 'Admin Console & CMS', badge: 'ADMIN', icon: <MonitorCog size={16} /> });

    // Only approved vendors get the vendor switch drawer option
    if (isApprovedVendor) {
      menus.push({ key: 'VENDOR_SWITCH', label: 'Switch to Vendor Console', badge: 'FARMER', icon: <Store size={16} /> });
    }

    menus.push(
      { key: 'WHATSAPP_AI', label: 'WhatsApp AI', badge: 'BOT', icon: <MessageSquare size={16} /> },
      { key: 'AI_VOICE_CALL', label: 'Voice Assistant', badge: 'LIVE', icon: <PhoneCall size={16} /> }
    );

    return menus;
  };

  const menuItems = role === 'admin' 
    ? getAdminMenus() 
    : role === 'vendor' 
    ? getVendorMenus() 
    : getCustomerMenus();

  const getRoleTitle = () => {
    switch (role) {
      case 'admin': return 'Super Admin';
      case 'vendor': return 'Farmer Console';
      default: return 'Customer Portal';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={sd.modalOverlay}>
        {/* Left Side Drawer Container (Opens on left side) */}
        <View style={sd.drawerContainer}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header Box */}
            <View style={sd.headerBox}>
              <Image
                source={require('../../asset/logo.jpeg')}
                style={sd.logo}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={sd.appName} numberOfLines={1}>Mathira Organic</Text>
                <Text style={sd.roleSub} numberOfLines={1}>{getRoleTitle()}</Text>
              </View>
              <TouchableOpacity style={sd.closeBtn} onPress={onClose} activeOpacity={0.7}>
                <X size={15} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Seamless Menu Item List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={sd.menuList}>
              {menuItems.map((item) => {
                const isActive = activeScreen.toLowerCase() === item.key.toLowerCase();
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[sd.menuRow, isActive && sd.menuRowActive]}
                    onPress={() => {
                      onSelectScreen(item.key);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={sd.iconBox}>
                      {React.cloneElement(item.icon as React.ReactElement<any>, {
                        color: isActive ? '#15803D' : '#64748B',
                        size: 18,
                      })}
                    </View>
                    
                    <Text style={[sd.menuLabel, isActive && sd.menuLabelActive]} numberOfLines={1}>
                      {item.label}
                    </Text>

                    {item.badge && (
                      <View style={[sd.badge, isActive && sd.badgeActive]}>
                        <Text style={[sd.badgeText, isActive && sd.badgeTextActive]}>{item.badge}</Text>
                      </View>
                    )}
                    <ChevronRight size={13} color={isActive ? '#15803D' : '#CBD5E1'} />
                  </TouchableOpacity>
                );
              })}

              <View style={sd.divider} />

              {/* Sign Out Action */}
              <TouchableOpacity
                style={[sd.menuRow, sd.logoutRow]}
                onPress={() => {
                  onClose();
                  onLogout();
                }}
                activeOpacity={0.7}
              >
                <View style={sd.iconBox}>
                  <LogOut size={16} color="#DC2626" />
                </View>
                <Text style={sd.logoutLabel}>Sign Out</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Minimalist App Version Footer */}
            <View style={[sd.footerBox, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]}>
              <Sprout size={13} color="#16a34a" />
              <Text style={sd.footerText}>Mathira Organic · 100% Certified</Text>
            </View>
          </SafeAreaView>
        </View>

        {/* Backdrop Press to Close (Fills remaining right side) */}
        <TouchableOpacity style={sd.backdrop} activeOpacity={1} onPress={onClose} />
      </View>
    </Modal>
  );
};

const sd = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  backdrop: {
    flex: 1,
  },
  drawerContainer: {
    width: 265, // Comfortable width for mobile and tablet
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 16,
  },
  headerBox: {
    backgroundColor: '#0D2B1D',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(34, 197, 94, 0.25)',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#22c55e',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  roleSub: {
    color: '#86EFAC',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuList: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  menuRowActive: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 3.5,
    borderLeftColor: '#15803D',
  },
  logoutRow: {
    marginTop: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  iconBox: {
    marginRight: 10,
    width: 22,
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '600',
  },
  menuLabelActive: {
    color: '#15803D',
    fontWeight: '800',
  },
  logoutLabel: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  badgeText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: '#15803D',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
    marginHorizontal: 6,
  },
  footerBox: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
});
