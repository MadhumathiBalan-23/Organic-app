import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import {
  MapPin,
  ChevronDown,
  Search,
  X,
  ShoppingCart,
  Mic,
} from 'lucide-react-native';

export interface HomeHeaderProps {
  selectedLocation?: { address: string; city?: string; isGpsVerified?: boolean } | null;
  onChangeLocation?: () => void;
  onOpenPlans?: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  placeholder?: string;
  headerThemeColor?: string;
}

export const getGradientTheme = (baseColor: string = '#07843D') => {
  if (!baseColor) {
    return {
      dark: '#02381A',
      mid: '#07843D',
      light: '#15803D',
      accent: '#F2C500',
    };
  }

  if (baseColor.includes('|')) {
    const parts = baseColor.split('|').map(s => s.trim()).filter(Boolean);
    const top = parts[0] || '#02381A';
    const bottom = parts[1] || parts[0] || '#15803D';
    return {
      dark: top,
      mid: top,
      light: bottom,
      accent: '#FDE047',
    };
  }

  const c = (baseColor || '').toUpperCase();
  if (c.includes('C2410C') || c.includes('9A3412') || c.includes('B45309') || c.includes('EA580C') || c.includes('SAFFRON')) {
    return {
      dark: '#6A250E',
      mid: '#C2410C',
      light: '#EA580C',
      accent: '#FDE047',
    };
  }
  if (c.includes('0F766E') || c.includes('115E59') || c.includes('134E4A') || c.includes('0D9488') || c.includes('TEAL')) {
    // Pure Morning Teal
    return {
      dark: '#0B4742',     // Deep ocean dark teal
      mid: '#0F766E',      // Morning pure teal
      light: '#14B8A6',    // Lighter crisp cyan teal
      accent: '#FEF08A',
    };
  }
  if (c.includes('831843') || c.includes('881337') || c.includes('9F1239') || c.includes('701A75') || c.includes('86198F') || c.includes('RUBY')) {
    // Royal Festive Ruby / Magenta
    return {
      dark: '#4A041E',     // Deep royal festive burgundy
      mid: '#831843',      // Vibrant Ruby
      light: '#BE185D',    // Lighter luminous magenta
      accent: '#FBBF24',
    };
  }
  if (c.includes('6B21A8') || c.includes('7E22CE') || c.includes('581C87') || c.includes('PURPLE')) {
    // Royal Festive Purple
    return {
      dark: '#35065A',     // Deep midnight purple
      mid: '#6B21A8',      // Royal purple
      light: '#9333EA',    // Lighter radiant violet
      accent: '#FDE047',
    };
  }
  if (c.includes('B45309') || c.includes('D97706') || c.includes('AMBER') || c.includes('GOLD')) {
    // Golden Harvest Amber
    return {
      dark: '#78350F',     // Deep golden amber
      mid: '#D97706',      // Warm honey amber
      light: '#F59E0B',    // Lighter radiant gold
      accent: '#FEF08A',
    };
  }
  // Default: Signature Organic Green
  return {
    dark: '#02381A',       // Deep rich forest green
    mid: '#07843D',        // Classic organic green
    light: '#15803D',      // Lighter sunlit foliage green
    accent: '#F2C500',
  };
};

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  selectedLocation,
  onChangeLocation,
  onOpenPlans,
  onOpenCart,
  cartCount = 0,
  searchQuery = '',
  onSearchChange,
  placeholder = 'Search milk, vegetables, fruits, ghee...',
  headerThemeColor = '#07843D',
}) => {
  const gradient = getGradientTheme(headerThemeColor);

  // Dynamically extract approximate delivery area (e.g. "Perundurai Bus Stand")
  const getAreaTitle = () => {
    if (selectedLocation?.address) {
      const parts = selectedLocation.address.split(',');
      const first = parts[0]?.trim();
      if (first && first.length > 0) return first;
    }
    return 'Perundurai Bus Stand';
  };

  // Dynamically extract optional locality & city (e.g. "Perundurai, Erode - 638052")
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

  return (
    <View style={[styles.headerContainer, { backgroundColor: gradient.dark }]}>
      <StatusBar barStyle="light-content" backgroundColor={gradient.dark} translucent />

      {/* Dark-to-Light Linear Gradient Background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="headerGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={gradient.dark} stopOpacity="1" />
              <Stop offset="55%" stopColor={gradient.mid} stopOpacity="1" />
              <Stop offset="100%" stopColor={gradient.light} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#headerGrad)" />
        </Svg>
      </View>

      {/* Top Row: Location on Left, Subscription ($) & Cart on Right */}
      <View style={styles.topRow}>
        {/* Left: GPS Location Pin + Delivery Area */}
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={onChangeLocation}
          activeOpacity={0.8}
          accessibilityLabel="Select Delivery Location"
        >
          <View style={styles.pinWrapper}>
            <MapPin size={22} color="#FFFFFF" />
          </View>
          <View style={styles.locationTextCol}>
            <View style={styles.locationTitleRow}>
              <Text style={styles.locationTitle} numberOfLines={1}>
                {getAreaTitle()}
              </Text>
              <ChevronDown size={15} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: 3 }} />
            </View>
            <Text style={styles.locationSubtitle} numberOfLines={1}>
              {getAreaSubtitle()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right: Subscription ($) & Shopping Cart */}
        <View style={styles.headerRightActions}>
          {/* Subscription Dollar Icon with Yellow Circular Background */}
          <TouchableOpacity
            style={styles.subscriptionIconBtn}
            onPress={onOpenPlans}
            activeOpacity={0.8}
            accessibilityLabel="Subscription Plans"
          >
            <Text style={styles.subscriptionDollarSign}>$</Text>
          </TouchableOpacity>

          {/* White Shopping Cart Icon with Dynamic Count Badge */}
          <TouchableOpacity
            style={styles.cartIconBtn}
            onPress={onOpenCart}
            activeOpacity={0.8}
            accessibilityLabel="Shopping Cart"
          >
            <ShoppingCart size={22} color="#FFFFFF" strokeWidth={2.3} />
            {typeof cartCount === 'number' && cartCount > 0 && (
              <View style={[styles.cartBadge, { borderColor: headerThemeColor || '#07843D' }]}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Second Row: Full-width white rounded search bar seamlessly connected to header */}
      <View style={styles.searchBarContainer}>
        <Search size={18} color="#52645B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#718078"
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange && onSearchChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ padding: 4 }}
          >
            <X size={16} color="#718078" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.micBtn}
          activeOpacity={0.7}
          accessibilityLabel="Voice Search"
        >
          <Mic size={18} color="#18352B" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#07843D', // Primary Organic Green
    paddingTop: Platform.OS === 'web' ? 44 : Math.max(STATUSBAR_HEIGHT, 36) + 12,
    paddingBottom: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
    overflow: 'hidden',
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  pinWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  locationTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  locationSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subscriptionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2C500', // Yellow accent
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  subscriptionDollarSign: {
    fontSize: 19,
    fontWeight: '900',
    color: '#18352B',
    lineHeight: 22,
    textAlign: 'center',
  },
  cartIconBtn: {
    width: 36,
    height: 36,
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
    height: 46,
    paddingHorizontal: 14,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#18352B',
    paddingVertical: 0,
  },
  micBtn: {
    padding: 4,
    marginLeft: 6,
  },
});

export default HomeHeader;
