import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, ShoppingBag, LayoutGrid, Calendar, User, Store } from 'lucide-react-native';

interface BottomNavBarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onSwitchToVendor?: () => void;
  isSwitchingToVendor?: boolean;
  isApprovedVendor?: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ 
  currentScreen, 
  onNavigate, 
  onSwitchToVendor,
  isSwitchingToVendor = false,
  isApprovedVendor = false,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 6);

  // Standard customer tabs:
  // 1. Home, 2. Order Again, 3. Categories, 4. Plans, 5. Profile
  // IF and ONLY IF this particular logged-in number is an approved vendor:
  // Show the Vendor menu item directly in the bottom navigation bar!
  // Any other number will NOT see this vendor menu.
  const navItems = [
    { key: 'HOME', label: 'Home', Icon: Home, isVendorAction: false },
    { key: 'ORDER_HISTORY', label: 'Order Again', Icon: ShoppingBag, isVendorAction: false },
    { key: 'ALL_PRODUCTS', label: 'Categories', Icon: LayoutGrid, isVendorAction: false },
    { key: 'MY_SUBSCRIPTIONS', label: 'Plans', Icon: Calendar, isVendorAction: false },
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
              <ActivityIndicator size="small" color="#047857" style={{ height: 22, width: 22 }} />
            ) : (
              <item.Icon 
                size={22} 
                color={item.isVendorAction ? '#047857' : isActive ? '#07843D' : '#718078'} 
                strokeWidth={item.isVendorAction || isActive ? 2.4 : 1.8}
              />
            )}
            <Text 
              className={`mt-0.5 tracking-tight ${
                item.isVendorAction 
                  ? 'text-[#047857] font-bold' 
                  : isActive 
                  ? 'text-[#07843D] font-bold' 
                  : 'text-[#718078] font-medium'
              }`}
              style={{ fontSize: isApprovedVendor ? 11 : 12, lineHeight: 15 }}
              numberOfLines={1}
            >
              {item.label}
            </Text>
            {item.isVendorAction && (
              <View className="w-1.5 h-1.5 rounded-full bg-[#047857] mt-0.5" />
            )}
            {!item.isVendorAction && isActive && (
              <View className="w-1.5 h-1.5 rounded-full bg-[#07843D] mt-0.5" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavBar;
