import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LayoutDashboard,
  Sprout,
  Plus,
  PackageCheck,
  CalendarDays,
  Wallet,
} from 'lucide-react-native';

interface VendorBottomNavBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAddProduct: () => void;
  onSwitchToCustomer?: () => void;
  pendingOrdersCount?: number;
  cropsCount?: number;
}

export const VendorBottomNavBar: React.FC<VendorBottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddProduct,
  pendingOrdersCount = 0,
  cropsCount = 0,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 6);

  return (
    <View 
      className="flex-row bg-white border-t border-slate-200 justify-around items-center px-1 pt-1.5 shadow-lg z-50"
      style={{ paddingBottom: bottomPadding, height: 60 + bottomPadding }}
    >
      {/* 1. Dashboard Tab */}
      <TouchableOpacity
        className={`flex-1 min-h-[46px] items-center justify-center py-0.5 relative ${
          currentTab === 'dashboard' ? '-translate-y-0.5' : ''
        }`}
        onPress={() => onSelectTab('dashboard')}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      >
        <LayoutDashboard
          size={20}
          color={currentTab === 'dashboard' ? '#047857' : '#94A3B8'}
          strokeWidth={currentTab === 'dashboard' ? 2.5 : 2}
        />
        <Text 
          className={`mt-0.5 font-semibold ${
            currentTab === 'dashboard' ? 'text-[#047857] font-bold' : 'text-slate-500'
          }`}
          style={{ fontSize: 10.5, lineHeight: 14 }}
          numberOfLines={1}
        >
          Dashboard
        </Text>
        {currentTab === 'dashboard' && (
          <View className="w-1.5 h-1.5 rounded-full bg-[#047857] mt-0.5" />
        )}
      </TouchableOpacity>

      {/* 2. My Crops Tab */}
      <TouchableOpacity
        className={`flex-1 min-h-[46px] items-center justify-center py-0.5 relative ${
          currentTab === 'crops' ? '-translate-y-0.5' : ''
        }`}
        onPress={() => onSelectTab('crops')}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      >
        <View className="relative">
          <Sprout
            size={20}
            color={currentTab === 'crops' ? '#047857' : '#94A3B8'}
            strokeWidth={currentTab === 'crops' ? 2.5 : 2}
          />
          {cropsCount > 0 && (
            <View className="absolute -top-1 -right-2.5 bg-[#047857] rounded-full px-1 py-0.2 min-w-[15px] items-center">
              <Text className="text-white font-bold" style={{ fontSize: 9.5 }}>
                {cropsCount}
              </Text>
            </View>
          )}
        </View>
        <Text 
          className={`mt-0.5 font-semibold ${
            currentTab === 'crops' ? 'text-[#047857] font-bold' : 'text-slate-500'
          }`}
          style={{ fontSize: 10.5, lineHeight: 14 }}
          numberOfLines={1}
        >
          Crops
        </Text>
        {currentTab === 'crops' && (
          <View className="w-1.5 h-1.5 rounded-full bg-[#047857] mt-0.5" />
        )}
      </TouchableOpacity>

      {/* 3. Center Elevated Add Crop Button */}
      <TouchableOpacity
        className="items-center justify-center -mt-3.5 px-1"
        onPress={onOpenAddProduct}
        activeOpacity={0.85}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View className="w-11 h-11 rounded-full bg-[#047857] items-center justify-center shadow-md border-2 border-white">
          <Plus size={22} color="#FFFFFF" strokeWidth={2.8} />
        </View>
        <Text 
          className="text-[#047857] font-bold mt-0.5"
          style={{ fontSize: 10.5, lineHeight: 14 }}
          numberOfLines={1}
        >
          Add
        </Text>
      </TouchableOpacity>

      {/* 4. Orders Dispatch Tab */}
      <TouchableOpacity
        className={`flex-1 min-h-[46px] items-center justify-center py-0.5 relative ${
          currentTab === 'orders' ? '-translate-y-0.5' : ''
        }`}
        onPress={() => onSelectTab('orders')}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      >
        <View className="relative">
          <PackageCheck
            size={20}
            color={currentTab === 'orders' ? '#047857' : '#94A3B8'}
            strokeWidth={currentTab === 'orders' ? 2.5 : 2}
          />
          {pendingOrdersCount > 0 && (
            <View className="absolute -top-1 -right-2.5 bg-rose-500 rounded-full px-1 py-0.2 min-w-[15px] items-center">
              <Text className="text-white font-bold" style={{ fontSize: 9.5 }}>
                {pendingOrdersCount}
              </Text>
            </View>
          )}
        </View>
        <Text 
          className={`mt-0.5 font-semibold ${
            currentTab === 'orders' ? 'text-[#047857] font-bold' : 'text-slate-500'
          }`}
          style={{ fontSize: 10.5, lineHeight: 14 }}
          numberOfLines={1}
        >
          Orders
        </Text>
        {currentTab === 'orders' && (
          <View className="w-1.5 h-1.5 rounded-full bg-[#047857] mt-0.5" />
        )}
      </TouchableOpacity>

      {/* 5. Harvest Tracker Tab */}
      <TouchableOpacity
        className={`flex-1 min-h-[46px] items-center justify-center py-0.5 relative ${
          currentTab === 'harvests' ? '-translate-y-0.5' : ''
        }`}
        onPress={() => onSelectTab('harvests')}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      >
        <CalendarDays
          size={20}
          color={currentTab === 'harvests' ? '#047857' : '#94A3B8'}
          strokeWidth={currentTab === 'harvests' ? 2.5 : 2}
        />
        <Text 
          className={`mt-0.5 font-semibold ${
            currentTab === 'harvests' ? 'text-[#047857] font-bold' : 'text-slate-500'
          }`}
          style={{ fontSize: 10.5, lineHeight: 14 }}
          numberOfLines={1}
        >
          Harvests
        </Text>
        {currentTab === 'harvests' && (
          <View className="w-1.5 h-1.5 rounded-full bg-[#047857] mt-0.5" />
        )}
      </TouchableOpacity>

      {/* 6. Payouts Tab */}
      <TouchableOpacity
        className={`flex-1 min-h-[46px] items-center justify-center py-0.5 relative ${
          currentTab === 'payouts' ? '-translate-y-0.5' : ''
        }`}
        onPress={() => onSelectTab('payouts')}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      >
        <Wallet
          size={20}
          color={currentTab === 'payouts' ? '#047857' : '#94A3B8'}
          strokeWidth={currentTab === 'payouts' ? 2.5 : 2}
        />
        <Text 
          className={`mt-0.5 font-semibold ${
            currentTab === 'payouts' ? 'text-[#047857] font-bold' : 'text-slate-500'
          }`}
          style={{ fontSize: 10.5, lineHeight: 14 }}
          numberOfLines={1}
        >
          Payouts
        </Text>
        {currentTab === 'payouts' && (
          <View className="w-1.5 h-1.5 rounded-full bg-[#047857] mt-0.5" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default VendorBottomNavBar;
