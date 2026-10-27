import React from 'react';
import {
  View,
  Text,
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

  const gradId = `headerGrad_${(gradient.dark + gradient.light).replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <View 
      className="pb-3.5 px-4 shadow-md z-[100] overflow-hidden relative"
      style={{
        backgroundColor: gradient.dark,
        paddingTop: Platform.OS === 'web' ? 44 : Math.max(STATUSBAR_HEIGHT, 36) + 12,
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor={gradient.dark} translucent />

      {/* Dark-to-Light Linear Gradient Background */}
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
      <View className="flex-row items-center justify-between py-0.5">
        {/* Left: GPS Location Pin + Delivery Area */}
        <TouchableOpacity
          className="flex-row items-center flex-1 mr-3"
          onPress={onChangeLocation}
          activeOpacity={0.8}
          accessibilityLabel="Select Delivery Location"
        >
          <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-2">
            <MapPin size={22} color="#FFFFFF" />
          </View>
          <View className="flex-1 justify-center">
            <View className="flex-row items-center gap-1">
              <Text className="text-base font-extrabold text-white tracking-tight shrink" numberOfLines={1}>
                {getAreaTitle()}
              </Text>
              <ChevronDown size={15} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: 3 }} />
            </View>
            <Text className="text-xs font-medium text-white/95 mt-0.5" numberOfLines={1}>
              {getAreaSubtitle()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right: Subscription ($) & Shopping Cart */}
        <View className="flex-row items-center gap-3">
          {/* Subscription Dollar Icon with Yellow Circular Background */}
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-[#F2C500] items-center justify-center shadow-sm"
            onPress={onOpenPlans}
            activeOpacity={0.8}
            accessibilityLabel="Subscription Plans"
          >
            <Text className="text-lg font-black text-[#18352B] leading-5 text-center">$</Text>
          </TouchableOpacity>

          {/* White Shopping Cart Icon with Dynamic Count Badge */}
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
        </View>
      </View>

      {/* Second Row: Full-width white rounded search bar seamlessly connected to header */}
      <View className="flex-row items-center bg-white rounded-2xl h-11 px-3.5 mt-3 shadow-sm">
        <Search size={18} color="#52645B" style={{ marginRight: 10 }} />
        <TextInput
          className="flex-1 text-[15px] text-[#18352B] py-0"
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
            className="p-1"
          >
            <X size={16} color="#718078" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="p-1 ml-1.5"
          activeOpacity={0.7}
          accessibilityLabel="Voice Search"
        >
          <Mic size={18} color="#18352B" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;
