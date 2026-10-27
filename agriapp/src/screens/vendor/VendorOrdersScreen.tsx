import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import {
  PackageCheck,
  CircleCheck,
  X,
  MapPin,
  Clock,
  Lock,
} from 'lucide-react-native';
import { VC } from './types';

interface VendorOrdersScreenProps {
  deliveriesList: any[];
  onOpenAcceptModal: (order: any) => void;
  onOpenRejectModal: (order: any) => void;
  onOpenOtpModal: (order: any) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: string) => void;
}

export const VendorOrdersScreen: React.FC<VendorOrdersScreenProps> = ({
  deliveriesList,
  onOpenAcceptModal,
  onOpenRejectModal,
  onOpenOtpModal,
  onUpdateOrderStatus,
}) => {
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    'All' | 'Pending' | 'Shipped' | 'Delivered'
  >('All');

  const filteredOrders = deliveriesList.filter((del) => {
    if (orderStatusFilter === 'All') return true;
    if (orderStatusFilter === 'Pending')
      return del.status === 'Assigned' || del.status === 'Pending';
    return del.status === orderStatusFilter;
  });

  return (
    <ScrollView
      contentContainerClassName="p-3.5 pb-10"
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-2.5">
        <Text className="text-base font-bold text-slate-900">
          Fulfillment & Dispatch Desk
        </Text>
        <Text className="text-xs text-slate-500 mt-0.5">
          Manage outgoing packages and live customer deliveries
        </Text>
      </View>

      {/* Orders Status Filter Tabs */}
      <View className="flex-row gap-2 mb-3">
        {(['All', 'Pending', 'Shipped', 'Delivered'] as const).map((st) => (
          <TouchableOpacity
            key={st}
            className={`px-3 py-1.5 rounded-xl border ${
              orderStatusFilter === st
                ? 'bg-emerald-700 border-emerald-700'
                : 'bg-white border-slate-300'
            }`}
            onPress={() => setOrderStatusFilter(st)}
          >
            <Text
              className={`text-xs ${
                orderStatusFilter === st
                  ? 'text-white font-bold'
                  : 'text-slate-600 font-semibold'
              }`}
            >
              {st}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="gap-3">
        {filteredOrders.length === 0 ? (
          <View className="bg-white rounded-2xl p-7 items-center justify-center border border-slate-200 gap-2.5">
            <PackageCheck size={36} color="#94A3B8" />
            <Text className="text-xs text-slate-500 text-center">
              No orders match the selected status
            </Text>
          </View>
        ) : (
          filteredOrders.map((del) => {
            const isDelivered = del.status === 'Delivered';
            const isShipped = del.status === 'Shipped';

            return (
              <View
                key={del.id}
                className="bg-white rounded-xl p-3.5 border border-slate-200"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900">
                      {del.customerName}
                    </Text>
                    <Text className="text-2xs text-slate-400 mt-0.5">
                      Order ID: #{(del.id || '').toUpperCase()}
                    </Text>
                  </View>

                  <View
                    className={`px-2 py-0.5 rounded-full ${
                      isDelivered
                        ? 'bg-emerald-100'
                        : isShipped
                        ? 'bg-sky-100'
                        : 'bg-amber-100'
                    }`}
                  >
                    <Text
                      className={`text-2xs font-bold ${
                        isDelivered
                          ? 'text-emerald-700'
                          : isShipped
                          ? 'text-sky-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {del.status}
                    </Text>
                  </View>
                </View>

                <View className="bg-slate-50 rounded-lg p-2.5 gap-1 my-2">
                  <Text className="text-sm font-semibold text-slate-700">
                    {del.products}
                  </Text>
                  <View className="flex-row items-center gap-1.5 mt-0.5">
                    <MapPin size={12} color={VC.textMuted} />
                    <Text
                      className="text-xs text-slate-500 flex-1"
                      numberOfLines={1}
                    >
                      {del.address}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5 mt-0.5">
                    <Clock size={12} color={VC.textMuted} />
                    <Text className="text-xs text-slate-500">
                      Slot: {del.deliveryTime}
                    </Text>
                  </View>
                </View>

                {/* Order Transition Actions */}
                <View className="mt-2">
                  {del.status === 'Pending' || del.status === 'Assigned' ? (
                    <View className="flex-row gap-2 w-full">
                      <TouchableOpacity
                        className="flex-[1.6] bg-emerald-900 py-2.5 rounded-lg items-center justify-center flex-row gap-1.5"
                        onPress={() => onOpenAcceptModal(del)}
                        activeOpacity={0.8}
                      >
                        <CircleCheck size={14} color="#FFFFFF" />
                        <Text className="text-white text-xs font-bold">
                          Accept Order
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 bg-rose-100 border border-rose-300 py-2.5 rounded-lg items-center justify-center flex-row gap-1.5"
                        onPress={() => onOpenRejectModal(del)}
                        activeOpacity={0.8}
                      >
                        <X size={14} color="#DC2626" />
                        <Text className="text-rose-600 text-xs font-bold">
                          Reject
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : del.status === 'Accepted' || del.status === 'Preparing' ? (
                    <TouchableOpacity
                      className="bg-sky-600 py-2.5 rounded-lg items-center justify-center flex-row gap-1.5"
                      onPress={() =>
                        onUpdateOrderStatus(del.id, 'Shipped')
                      }
                      activeOpacity={0.8}
                    >
                      <PackageCheck size={14} color="#FFFFFF" />
                      <Text className="text-white text-xs font-bold">
                        Dispatch (Out for Delivery)
                      </Text>
                    </TouchableOpacity>
                  ) : del.status === 'Shipped' ? (
                    <TouchableOpacity
                      className="bg-emerald-900 py-3 rounded-lg items-center justify-center flex-row gap-2"
                      onPress={() => onOpenOtpModal(del)}
                      activeOpacity={0.8}
                    >
                      <Lock size={15} color="#FBBF24" />
                      <Text className="text-white text-xs font-extrabold">
                        🔐 Verify OTP & Complete Delivery
                      </Text>
                    </TouchableOpacity>
                  ) : del.status === 'Rejected' ? (
                    <View className="py-1">
                      <Text className="text-xs text-rose-600 font-semibold">
                        ✕ Order Rejected:{' '}
                        {del.rejectionReason || 'Vendor declined'}
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-1">
                      <CircleCheck size={14} color={VC.success} />
                      <Text className="text-sm text-emerald-700 font-bold">
                        Delivered & OTP Verified
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};
