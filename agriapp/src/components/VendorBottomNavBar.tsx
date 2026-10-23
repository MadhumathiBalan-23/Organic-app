import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  return (
    <View style={styles.navBarContainer}>
      {/* 1. Dashboard Tab */}
      <TouchableOpacity
        style={[styles.navItem, currentTab === 'dashboard' && styles.activeNavItem]}
        onPress={() => onSelectTab('dashboard')}
        activeOpacity={0.7}
      >
        <LayoutDashboard
          size={19}
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
      >
        <View style={styles.iconWithBadge}>
          <Sprout
            size={19}
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
      >
        <View style={styles.addCenterBtn}>
          <Plus size={22} color="#FFFFFF" strokeWidth={3} />
        </View>
        <Text style={styles.addCenterBtnLabel}>Add Crop</Text>
      </TouchableOpacity>

      {/* 4. Orders Dispatch Tab */}
      <TouchableOpacity
        style={[styles.navItem, currentTab === 'orders' && styles.activeNavItem]}
        onPress={() => onSelectTab('orders')}
        activeOpacity={0.7}
      >
        <View style={styles.iconWithBadge}>
          <PackageCheck
            size={19}
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
      >
        <View style={styles.storeIconCircle}>
          <Store size={18} color="#047857" strokeWidth={2.5} />
        </View>
        <Text style={styles.storeNavLabel}>Store</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBarContainer: {
    flexDirection: 'row',
    height: 62,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 100,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
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
    color: '#047857',
    fontWeight: 'bold',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#047857',
  },
  iconWithBadge: {
    position: 'relative',
  },
  miniBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#047857',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 14,
    alignItems: 'center',
  },
  miniBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  addCenterBtnWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    paddingHorizontal: 4,
  },
  addCenterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 9,
    color: '#047857',
    fontWeight: 'bold',
    marginTop: 2,
  },
  storeNavItem: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingVertical: 4,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  storeIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeNavLabel: {
    fontSize: 10,
    color: '#047857',
    fontWeight: 'bold',
    marginTop: 2,
  },
});
