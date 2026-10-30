import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Package,
  Calendar,
  CreditCard,
  ShieldCheck,
  RotateCw,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react-native';

export interface OrderHistoryRecord {
  id: string;
  rawId?: string;
  date: string;
  products: string;
  imageUrl?: string;
  amount: number;
  paymentStatus: string;
  deliveryStatus: string;
  deliveryOtp?: string;
  vendorName?: string;
  items?: any[];
}

export interface OrderHistoryScreenProps {
  orders: OrderHistoryRecord[];
  onBrowseProducts: () => void;
  onReorder?: (order: OrderHistoryRecord) => void;
}

export const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({
  orders,
  onBrowseProducts,
  onReorder,
}) => {
  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'DELIVERED') {
      return (
        <View className="flex-row items-center gap-1 bg-[#E8F5EC] border border-[#C6E9D1] px-2.5 py-0.5 rounded-full">
          <CheckCircle2 size={11} color="#07843D" strokeWidth={2.5} />
          <Text className="text-[#07843D] font-bold" style={{ fontSize: 11 }}>
            Delivered
          </Text>
        </View>
      );
    }
    if (s.includes('PENDING') || s.includes('CONFIRM') || s.includes('PROCESS')) {
      return (
        <View className="flex-row items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
          <Clock size={11} color="#B45309" strokeWidth={2.5} />
          <Text className="text-amber-800 font-bold" style={{ fontSize: 11 }}>
            In Transit
          </Text>
        </View>
      );
    }
    if (s.includes('CANCEL')) {
      return (
        <View className="bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
          <Text className="text-red-700 font-bold" style={{ fontSize: 11 }}>
            Cancelled
          </Text>
        </View>
      );
    }
    return (
      <View className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
        <Text className="text-slate-700 font-bold" style={{ fontSize: 11 }}>
          {status}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      contentContainerClassName="p-3.5 pb-28"
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-[#F4F7F4]"
    >
      {orders.length === 0 ? (
        <View className="items-center justify-center py-16 px-4">
          <View className="w-20 h-20 rounded-full bg-[#E8F5EC] items-center justify-center mb-3.5 border border-[#C6E9D1]">
            <ShoppingBag size={34} color="#07843D" />
          </View>
          <Text className="font-extrabold text-slate-800 text-center" style={{ fontSize: 16 }}>
            No Orders Yet
          </Text>
          <Text className="text-slate-500 text-center mt-1 max-w-[260px]" style={{ fontSize: 12, lineHeight: 17 }}>
            Fresh harvests are waiting! Browse 100% certified organic fruits, vegetables, and milk direct from local farms.
          </Text>
          <TouchableOpacity
            className="mt-5 bg-[#07843D] px-6 py-2.5 rounded-xl shadow-xs active:bg-[#056830]"
            onPress={onBrowseProducts}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold" style={{ fontSize: 13 }}>
              Explore Farm Store
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        orders.map((order) => {
          const isPending =
            order.deliveryStatus !== 'DELIVERED' && order.deliveryStatus !== 'CANCELLED';

          return (
            <View
              key={order.id}
              className="bg-white rounded-2xl p-3.5 mb-3 border border-[#DFE9E1] shadow-xs"
            >
              {/* 1. Top Bar: Order ID + Status Badge */}
              <View className="flex-row justify-between items-center pb-2.5 border-b border-slate-100">
                <View className="flex-row items-center gap-1.5">
                  <Package size={13} color="#07843D" />
                  <Text className="font-bold text-slate-800" style={{ fontSize: 12 }}>
                    {order.id}
                  </Text>
                </View>
                {getStatusBadge(order.deliveryStatus)}
              </View>

              {/* 2. Middle Content: Image on Left + Product Info on Right */}
              <View className="flex-row items-center pt-3 pb-1">
                {/* Product Thumbnail Image */}
                <View className="w-[66px] h-[66px] rounded-xl overflow-hidden bg-[#F6F8F6] border border-[#E2ECE4] items-center justify-center shrink-0">
                  <Image
                    source={{
                      uri:
                        order.imageUrl ||
                        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300',
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>

                {/* Details Column */}
                <View className="flex-1 ml-3 justify-between">
                  <Text
                    className="font-bold text-slate-900 leading-snug"
                    style={{ fontSize: 13, lineHeight: 18 }}
                    numberOfLines={2}
                  >
                    {order.products}
                  </Text>

                  <View className="flex-row items-center gap-2 mt-1">
                    <View className="flex-row items-center gap-1">
                      <Calendar size={11} color="#64748B" />
                      <Text className="text-slate-500 font-medium" style={{ fontSize: 11 }}>
                        {order.date}
                      </Text>
                    </View>
                    <Text className="text-slate-300">·</Text>
                    <View className="flex-row items-center gap-1">
                      <CreditCard size={11} color="#64748B" />
                      <Text className="text-slate-500 font-medium" style={{ fontSize: 11 }}>
                        {order.paymentStatus}
                      </Text>
                    </View>
                  </View>

                  {order.vendorName ? (
                    <View className="flex-row items-center gap-1 mt-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 self-start">
                      <Text className="text-3xs font-bold text-emerald-800">
                        🌱 Farm: {order.vendorName}
                      </Text>
                    </View>
                  ) : null}

                  <Text className="font-extrabold text-slate-900 mt-1" style={{ fontSize: 14 }}>
                    ₹{order.amount}
                  </Text>
                </View>
              </View>

              {/* 3. Delivery OTP verification banner (when in transit) */}
              {isPending && (
                <View className="mt-2.5 p-2.5 rounded-xl bg-[#F0FDF4] border border-emerald-200 flex-row items-center justify-between">
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center gap-1">
                      <ShieldCheck size={13} color="#047857" />
                      <Text className="font-bold text-emerald-900" style={{ fontSize: 11 }}>
                        Delivery OTP
                      </Text>
                    </View>
                    <Text className="text-emerald-700 mt-0.5" style={{ fontSize: 10 }}>
                      Share this code upon delivery arrival
                    </Text>
                  </View>
                  <View className="bg-white px-2.5 py-1 rounded-lg border border-emerald-400 shadow-xs">
                    <Text className="font-black text-emerald-800 tracking-widest" style={{ fontSize: 14 }}>
                      {order.deliveryOtp || '4821'}
                    </Text>
                  </View>
                </View>
              )}

              {/* 4. Bottom Row: Certified badge & Order Again Button */}
              <View className="flex-row items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100">
                <View className="flex-row items-center gap-1">
                  <Sparkles size={11} color="#059669" />
                  <Text className="text-slate-400 font-medium" style={{ fontSize: 11 }}>
                    100% Certified Organic
                  </Text>
                </View>

                <TouchableOpacity
                  className="flex-row items-center gap-1.5 bg-[#07843D] px-3.5 py-1.5 rounded-xl shadow-xs active:bg-[#056830]"
                  onPress={() => (onReorder ? onReorder(order) : onBrowseProducts())}
                  activeOpacity={0.8}
                  accessibilityLabel="Order Again"
                >
                  <RotateCw size={11} color="#FFFFFF" strokeWidth={2.5} />
                  <Text className="text-white font-bold" style={{ fontSize: 12 }}>
                    Order Again
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

export default OrderHistoryScreen;

