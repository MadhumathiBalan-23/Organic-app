import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, LayoutGrid, User, Store } from 'lucide-react-native';

interface BottomNavBarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onSwitchToVendor?: () => void;
  isSwitchingToVendor?: boolean;
  isApprovedVendor?: boolean;
  themeColor?: string;
}

// Darken/lighten a hex color for active/inactive states
const adjustColor = (hex: string, amount: number): string => {
  const c = hex.replace('#', '');
  const num = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ 
  currentScreen, 
  onNavigate, 
  onSwitchToVendor,
  isSwitchingToVendor = false,
  isApprovedVendor = false,
  themeColor = '#07843D',
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 6);
  const rawTheme = themeColor || '#07843D';
  const activeColor = rawTheme.includes('|')
    ? (rawTheme.split('|')[1]?.trim() || rawTheme.split('|')[0]?.trim() || '#07843D')
    : rawTheme;
  const inactiveColor = '#718078';

  // Clean customer tabs: Home, Categories, Vendor (if approved), Profile
  const navItems = [
    { key: 'HOME', label: 'Home', Icon: Home, isVendorAction: false },
    { key: 'ALL_PRODUCTS', label: 'Categories', Icon: LayoutGrid, isVendorAction: false },
    ...(isApprovedVendor
      ? [{ key: 'VENDOR', label: 'Vendor', Icon: Store, isVendorAction: true }]
      : []),
    { key: 'PROFILE', label: 'Profile', Icon: User, isVendorAction: false },
  ];

  return (
    <View 
      className="flex-row bg-white border-t border-[#DFE9E1] justify-around items-center px-1 pt-1.5 shadow-md"
      style={{ paddingBottom: bottomPadding, height: 58 + bottomPadding }}
    >
      {navItems.map((item) => {
        const isActive = currentScreen === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            className="flex-1 items-center justify-center py-0.5 relative"
            onPress={() => {
              if (item.isVendorAction) {
                if (onSwitchToVendor) onSwitchToVendor();
              } else {
                onNavigate(item.key);
              }
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={item.label}
          >
            {item.isVendorAction && isSwitchingToVendor ? (
              <ActivityIndicator size="small" color={activeColor} style={{ height: 22, width: 22 }} />
            ) : (
              <item.Icon 
                size={22} 
                color={isActive ? activeColor : inactiveColor} 
                strokeWidth={isActive ? 2.4 : 1.8}
              />
            )}
            <Text 
              className={`mt-0.5 tracking-tight ${
                isActive 
                  ? 'font-bold' 
                  : 'font-medium'
              }`}
              style={{ 
                fontSize: isApprovedVendor ? 11 : 12, 
                lineHeight: 15,
                color: isActive ? activeColor : inactiveColor,
              }}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavBar;
