import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, Sprout, Plus, PackageCheck, Store } from 'lucide-react-native';

interface VendorBottomNavBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAddProduct: () => void;
  onSwitchToCustomer: () => void;
  pendingOrdersCount?: number;
  cropsCount?: number;
}

export const VendorBottomNavBar: React.FC<VendorBottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddProduct,
  onSwitchToCustomer,
  pendingOrdersCount = 0,
  cropsCount = 0,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.navBarContainer, { paddingBottom: bottomPadding, height: 62 + bottomPadding }]}>
      {/* 1. Dashboard Tab */}
      <TouchableOpacity
        style={[styles.navItem, currentTab === 'dashboard' && styles.activeNavItem]}
        onPress={() => onSelectTab('dashboard')}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <LayoutDashboard
          size={21}
          color={currentTab === 'dashboard' ? '#047857' : '#94A3B8'}
          strokeWidth={currentTab === 'dashboard' ? 2.5 : 2}
        />
        <Text style={[styles.navLabel, currentTab === 'dashboard' && styles.activeNavLabel]}>
          Dashboard
        </Text>
        {currentTab === 'dashboard' && <View style={styles.activeDot} />}
      </TouchableOpacity>

      {/* 2. My Crops / Products Tab */}
      <TouchableOpacity
        style={[styles.navItem, currentTab === 'crops' && styles.activeNavItem]}
        onPress={() => onSelectTab('crops')}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.iconWithBadge}>
          <Sprout
            size={21}
            color={currentTab === 'crops' ? '#047857' : '#94A3B8'}
            strokeWidth={currentTab === 'crops' ? 2.5 : 2}
          />
          {cropsCount > 0 && (
            <View style={styles.miniBadge}>
              <Text style={styles.miniBadgeText}>{cropsCount}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.navLabel, currentTab === 'crops' && styles.activeNavLabel]}>
          My Crops
        </Text>
        {currentTab === 'crops' && <View style={styles.activeDot} />}
      </TouchableOpacity>

      {/* 3. Center Elevated + Add Product Button */}
      <TouchableOpacity
        style={styles.addCenterBtnWrapper}
        onPress={onOpenAddProduct}
        activeOpacity={0.85}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <View style={styles.addCenterBtn}>
          <Plus size={24} color="#FFFFFF" strokeWidth={3} />
        </View>
        <Text style={styles.addCenterBtnLabel}>Add Crop</Text>
      </TouchableOpacity>

      {/* 4. Orders Dispatch Tab */}
      <TouchableOpacity
        style={[styles.navItem, currentTab === 'orders' && styles.activeNavItem]}
        onPress={() => onSelectTab('orders')}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.iconWithBadge}>
          <PackageCheck
            size={21}
            color={currentTab === 'orders' ? '#047857' : '#94A3B8'}
            strokeWidth={currentTab === 'orders' ? 2.5 : 2}
          />
          {pendingOrdersCount > 0 && (
            <View style={[styles.miniBadge, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.miniBadgeText}>{pendingOrdersCount}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.navLabel, currentTab === 'orders' && styles.activeNavLabel]}>
          Orders
        </Text>
        {currentTab === 'orders' && <View style={styles.activeDot} />}
      </TouchableOpacity>

      {/* 5. Switch to Customer Store */}
      <TouchableOpacity
        style={[styles.navItem, styles.storeNavItem]}
        onPress={onSwitchToCustomer}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.storeIconCircle}>
          <Store size={19} color="#047857" strokeWidth={2.5} />
        </View>
        <Text style={styles.storeNavLabel}>Store</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 12,
    zIndex: 100,
  },
  navItem: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative',
  },
  activeNavItem: {
    transform: [{ translateY: -2 }],
  },
  navLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '600',
  },
  activeNavLabel: {
    color: '#047857',
    fontWeight: '700',
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#047857',
  },
  iconWithBadge: {
    position: 'relative',
  },
  miniBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#047857',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  miniBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  addCenterBtnWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    paddingHorizontal: 6,
  },
  addCenterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  addCenterBtnLabel: {
    fontSize: 10,
    color: '#047857',
    fontWeight: 'bold',
    marginTop: 3,
  },
  storeNavItem: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    paddingVertical: 4,
    marginHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#DCFCE7',
  },
  storeIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeNavLabel: {
    fontSize: 11,
    color: '#047857',
    fontWeight: 'bold',
    marginTop: 2,
  },
});
