import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, Package, Calendar, User } from 'lucide-react-native';

interface BottomNavBarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { key: 'HOME', label: 'Home', Icon: Home },
    { key: 'ALL_PRODUCTS', label: 'Catalog', Icon: Package },
    { key: 'MY_SUBSCRIPTIONS', label: 'Plans', Icon: Calendar },
    { key: 'PROFILE', label: 'Profile', Icon: User },
  ];

  return (
    <View style={styles.navBarContainer}>
      {navItems.map((item) => {
        const isActive = currentScreen === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.navItem, isActive && styles.activeNavItem]}
            onPress={() => onNavigate(item.key)}
            activeOpacity={0.7}
          >
            <item.Icon 
              size={22} 
              color={isActive ? '#15803D' : '#94A3B8'} 
              strokeWidth={isActive ? 2.5 : 2}
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
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  activeNavItem: {
    transform: [{ translateY: -2 }],
  },
  navLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  activeNavLabel: {
    color: '#15803D',
    fontWeight: 'bold',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#15803D',
  },
});
