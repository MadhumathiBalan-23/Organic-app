import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, Image, SafeAreaView
} from 'react-native';
import {
  X, LayoutDashboard, ShoppingBag, Tags, Sprout, Users,
  Package, FileText, Store, Calendar, Wallet, Home,
  RefreshCw, User, MessageSquare, PhoneCall, LogOut, ChevronRight
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
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  visible,
  onClose,
  role,
  activeScreen,
  onSelectScreen,
  onLogout
}) => {
  // Ultra-clean, simplified menu lists (No clutter headers, standard mobile app names)
  const getAdminMenus = (): MenuItem[] => [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { key: 'products', label: 'Products', badge: '12', icon: <ShoppingBag size={16} /> },
    { key: 'categories', label: 'Categories', icon: <Tags size={16} /> },
    { key: 'brands', label: 'Brands', icon: <Sprout size={16} /> },
    { key: 'customers', label: 'Customers', badge: 'VIP', icon: <Users size={16} /> },
    { key: 'orders', label: 'Orders', badge: 'New', icon: <Package size={16} /> },
    { key: 'logs', label: 'System Logs', icon: <FileText size={16} /> },
  ];

  const getVendorMenus = (): MenuItem[] => [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { key: 'crops', label: 'My Crops', badge: 'Live', icon: <Store size={16} /> },
    { key: 'orders', label: 'Orders Dispatch', badge: '3', icon: <Package size={16} /> },
    { key: 'harvests', label: 'Harvest Tracker', icon: <Calendar size={16} /> },
    { key: 'payouts', label: 'Payouts', badge: '₹48K', icon: <Wallet size={16} /> },
  ];

  const getCustomerMenus = (): MenuItem[] => [
    { key: 'HOME', label: 'Home Market', icon: <Home size={16} /> },
    { key: 'ALL_PRODUCTS', label: 'Products', icon: <ShoppingBag size={16} /> },
    { key: 'CART', label: 'My Cart', icon: <Package size={16} /> },
    { key: 'MY_SUBSCRIPTIONS', label: 'Subscriptions', badge: 'Active', icon: <RefreshCw size={16} /> },
    { key: 'ORDER_HISTORY', label: 'My Orders', icon: <FileText size={16} /> },
    { key: 'PROFILE', label: 'My Profile', icon: <User size={16} /> },
    { key: 'WHATSAPP_AI', label: 'WhatsApp AI', badge: 'BOT', icon: <MessageSquare size={16} /> },
    { key: 'AI_VOICE_CALL', label: 'Voice Assistant', badge: 'LIVE', icon: <PhoneCall size={16} /> },
  ];

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
        {/* Backdrop Press to Close */}
        <TouchableOpacity style={sd.backdrop} activeOpacity={1} onPress={onClose} />

        {/* Ultra Slim Professional Drawer */}
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
              <TouchableOpacity style={sd.closeBtn} onPress={onClose}>
                <X size={14} color="#64748B" />
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
                      {React.cloneElement(item.icon as React.ReactElement, {
                        color: isActive ? '#15803D' : '#64748B'
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
            <View style={sd.footerBox}>
              <Text style={sd.footerText}>Mathira Organic v1.0</Text>
            </View>
          </SafeAreaView>
        </View>
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
    width: 210, // Slim width as requested
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  headerBox: {
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#15803D',
  },
  appName: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  roleSub: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 0.5,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuList: {
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 2,
  },
  menuRowActive: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 3,
    borderLeftColor: '#15803D',
  },
  logoutRow: {
    marginTop: 4,
  },
  iconBox: {
    marginRight: 9,
    width: 18,
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    color: '#334155',
    fontSize: 11.5,
    fontWeight: '600',
  },
  menuLabelActive: {
    color: '#15803D',
    fontWeight: '800',
  },
  logoutLabel: {
    color: '#DC2626',
    fontSize: 11.5,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginRight: 4,
  },
  badgeActive: {
    backgroundColor: '#DCFCE7',
  },
  badgeText: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: '#15803D',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
    marginHorizontal: 8,
  },
  footerBox: {
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '600',
  },
});
