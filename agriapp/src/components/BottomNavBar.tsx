import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, ShoppingBag, LayoutGrid, Calendar, User } from 'lucide-react-native';

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
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 6);

  // Exactly five navigation items in this order:
  // 1. Home, 2. Order Again, 3. Categories, 4. Plans, 5. Profile
  const navItems = [
    { key: 'HOME', label: 'Home', Icon: Home },
    { key: 'ORDER_HISTORY', label: 'Order Again', Icon: ShoppingBag },
    { key: 'ALL_PRODUCTS', label: 'Categories', Icon: LayoutGrid },
    { key: 'MY_SUBSCRIPTIONS', label: 'Plans', Icon: Calendar },
    { key: 'PROFILE', label: 'Profile', Icon: User },
  ];

  return (
    <View style={[styles.navBarContainer, { paddingBottom: bottomPadding, height: 58 + bottomPadding }]}>
      {navItems.map((item) => {
        const isActive = currentScreen === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => onNavigate(item.key)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={item.label}
          >
            <item.Icon 
              size={22} 
              color={isActive ? '#07843D' : '#718078'} 
              strokeWidth={isActive ? 2.4 : 1.8}
            />
            <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
              {item.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DFE9E1',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative',
  },
  navLabel: {
    fontSize: 11,
    color: '#718078',
    marginTop: 3,
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#07843D',
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#07843D',
    marginTop: 2,
  },
});

export default BottomNavBar;
