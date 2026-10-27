import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import {
  Menu as MenuIcon,
  ArrowLeft,
  Sprout,
  Settings,
  Store,
} from 'lucide-react-native';
import { HomeHeader } from './HomeHeader';

export type UserRole = 'customer' | 'admin' | 'vendor' | null;

export interface AppHeaderProps {
  role: UserRole;
  currentScreen?: string;
  onOpenMenu: () => void;
  onBack?: () => void;
  onSwitchToCustomer?: () => void;
  selectedLocation?: { address: string; city?: string; isGpsVerified?: boolean } | null;
  onChangeLocation?: () => void;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  placeholder?: string;
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenSearch?: () => void;
  onOpenPlans?: () => void;
  headerThemeColor?: string;
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

export const AppHeader: React.FC<AppHeaderProps> = ({
  role = 'customer',
  currentScreen = 'HOME',
  onOpenMenu,
  onBack,
  onSwitchToCustomer,
  selectedLocation,
  onChangeLocation,
  searchQuery = '',
  onSearchChange,
  placeholder = 'Search milk, vegetables, fruits, ghee...',
  cartCount = 0,
  onOpenCart,
  onOpenPlans,
  headerThemeColor,
}) => {
  const isCustomer = role === 'customer';
  const isHomeScreen = !currentScreen || currentScreen === 'HOME';

  // ── CASE 1: CUSTOMER HOME SCREEN (Amazon-inspired Organic Connected Header) ──
  if (isCustomer && isHomeScreen) {
    return (
      <HomeHeader
        selectedLocation={selectedLocation}
        onChangeLocation={onChangeLocation}
        onOpenPlans={onOpenPlans}
        onOpenCart={onOpenCart}
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        placeholder={placeholder}
        headerThemeColor={headerThemeColor}
      />
    );
  }

  // ── CASE 2: CUSTOMER OTHER SCREENS (Clean Top Bar: Back Icon + Screen Name) ──
  if (isCustomer && !isHomeScreen) {
    const getScreenTitle = () => {
      switch (currentScreen) {
        case 'ORDER_HISTORY':
          return 'Order Again';
        case 'ALL_PRODUCTS':
          return 'Categories';
        case 'MY_SUBSCRIPTIONS':
          return 'Plans';
        case 'PROFILE':
          return 'Profile';
        case 'CART':
          return 'Shopping Cart';
        case 'PRODUCT_DETAILS':
          return 'Product Details';
        case 'SUBSCRIPTION_CREATE':
          return 'Daily Subscription';
        case 'SUBSCRIPTION_SUMMARY':
          return 'Subscription Plan';
        case 'PAYMENT':
          return 'Secure Payment';
        case 'WHATSAPP_AI':
          return 'WhatsApp AI';
        case 'AI_VOICE_CALL':
          return 'Voice AI Hotline';
        case 'DAILY_CONFIRMATION':
          return 'Daily Confirmation';
        default:
          return 'Mathira Organics';
      }
    };

    return (
      <View 
        className="bg-white border-b border-slate-100 pb-3 px-4 shadow-xs z-[100]"
        style={{ paddingTop: Platform.OS === 'web' ? 12 : STATUSBAR_HEIGHT + 8 }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
        <View className="flex-row items-center">
          <TouchableOpacity
            className="w-9 h-9 rounded-full items-center justify-center -ml-1 active:bg-slate-100"
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityLabel="Go Back"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={22} color="#0F172A" strokeWidth={2.4} />
          </TouchableOpacity>

          <Text className="text-lg font-bold text-slate-900 tracking-tight ml-2">
            {getScreenTitle()}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View 
      className="bg-[#07843D] pb-3 px-4 shadow-md z-[100]"
      style={{ paddingTop: Platform.OS === 'web' ? 12 : STATUSBAR_HEIGHT + 8 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#07843D" translucent />

      {/* ── CASE 3: VENDOR CONSOLE (No sidebar, Store only in top-right corner) ── */}
      {role === 'vendor' && (
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 flex-row items-center gap-2.5">
            <Image
              source={require('../../asset/logo.jpeg')}
              className="w-9 h-9 rounded-xl bg-white"
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text className="text-base font-extrabold text-white tracking-tight" numberOfLines={1}>
                Vendor Portal
              </Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Sprout size={11} color="#A7F3D0" />
                <Text className="text-xs text-[#A7F3D0] font-semibold">
                  Verified Producer Hub
                </Text>
              </View>
            </View>
          </View>

          {/* Store button ONLY in top right corner */}
          {onSwitchToCustomer && (
            <TouchableOpacity 
              className="flex-row items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl border border-white/25 active:bg-white/30" 
              onPress={onSwitchToCustomer} 
              activeOpacity={0.8}
            >
              <Store size={14} color="#FFFFFF" strokeWidth={2.2} />
              <Text className="text-white text-xs font-bold">Store</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── CASE 4: SUPER ADMIN ── */}
      {role === 'admin' && (
        <View className="flex-row items-center justify-between gap-3">
          <TouchableOpacity 
            className="w-9 h-9 rounded-xl bg-white/20 items-center justify-center" 
            onPress={onOpenMenu} 
            activeOpacity={0.75}
          >
            <MenuIcon size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center gap-2.5">
            <Image
              source={require('../../asset/logo.jpeg')}
              className="w-9 h-9 rounded-xl bg-white"
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text className="text-base font-extrabold text-white tracking-tight" numberOfLines={1}>
                {currentScreen === 'banners' ? 'Banners & CMS' :
                 currentScreen === 'vendorRequests' ? 'Vendor Approvals' :
                 currentScreen === 'products' ? 'Products Catalog' :
                 currentScreen === 'categories' ? 'Categories' :
                 currentScreen === 'brands' ? 'Brands' :
                 currentScreen === 'customers' ? 'Customers' :
                 currentScreen === 'orders' ? 'Orders' :
                 currentScreen === 'logs' ? 'System Logs' : 'Admin Dashboard'}
              </Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Settings size={11} color="#BBF7D0" />
                <Text className="text-xs text-[#BBF7D0] font-semibold">Super Admin</Text>
                <View className="bg-red-600 rounded-md px-1.5 py-0.5 ml-1">
                  <Text className="text-white text-2xs font-extrabold">SIDEBAR ☰</Text>
                </View>
              </View>
            </View>
          </View>

          {onSwitchToCustomer && (
            <TouchableOpacity 
              className="flex-row items-center gap-1 bg-white/20 px-2.5 py-1.5 rounded-xl" 
              onPress={onSwitchToCustomer} 
              activeOpacity={0.8}
            >
              <Store size={14} color="#FFFFFF" />
              <Text className="text-white text-xs font-bold">Store</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export { HomeHeader } from './HomeHeader';
export default AppHeader;
