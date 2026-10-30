import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  Animated,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  scrollY?: Animated.Value;
}

// Dynamically adjusts hex color brightness (+% to lighten, -% to darken)
export const adjustBrightness = (hex: string, percent: number): string => {
  if (!hex || typeof hex !== 'string') return hex;
  let cleanHex = hex.trim().replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) return hex;

  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return hex;

  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const getGradientTheme = (baseColor?: string) => {
  const isValidHex = (c: string) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(c.trim());
  const safeHex = (c: string, fallback: string) => (isValidHex(c) ? c.trim() : fallback);

  if (!baseColor || !baseColor.trim()) {
    return {
      dark: '#02381A',
      mid: '#07843D',
      light: '#15803D',
      accent: '#F2C500',
    };
  }

  // 1. If admin panel provided pipe-delimited gradient (e.g. "topColor|bottomColor")
  if (baseColor.includes('|')) {
    const parts = baseColor.split('|').map(s => s.trim()).filter(Boolean);
    const top = safeHex(parts[0] || '', '#02381A');
    const bottom = safeHex(parts[1] || parts[0] || '', '#15803D');
    return {
      dark: top,
      mid: top,
      light: bottom,
      accent: adjustBrightness(bottom, 25),
    };
  }

  // 2. If admin panel provided a single exact color (e.g. "#FF5722", "#E11D48", or any custom hex)
  const exactColor = safeHex(baseColor.trim(), '#07843D');
  return {
    dark: adjustBrightness(exactColor, -25),
    mid: exactColor,
    light: exactColor,
    accent: adjustBrightness(exactColor, 40),
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
  scrollY,
}) => {
  const insets = useSafeAreaInsets();
  const gradient = getGradientTheme(headerThemeColor);

  // Internal fallback if scrollY isn't passed from parent
  const fallbackScrollY = useRef(new Animated.Value(0)).current;
  const animY = scrollY || fallbackScrollY;

  // Accurately calculate top safe padding:
  // - On Android: statusBarHeight (usually 24px) + subtle 4px breathing room = 28px
  // - On iOS: device safe notch inset (e.g. 44px) + 4px breathing room
  // - On Web: compact 12px padding
  const safeTop = insets.top > 0 ? insets.top : (Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0);
  const topPadding = Platform.OS === 'web' ? 12 : Math.max(safeTop, 16) + 4;
  const expandedHeight = topPadding + 104; // Full 2 rows (Location + Search Bar) visible at top
  const collapsedHeight = topPadding + 54;  // Single compact sticky row on scroll

  // Smooth easing scroll distance (80px for natural, silky-smooth thumb scrolling)
  // 1. Header height: gently shrinks with smooth 3-stage ease-in-out
  const animHeaderHeight = animY.interpolate({
    inputRange: [0, 30, 80],
    outputRange: [expandedHeight, expandedHeight - 12, collapsedHeight],
    extrapolate: 'clamp',
  });

  // 2. Location section (Row 1 Left): smoothly fades out and gently slides up
  const animLocationOpacity = animY.interpolate({
    inputRange: [0, 45],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const animLocationY = animY.interpolate({
    inputRange: [0, 45],
    outputRange: [0, -12],
    extrapolate: 'clamp',
  });

  // 3. Cart Icon (Row 1 Right): smoothly collapses so ONLY the ($) Dollar symbol remains visible on scroll
  const animCartOpacity = animY.interpolate({
    inputRange: [0, 35],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const animCartWidth = animY.interpolate({
    inputRange: [0, 70],
    outputRange: [36, 0],
    extrapolate: 'clamp',
  });

  const animCartMarginLeft = animY.interpolate({
    inputRange: [0, 70],
    outputRange: [12, 0],
    extrapolate: 'clamp',
  });

  // 4. Same Search Bar (Row 2): smoothly glides up into the top row alongside the ($) Dollar icon
  const animSearchTranslateY = animY.interpolate({
    inputRange: [0, 30, 80],
    outputRange: [0, -12, -48],
    extrapolate: 'clamp',
  });

  // 5. Dynamic spacer: 0px at rest (Search Bar is 100% full width, ZERO gap), 48px on scroll (room for $)
  const animSpacerWidth = animY.interpolate({
    inputRange: [0, 30, 80],
    outputRange: [0, 10, 48],
    extrapolate: 'clamp',
  });

  // 6. Dynamic subtle shadow only appears when scrolled down; at scroll = 0 it is 0 (merges seamlessly with banner)
  const animElevation = animY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 4],
    extrapolate: 'clamp',
  });

  const animShadowOpacity = animY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 0.18],
    extrapolate: 'clamp',
  });

  // Dynamically extract approximate delivery area (e.g. "Nerunjipettai")
  const getAreaTitle = () => {
    if (selectedLocation?.address) {
      const parts = selectedLocation.address.split(',');
      const first = parts[0]?.trim();
      if (first && first.length > 0) return first;
    }
    return 'Nerunjipettai';
  };

  // Dynamically extract optional locality & city (e.g. "Anthiyur, Tamil Nadu")
  const getAreaSubtitle = () => {
    if (selectedLocation?.address) {
      const parts = selectedLocation.address.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        return parts.slice(1, 3).join(', ');
      }
      return selectedLocation.city || 'Anthiyur, Tamil Nadu';
    }
    return 'Anthiyur, Tamil Nadu';
  };

  const gradId = `headerGrad_${(gradient.dark + gradient.light).replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <Animated.View 
      className="px-4 z-[100] overflow-hidden relative"
      style={{
        backgroundColor: gradient.dark,
        paddingTop: topPadding,
        height: animHeaderHeight,
        elevation: animElevation,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: animShadowOpacity,
        shadowRadius: 4,
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor={gradient.dark} translucent />

      {/* Dark-to-Light Linear Gradient Background seamlessly connecting to page backdrop */}
      <View className="absolute inset-0" pointerEvents="none">
        <Svg width="100%" height="100%" key={gradId}>
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={gradient.dark} stopOpacity="1" />
              <Stop offset="55%" stopColor={gradient.mid} stopOpacity="1" />
              <Stop offset="100%" stopColor={gradient.light} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${gradId})`} />
        </Svg>
      </View>

      {/* Top Row: Location on Left, Subscription ($) & Cart on Right */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 }}>
        {/* Left: GPS Location Pin + Delivery Area (Smoothly collapses on scroll) */}
        <Animated.View 
          style={{
            flex: 1,
            marginRight: 8,
            opacity: animLocationOpacity,
            transform: [{ translateY: animLocationY }],
          }}
          pointerEvents={scrollY ? undefined : 'auto'}
        >
          <TouchableOpacity
            className="flex-row items-center flex-1"
            onPress={onChangeLocation}
            activeOpacity={0.8}
            accessibilityLabel="Select Delivery Location"
          >
            <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-2 shrink-0">
              <MapPin size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1 justify-center">
              <View className="flex-row items-center">
                <Text className="text-base font-extrabold text-white tracking-tight shrink" numberOfLines={1}>
                  {getAreaTitle()}
                </Text>
                <ChevronDown size={14} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: 3 }} />
              </View>
              <Text className="text-xs font-medium text-white/95 mt-0.5" numberOfLines={1}>
                {getAreaSubtitle()}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Right: Subscription ($) & Cart */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
          {/* Subscription Dollar Icon ($) - Stays visible on scroll and aligns with Search Bar */}
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-[#F2C500] items-center justify-center shadow-sm"
            onPress={onOpenPlans}
            activeOpacity={0.8}
            accessibilityLabel="Subscription Plans"
          >
            <Text className="text-lg font-black text-[#18352B] leading-5 text-center">$</Text>
          </TouchableOpacity>

          {/* White Shopping Cart Icon - Collapses smoothly on scroll leaving only ($) */}
          {Boolean(onOpenCart) && (
            <Animated.View
              style={{
                width: animCartWidth,
                opacity: animCartOpacity,
                marginLeft: animCartMarginLeft,
                overflow: 'hidden',
              }}
            >
              <TouchableOpacity
                className="w-9 h-9 items-center justify-center relative"
                onPress={onOpenCart}
                activeOpacity={0.8}
                accessibilityLabel="Shopping Cart"
              >
                <ShoppingCart size={22} color="#FFFFFF" strokeWidth={2.3} />
                {typeof cartCount === 'number' && cartCount > 0 && (
                  <View 
                    className="absolute -top-0.5 -right-1 bg-red-500 rounded-full min-w-[19px] h-[19px] px-1 items-center justify-center border-2 z-10"
                    style={{ borderColor: headerThemeColor || '#07843D' }}
                  >
                    <Text className="text-white text-[10.5px] font-extrabold text-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>

      {/* Second Row: Single Search Bar - 100% full width with ZERO gap at rest, smoothly contracts to fit beside ($) on scroll */}
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <Animated.View 
          style={{
            flex: 1,
            transform: [{ translateY: animSearchTranslateY }],
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              height: 44,
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Search size={18} color="#52645B" style={{ marginRight: 10 }} />
            <TextInput
              style={{
                flex: 1,
                fontSize: 14,
                color: '#18352B',
                paddingVertical: 0,
                paddingHorizontal: 0,
              }}
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
              style={{ padding: 4, marginLeft: 6 }}
              activeOpacity={0.7}
              accessibilityLabel="Voice Search"
            >
              <Mic size={18} color="#18352B" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Dynamic spacer: 0px at rest (Search Bar is 100% full width, ZERO gap), expands to 48px on scroll so Search Bar sits right next to ($) */}
        <Animated.View style={{ width: animSpacerWidth }} />
      </View>
    </Animated.View>
  );
};

export default HomeHeader;
