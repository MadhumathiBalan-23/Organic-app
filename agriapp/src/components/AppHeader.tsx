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
import { CommonHeader } from './CommonHeader';

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
  scrollY?: any;
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
  onOpenSearch,
  onOpenPlans,
  headerThemeColor,
  scrollY,
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
        onOpenCart={undefined}
        cartCount={0}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onPressSearch={onOpenSearch}
        placeholder={placeholder}
        headerThemeColor={headerThemeColor}
        scrollY={scrollY}
      />
    );
  }

  // ── Discovery Screens have their own integrated Amazon-style header bars ──
  if (
    isCustomer &&
    (currentScreen === 'CATEGORY_PRODUCTS' ||
      currentScreen === 'ALL_PRODUCTS' ||
      currentScreen === 'CATEGORY_VENDOR_DISCOVERY' ||
      currentScreen === 'VENDOR_STORE' ||
      currentScreen === 'SEARCH')
  ) {
    return null;
  }


  // ── CASE 2: CUSTOMER OTHER SCREENS (Unified Common Header with Safe Area & Theme) ──
  if (isCustomer && !isHomeScreen) {
    const getScreenTitle = () => {
      switch (currentScreen) {
        case 'ORDER_HISTORY':
          return 'Order Again';
        case 'ALL_PRODUCTS':
          return 'Categories';
        case 'MY_SUBSCRIPTIONS':
          return 'Subscription Plans';
        case 'PROFILE':
          return 'My Profile';
        case 'VENDOR_REGISTRATION':
          return 'Vendor Registration';
        case 'CART':
          return 'Shopping Cart';
        case 'PRODUCT_DETAILS':
          return 'Product Details';
        case 'SUBSCRIPTION_CREATE':
          return 'Configure Subscription';
        case 'SUBSCRIPTION_SUMMARY':
          return 'Review Subscription';
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

    // Screens where header should be clean and uncluttered (no cart or dollar icons)
    const isFocusedCheckoutOrFlow =
      currentScreen === 'PROFILE' ||
      currentScreen === 'PRODUCT_DETAILS' ||
      currentScreen === 'VENDOR_REGISTRATION' ||
      currentScreen === 'SUBSCRIPTION_CREATE' ||
      currentScreen === 'SUBSCRIPTION_SUMMARY' ||
      currentScreen === 'PAYMENT' ||
      currentScreen === 'CART' ||
      currentScreen === 'DAILY_CONFIRMATION';

    return (
      <CommonHeader
        title={getScreenTitle()}
        showSearch={false}
        showBack={true}
        onBack={onBack}
        onOpenCart={isFocusedCheckoutOrFlow ? undefined : onOpenCart}
        onOpenPlans={isFocusedCheckoutOrFlow ? undefined : onOpenPlans}
        cartCount={isFocusedCheckoutOrFlow ? 0 : cartCount}
        headerThemeColor={headerThemeColor}
      />
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
              source={require('../../asset/logo.png')}
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
              source={require('../../asset/logo.png')}
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
