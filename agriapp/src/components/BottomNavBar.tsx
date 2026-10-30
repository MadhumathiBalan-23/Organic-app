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
              <ActivityIndicator size="small" color="#07843D" style={{ height: 22, width: 22 }} />
            ) : (
              <item.Icon 
                size={22} 
                color={isActive ? '#07843D' : '#718078'} 
                strokeWidth={isActive ? 2.4 : 1.8}
              />
            )}
            <Text 
              className={`mt-0.5 tracking-tight ${
                isActive 
                  ? 'text-[#07843D] font-bold' 
                  : 'text-[#718078] font-medium'
              }`}
              style={{ fontSize: isApprovedVendor ? 11 : 12, lineHeight: 15 }}
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
