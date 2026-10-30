import React from 'react';
import {
  View, Text, Modal, TouchableOpacity,
  ScrollView, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X, LayoutDashboard, ShoppingBag, Tags, Sprout, Users,
  Package, FileText, Store, Calendar, Wallet, Home,
  RefreshCw, User, MessageSquare, PhoneCall, LogOut, ChevronRight, MonitorCog,
  Sparkles, Smartphone
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
    { key: 'DEVICES', label: 'Trusted Devices', icon: <Smartphone size={16} /> },
    { key: 'CUSTOMER_SWITCH', label: 'View Customer Market', badge: 'STORE', icon: <Home size={16} /> },
  ];

  const getVendorMenus = (): MenuItem[] => [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { key: 'crops', label: 'My Crops', badge: 'Live', icon: <Store size={16} /> },
    { key: 'orders', label: 'Orders Dispatch', badge: '3', icon: <Package size={16} /> },
    { key: 'harvests', label: 'Harvest Tracker', icon: <Calendar size={16} /> },
    { key: 'payouts', label: 'Payouts', badge: '₹48K', icon: <Wallet size={16} /> },
    { key: 'DEVICES', label: 'Trusted Devices', icon: <Smartphone size={16} /> },
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
      { key: 'DEVICES', label: 'Trusted Devices', icon: <Smartphone size={16} /> },
    ];

    // Admin Console & CMS direct switch inside the app
    menus.push({ key: 'ADMIN_SWITCH', label: 'Admin Console & CMS', badge: 'ADMIN', icon: <MonitorCog size={16} /> });

    // Only approved vendors get the vendor switch drawer option
    if (isApprovedVendor) {
      menus.push({ key: 'VENDOR_SWITCH', label: 'Switch to Vendor Console', badge: 'VENDOR', icon: <Store size={16} /> });
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
      case 'vendor': return 'Vendor Console';
      default: return 'Customer Portal';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 flex-row bg-slate-900/45">
        {/* Left Side Drawer Container */}
        <View className="w-[265px] h-full bg-white border-r border-slate-200 shadow-2xl">
          <SafeAreaView className="flex-1">
            {/* Header Box */}
            <View className="bg-[#0D2B1D] flex-row items-center gap-2.5 px-4 py-4 border-b border-emerald-500/25">
              <Image
                source={require('../../asset/logo.png')}
                className="w-9 h-9 rounded-full border border-emerald-500"
                resizeMode="contain"
              />
              <View className="flex-1">
                <Text className="text-white text-sm font-extrabold tracking-tight" numberOfLines={1}>Mathira Organic</Text>
                <Text className="text-emerald-300 text-2xs font-bold mt-0.5" numberOfLines={1}>{getRoleTitle()}</Text>
              </View>
              <TouchableOpacity className="w-7 h-7 rounded-full bg-white/15 items-center justify-center" onPress={onClose} activeOpacity={0.7}>
                <X size={15} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Seamless Menu Item List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="py-3 px-2.5">
              {menuItems.map((item) => {
                const isActive = activeScreen.toLowerCase() === item.key.toLowerCase();
                return (
                  <TouchableOpacity
                    key={item.key}
                    className={`flex-row items-center py-2.5 px-3 rounded-xl mb-1 ${isActive ? 'bg-emerald-50 border-l-4 border-emerald-700' : ''}`}
                    onPress={() => {
                      onSelectScreen(item.key);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <View className="mr-2.5 w-5 items-center">
                      {React.cloneElement(item.icon as React.ReactElement<any>, {
                        color: isActive ? '#15803D' : '#64748B',
                        size: 18,
                      })}
                    </View>
                    
                    <Text className={`flex-1 text-sm ${isActive ? 'text-emerald-700 font-extrabold' : 'text-slate-800 font-semibold'}`} numberOfLines={1}>
                      {item.label}
                    </Text>

                    {item.badge && (
                      <View className={`px-1.5 py-0.5 rounded-md mr-1.5 border ${isActive ? 'bg-emerald-100 border-emerald-300' : 'bg-slate-100 border-slate-200'}`}>
                        <Text className={`text-2xs font-bold ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>{item.badge}</Text>
                      </View>
                    )}
                    <ChevronRight size={13} color={isActive ? '#15803D' : '#CBD5E1'} />
                  </TouchableOpacity>
                );
              })}

              <View className="h-[1px] bg-slate-100 my-2 mx-1.5" />

              {/* Sign Out Action */}
              <TouchableOpacity
                className="mt-2 bg-red-50 border border-red-200 flex-row items-center py-2.5 px-3 rounded-xl"
                onPress={() => {
                  onClose();
                  onLogout();
                }}
                activeOpacity={0.7}
              >
                <View className="mr-2.5 w-5 items-center">
                  <LogOut size={16} color="#DC2626" />
                </View>
                <Text className="text-red-600 text-sm font-bold">Sign Out</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Minimalist App Version Footer */}
            <View className="py-3 items-center border-t border-slate-100 bg-slate-50 flex-row justify-center gap-1.5">
              <Sprout size={13} color="#16a34a" />
              <Text className="text-slate-400 text-2xs font-semibold">Mathira Organic · 100% Certified</Text>
            </View>
          </SafeAreaView>
        </View>

        {/* Backdrop Press to Close */}
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
      </View>
    </Modal>
  );
};
