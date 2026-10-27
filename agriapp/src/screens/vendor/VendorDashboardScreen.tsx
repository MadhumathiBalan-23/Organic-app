import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import {
  Sprout,
  PackageCheck,
  TriangleAlert,
  TrendingUp,
  Settings,
  ChevronRight,
  Clock,
  CircleDot,
} from 'lucide-react-native';
import { Product } from '../../constants/mockData';
import { VendorProfile, VendorTabKey, VendorHarvestItem } from './types';

interface VendorDashboardScreenProps {
  userPhone?: string;
  vendorProfile: VendorProfile | null;
  productList: Product[];
  deliveriesList: any[];
  harvests: VendorHarvestItem[];
  onNavigateTab: (tab: VendorTabKey) => void;
  onOpenAddCrop: () => void;
  onOpenDeliverySettings: () => void;
}

export const VendorDashboardScreen: React.FC<VendorDashboardScreenProps> = ({
  vendorProfile,
  productList,
  deliveriesList,
  onNavigateTab,
  onOpenDeliverySettings,
}) => {
  const pendingCount = deliveriesList.filter(
    (d) => d.status !== 'Delivered'
  ).length;
  const lowStockCount = productList.filter((p) => p.stock <= p.minStock).length;

  const deliveredOrders = deliveriesList.filter((d) => d.status === 'Delivered');
  const totalRevenue =
    deliveredOrders.reduce((sum, d) => sum + (d.totalAmount || 350), 0) || 32400;

  return (
    <ScrollView
      contentContainerClassName="p-4 pb-12"
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-[#F8FAFC]"
    >
      {/* ── 1. Clean Summary Status Bar ── */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-base font-bold text-slate-900">
            {vendorProfile?.farmName || 'Vendor Dashboard'}
          </Text>
          <Text className="text-slate-500 mt-0.5" style={{ fontSize: 11.5 }}>
            Live morning harvests & subscriber fulfillment
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <CircleDot size={10} color="#047857" />
          <Text className="text-emerald-800 font-bold" style={{ fontSize: 10.5 }}>
            LIVE
          </Text>
        </View>
      </View>

      {/* ── 2. Modern 2x2 Metric Cards ── */}
      <View className="flex-row flex-wrap gap-2.5 mb-4">
        {/* Active Crops */}
        <TouchableOpacity
          className="flex-1 min-w-[47%] bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs"
          onPress={() => onNavigateTab('crops')}
          activeOpacity={0.75}
        >
          <View className="flex-row justify-between items-center mb-1.5">
            <Text className="text-slate-400 font-bold tracking-wider" style={{ fontSize: 10 }}>
              ACTIVE CROPS
            </Text>
            <View className="w-7 h-7 rounded-lg bg-emerald-50 items-center justify-center">
              <Sprout size={15} color="#047857" />
            </View>
          </View>
          <Text className="text-2xl font-bold text-slate-900 mb-0.5">
            {productList.length}
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-emerald-700 font-semibold" style={{ fontSize: 11 }}>
              Catalog active
            </Text>
            <ChevronRight size={11} color="#047857" />
          </View>
        </TouchableOpacity>

        {/* Pending Orders */}
        <TouchableOpacity
          className="flex-1 min-w-[47%] bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs"
          onPress={() => onNavigateTab('orders')}
          activeOpacity={0.75}
        >
          <View className="flex-row justify-between items-center mb-1.5">
            <Text className="text-slate-400 font-bold tracking-wider" style={{ fontSize: 10 }}>
              DISPATCH QUEUE
            </Text>
            <View className="w-7 h-7 rounded-lg bg-emerald-50 items-center justify-center">
              <PackageCheck size={15} color="#047857" />
            </View>
          </View>
          <Text className="text-2xl font-bold text-slate-900 mb-0.5">
            {pendingCount}
          </Text>
          <View className="flex-row items-center gap-1">
            <Text
              className={pendingCount > 0 ? 'text-amber-600 font-semibold' : 'text-slate-500 font-medium'}
              style={{ fontSize: 11 }}
            >
              {pendingCount > 0 ? 'Needs dispatch' : 'All clear'}
            </Text>
            <ChevronRight size={11} color={pendingCount > 0 ? '#D97706' : '#94A3B8'} />
          </View>
        </TouchableOpacity>

        {/* Low Stock Warning */}
        <TouchableOpacity
          className="flex-1 min-w-[47%] bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs"
          onPress={() => onNavigateTab('crops')}
          activeOpacity={0.75}
        >
          <View className="flex-row justify-between items-center mb-1.5">
            <Text className="text-slate-400 font-bold tracking-wider" style={{ fontSize: 10 }}>
              STOCK STATUS
            </Text>
            <View className={`w-7 h-7 rounded-lg ${lowStockCount > 0 ? 'bg-amber-50' : 'bg-slate-50'} items-center justify-center`}>
              <TriangleAlert size={15} color={lowStockCount > 0 ? '#D97706' : '#94A3B8'} />
            </View>
          </View>
          <Text className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'} mb-0.5`}>
            {lowStockCount}
          </Text>
          <Text className="text-slate-500" style={{ fontSize: 11 }}>
            {lowStockCount > 0 ? 'Crops low on stock' : 'Stock healthy'}
          </Text>
        </TouchableOpacity>

        {/* Revenue */}
        <TouchableOpacity
          className="flex-1 min-w-[47%] bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs"
          onPress={() => onNavigateTab('payouts')}
          activeOpacity={0.75}
        >
          <View className="flex-row justify-between items-center mb-1.5">
            <Text className="text-slate-400 font-bold tracking-wider" style={{ fontSize: 10 }}>
              TOTAL SALES
            </Text>
            <View className="w-7 h-7 rounded-lg bg-emerald-50 items-center justify-center">
              <TrendingUp size={15} color="#047857" />
            </View>
          </View>
          <Text className="text-2xl font-bold text-slate-900 mb-0.5">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-emerald-700 font-semibold" style={{ fontSize: 11 }}>
              View payouts
            </Text>
            <ChevronRight size={11} color="#047857" />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── 3. Delivery Settings Action Card ── */}
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 border border-slate-200/80 mb-4 shadow-xs flex-row items-center justify-between"
        onPress={onOpenDeliverySettings}
        activeOpacity={0.75}
      >
        <View className="flex-row items-center gap-3 flex-1 mr-3">
          <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center border border-emerald-100">
            <Settings size={18} color="#047857" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-slate-900">
              Delivery Radius & Fees
            </Text>
            <Text className="text-slate-500 mt-0.5" style={{ fontSize: 11 }}>
              Configure max kilometers and morning delivery charges
            </Text>
          </View>
        </View>
        <View className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Text className="text-emerald-800 font-bold" style={{ fontSize: 11 }}>
            Configure
          </Text>
        </View>
      </TouchableOpacity>

      {/* ── 4. Live Orders Desk (Recent Orders) ── */}
      <View className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <View className="flex-row justify-between items-center mb-3 pb-2.5 border-b border-slate-100">
          <View className="flex-row items-center gap-2">
            <PackageCheck size={18} color="#047857" />
            <Text className="text-sm font-bold text-slate-900">
              Live Orders Desk
            </Text>
            {deliveriesList.length > 0 && (
              <View className="bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Text className="text-emerald-800 font-bold" style={{ fontSize: 10 }}>
                  {deliveriesList.length}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => onNavigateTab('orders')}
            activeOpacity={0.7}
            className="flex-row items-center gap-0.5"
          >
            <Text className="text-emerald-700 font-bold" style={{ fontSize: 11.5 }}>
              View All
            </Text>
            <ChevronRight size={13} color="#047857" />
          </TouchableOpacity>
        </View>

        {deliveriesList.length === 0 ? (
          <View className="items-center py-6">
            <Clock size={28} color="#CBD5E1" />
            <Text className="text-slate-500 font-medium mt-2" style={{ fontSize: 12 }}>
              No pending orders today
            </Text>
            <Text className="text-slate-400 mt-0.5" style={{ fontSize: 11 }}>
              New morning delivery requests will appear here live
            </Text>
          </View>
        ) : (
          deliveriesList.slice(0, 4).map((del, idx) => {
            const isLast = idx === Math.min(deliveriesList.length - 1, 3);
            const isDelivered = del.status === 'Delivered';
            const isAccepted = del.status === 'Accepted';

            return (
              <TouchableOpacity
                key={del.id}
                className={`flex-row items-center justify-between py-2.5 ${
                  !isLast ? 'border-b border-slate-100' : ''
                }`}
                onPress={() => onNavigateTab('orders')}
                activeOpacity={0.7}
              >
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="font-bold text-slate-900" style={{ fontSize: 12.5 }}>
                      #{String(del.id).slice(-6).toUpperCase()}
                    </Text>
                    <Text className="text-slate-400" style={{ fontSize: 11 }}>·</Text>
                    <Text className="text-slate-700 font-medium" style={{ fontSize: 12 }} numberOfLines={1}>
                      {del.customerName || 'Subscriber'}
                    </Text>
                  </View>
                  <Text className="text-slate-400 mt-0.5" style={{ fontSize: 11 }}>
                    {del.itemsCount || 1} items · ₹{del.totalAmount || 350}
                  </Text>
                </View>

                <View
                  className={`px-2.5 py-1 rounded-full border ${
                    isDelivered
                      ? 'bg-slate-50 border-slate-200'
                      : isAccepted
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      isDelivered
                        ? 'text-slate-600'
                        : isAccepted
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                    style={{ fontSize: 10 }}
                  >
                    {del.status || 'Pending'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

export default VendorDashboardScreen;
