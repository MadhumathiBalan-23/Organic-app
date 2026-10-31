import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import {
  ChevronLeft,
  Search,
  X,
  ShoppingCart,
} from 'lucide-react-native';
import { getGradientTheme } from './HomeHeader';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

export interface CommonHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  onOpenCart?: () => void;
  onOpenPlans?: () => void;
  cartCount?: number;
  headerThemeColor?: string;
  rightAction?: React.ReactNode;
}

export const CommonHeader: React.FC<CommonHeaderProps> = ({
  title,
  showBack = true,
  onBack,
  showSearch = true,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search crops, vegetables, grains...',
  onOpenCart,
  onOpenPlans,
  cartCount = 0,
  headerThemeColor,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const gradient = getGradientTheme(headerThemeColor);
  const gradId = 'commonGrad_' + (gradient.dark + gradient.light).replace(/[^a-zA-Z0-9]/g, '');

  const safeTop = Platform.OS === 'web'
    ? 10
    : insets.top > 0
    ? insets.top
    : (Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20);
  const topPadding = Platform.OS === 'web' ? 10 : safeTop + 2;

  return (
    <View
      style={{
        backgroundColor: gradient.dark,
        paddingTop: topPadding,
        paddingBottom: 8,
        paddingHorizontal: 12,
        elevation: 3,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
      }}
      className="z-[100] relative overflow-hidden"
    >
      <StatusBar barStyle="light-content" backgroundColor={gradient.dark} translucent />

      {/* Dark-to-Light Linear Gradient Background seamlessly matching landing page */}
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

      <View className="flex-row items-center gap-2" style={{ minHeight: 42 }}>
        {/* Back Button */}
        {showBack && onBack && (
          <TouchableOpacity
            onPress={onBack}
            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center shrink-0"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Go Back"
          >
            <ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        )}

        {/* Center: Search Bar or Title */}
        {showSearch ? (
          <View
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              height: 42,
              paddingHorizontal: 12,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Search size={18} color="#07843D" style={{ marginRight: 8 }} />
            <TextInput
              style={{
                flex: 1,
                fontSize: 14,
                color: '#18352B',
                paddingVertical: 0,
                paddingHorizontal: 0,
              }}
              placeholder={searchPlaceholder}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={onSearchChange}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => onSearchChange?.('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ padding: 2 }}>
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <View className="flex-1 justify-center ml-1">
            <Text className="text-lg font-black text-white tracking-tight" numberOfLines={1}>
              {title || 'Mathira Organics'}
            </Text>
          </View>
        )}

        {/* Right Side: Shopping Cart (Dollar icon cleanly removed) */}
        <View className="flex-row items-center gap-2 shrink-0">
          {onOpenCart && (
            <TouchableOpacity
              className="w-9 h-9 items-center justify-center relative"
              onPress={onOpenCart}
              activeOpacity={0.8}
              accessibilityLabel="Shopping Cart"
            >
              <ShoppingCart size={22} color="#FFFFFF" strokeWidth={2.3} />
              {typeof cartCount === 'number' && cartCount > 0 && (
                <View 
                  className="absolute -top-0.5 -right-1 bg-red-500 rounded-full min-w-[19px] h-[19px] px-1 items-center justify-center border-2 border-white z-10"
                >
                  <Text className="text-white text-[10.5px] font-extrabold text-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {rightAction}
        </View>
      </View>
    </View>
  );
};
