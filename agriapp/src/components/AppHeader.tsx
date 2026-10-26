import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  TextInput,
} from 'react-native';
import {
  Menu as MenuIcon,
  ArrowLeft,
  Search,
  X,
  MapPin,
  Sprout,
  Settings,
  ChevronDown,
  Store,
  ShoppingCart,
  Mic,
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
  onOpenSearch,
  onOpenPlans,
  headerThemeColor,
}) => {
  const isCustomer = role === 'customer';
  const isHomeScreen = !currentScreen || currentScreen === 'HOME';

  // Format delivery location area name (e.g. "Perundurai Bus Stand")
  const getAreaTitle = () => {
    if (selectedLocation?.address) {
      const parts = selectedLocation.address.split(',');
      const first = parts[0]?.trim();
      if (first && first.length > 0) return first;
    }
    return 'Perundurai Bus Stand';
  };

  // Format delivery location locality & city (e.g. "Perundurai, Erode - 638052")
  const getAreaSubtitle = () => {
    if (selectedLocation?.address) {
      const parts = selectedLocation.address.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        return parts.slice(1, 3).join(', ');
      }
      return selectedLocation.city || 'Perundurai, Erode - 638052';
    }
    return 'Perundurai, Erode - 638052';
  };

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

  return (
    <View style={styles.headerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#07843D" translucent />

      {/* ── CASE 2: CUSTOMER OTHER SCREENS (Back Button + Screen Title + Cart Icon) ── */}
      {isCustomer && !isHomeScreen && (
        <View style={styles.subScreenRow}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onBack}
            activeOpacity={0.75}
            accessibilityLabel="Go Back"
          >
            <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.navCenterCol}>
            <Text style={styles.navCenterTitle} numberOfLines={1}>
              {currentScreen === 'ALL_PRODUCTS' ? 'Organic Categories' :
               currentScreen === 'PRODUCT_DETAILS' ? 'Product Details' :
               currentScreen === 'SUBSCRIPTION_CREATE' ? 'Daily Subscription' :
               currentScreen === 'SUBSCRIPTION_SUMMARY' ? 'Subscription Plan' :
               currentScreen === 'PAYMENT' ? 'Secure Payment' :
               currentScreen === 'MY_SUBSCRIPTIONS' ? 'Subscription Plans' :
               currentScreen === 'ORDER_HISTORY' ? 'Order Again' :
               currentScreen === 'CART' ? 'Shopping Cart' :
               currentScreen === 'PROFILE' ? 'My Profile' :
               currentScreen === 'WHATSAPP_AI' ? 'WhatsApp AI' :
               currentScreen === 'AI_VOICE_CALL' ? 'Voice AI Hotline' :
               currentScreen === 'DAILY_CONFIRMATION' ? 'Daily Confirmation' :
               'Mathira Organics'}
            </Text>
            <Text style={styles.navCenterSub} numberOfLines={1}>
              {currentScreen === 'ALL_PRODUCTS' ? 'Farm-fresh harvest & produce' :
               currentScreen === 'CART' ? `${cartCount} item${cartCount === 1 ? '' : 's'} in cart` :
               currentScreen === 'ORDER_HISTORY' ? 'Quickly reorder past favorites' :
               currentScreen === 'MY_SUBSCRIPTIONS' ? 'Manage your daily deliveries' :
               currentScreen === 'PROFILE' ? 'Account & Preferences' :
               '100% Certified Organic Direct'}
            </Text>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.cartIconBtn}
              onPress={onOpenCart}
              activeOpacity={0.75}
              accessibilityLabel="Shopping Cart"
            >
              <ShoppingCart size={22} color="#FFFFFF" strokeWidth={2.3} />
              {typeof cartCount === 'number' && cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── CASE 3: VENDOR / FARMER CONSOLE ── */}
      {role === 'vendor' && (
        <View style={styles.subScreenRow}>
          <TouchableOpacity style={styles.circleBtn} onPress={onOpenMenu} activeOpacity={0.75}>
            <MenuIcon size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.brandContainer}>
            <Image
              source={require('../../asset/logo.jpeg')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.brandTextCol}>
              <Text style={styles.brandTitle} numberOfLines={1}>
                Farmer Portal
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                <Sprout size={11} color="#A7F3D0" />
                <Text style={{ fontSize: 11, color: '#A7F3D0', fontWeight: '600' }}>
                  Verified Producer Hub
                </Text>
              </View>
            </View>
          </View>

          {onSwitchToCustomer && (
            <TouchableOpacity style={styles.storeSwitchBtn} onPress={onSwitchToCustomer} activeOpacity={0.8}>
              <Store size={14} color="#FFFFFF" />
              <Text style={styles.storeSwitchText}>Store</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {role === 'admin' && (
        <View style={styles.subScreenRow}>
          <TouchableOpacity style={styles.circleBtn} onPress={onOpenMenu} activeOpacity={0.75}>
            <MenuIcon size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.brandContainer}>
            <Image
              source={require('../../asset/logo.jpeg')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.brandTextCol}>
              <Text style={styles.brandTitle} numberOfLines={1}>
                {currentScreen === 'banners' ? 'Banners & CMS' :
                 currentScreen === 'vendorRequests' ? 'Vendor Approvals' :
                 currentScreen === 'products' ? 'Products Catalog' :
                 currentScreen === 'categories' ? 'Categories' :
                 currentScreen === 'brands' ? 'Brands' :
                 currentScreen === 'customers' ? 'Customers' :
                 currentScreen === 'orders' ? 'Orders' :
                 currentScreen === 'logs' ? 'System Logs' : 'Admin Dashboard'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Settings size={11} color="#BBF7D0" />
                <Text style={{ fontSize: 11, color: '#BBF7D0', fontWeight: '600' }}>Super Admin</Text>
                <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>SIDEBAR ☰</Text></View>
              </View>
            </View>
          </View>

          {onSwitchToCustomer && (
            <TouchableOpacity style={styles.storeSwitchBtn} onPress={onSwitchToCustomer} activeOpacity={0.8}>
              <Store size={14} color="#FFFFFF" />
              <Text style={styles.storeSwitchText}>Store</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#07843D',
    paddingTop: Platform.OS === 'web' ? 12 : STATUSBAR_HEIGHT + 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  homeHeaderContent: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  pinWrapper: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  locationSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#D1FAE5',
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subscriptionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2C500', // Yellow accent
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  subscriptionDollarSign: {
    fontSize: 17,
    fontWeight: '900',
    color: '#18352B',
    lineHeight: 20,
    textAlign: 'center',
  },
  cartIconBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#07843D',
    zIndex: 10,
    elevation: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 44,
    paddingHorizontal: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#18352B',
    paddingVertical: 0,
  },
  micBtn: {
    padding: 4,
    marginLeft: 6,
  },
  subScreenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCenterCol: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  navCenterTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  navCenterSub: {
    fontSize: 11,
    color: '#A7F3D0',
    fontWeight: '600',
    marginTop: 1,
  },
  brandContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  brandTextCol: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  storeSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  storeSwitchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  liveBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 4,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
});

export { HomeHeader } from './HomeHeader';
export default AppHeader;
