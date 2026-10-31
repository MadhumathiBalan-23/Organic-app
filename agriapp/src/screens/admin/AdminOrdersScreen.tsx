import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  Search,
  X,
  Package,
  ShoppingCart,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  RefreshCw,
  ChevronRight,
  Check,
  AlertCircle,
  Banknote,
  ArrowUpDown,
  Filter,
} from 'lucide-react-native';
import { API_ENDPOINTS } from '../../services';
import { CommonModal } from '../../components/CommonModal';
import { C, Chip, SectionHeader } from './types';

export interface OrderItemDetail {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  unit?: string;
}

export interface AdminOrderRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  itemsSummary: string;
  itemsList: OrderItemDetail[];
  total: number;
  deliveryFee: number;
  status: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
  paymentStatus: string;
  orderType: string;
  deliveryOtp?: string;
  date: string;
  time: string;
  rawDate: string;
}

const normalizeStatus = (statusStr: string): AdminOrderRecord['status'] => {
  const s = String(statusStr || '').toUpperCase();
  if (s === 'DELIVERED') return 'Delivered';
  if (s === 'PROCESSING' || s === 'IN_PROGRESS' || s === 'CONFIRMED') return 'Processing';
  if (s === 'CANCELLED' || s === 'REJECTED') return 'Cancelled';
  return 'Pending';
};

const getStatusBadgeConfig = (status: AdminOrderRecord['status']) => {
  switch (status) {
    case 'Delivered':
      return {
        bg: '#DCFCE7',
        border: '#86EFAC',
        text: '#15803D',
        dot: '#22C55E',
        label: 'Delivered',
        Icon: CheckCircle2,
      };
    case 'Processing':
      return {
        bg: '#DBEAFE',
        border: '#93C5FD',
        text: '#1D4ED8',
        dot: '#3B82F6',
        label: 'Processing',
        Icon: Truck,
      };
    case 'Cancelled':
      return {
        bg: '#FEE2E2',
        border: '#FCA5A5',
        text: '#B91C1C',
        dot: '#EF4444',
        label: 'Cancelled',
        Icon: XCircle,
      };
    case 'Pending':
    default:
      return {
        bg: '#FEF3C7',
        border: '#FCD34D',
        text: '#B45309',
        dot: '#F59E0B',
        label: 'Pending',
        Icon: Clock,
      };
  }
};

export const AdminOrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [selected, setSelected] = useState<AdminOrderRecord | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const loadOrders = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.orders);
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      if (rawList.length >= 0) {
        const parsedOrders: AdminOrderRecord[] = rawList.map((o: any) => {
          const rawCreated = o.createdAt || new Date().toISOString();
          const parsedDate = new Date(rawCreated);
          const dateStr = !isNaN(parsedDate.getTime())
            ? parsedDate.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : 'Today';
          const timeStr = !isNaN(parsedDate.getTime())
            ? parsedDate.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '12:00 PM';

          let parsedItemsList: OrderItemDetail[] = [];
          if (Array.isArray(o.items) && o.items.length > 0) {
            parsedItemsList = o.items.map((i: any) => ({
              id: String(i.id || i.productId || ''),
              name: i.product?.name || i.name || 'Organic Produce',
              quantity: Number(i.quantity || 1),
              price: Number(i.price || i.product?.price || 0),
              unit: i.product?.unit || 'pack',
            }));
          }

          const itemsSummary = parsedItemsList.length > 0
            ? parsedItemsList.map((i) => `${i.name} (×${i.quantity})`).join(', ')
            : typeof o.items === 'string' && o.items
            ? o.items
            : 'Organic Grocery Basket';

          const mappedStatus = normalizeStatus(o.deliveryStatus || o.status || 'Pending');

          return {
            id: String(o.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`),
            customerId: String(o.customerId || o.customer?.id || o.userId || ''),
            customerName: o.customer?.name || o.customerName || o.user?.fullName || 'Valued Customer',
            customerPhone: o.customerPhone || o.customer?.phone || o.phone || '+91 98765 43210',
            deliveryAddress: o.deliveryAddress || o.address || 'Chennai, Tamil Nadu',
            itemsSummary,
            itemsList: parsedItemsList,
            total: Number(o.totalAmount || o.total || 0),
            deliveryFee: Number(o.deliveryFee || 0),
            status: mappedStatus,
            paymentMethod: o.paymentMethod || 'Online (UPI)',
            paymentStatus: String(o.paymentStatus || 'SUCCESS').toUpperCase(),
            orderType: o.orderType || 'One-Time Order',
            deliveryOtp: o.deliveryOtp || undefined,
            date: dateStr,
            time: timeStr,
            rawDate: rawCreated,
          };
        });

        setOrders(parsedOrders);
      }
    } catch (e) {
      console.warn('Failed to fetch orders:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3000);
  };

  const updateStatus = async (id: string, newStatus: AdminOrderRecord['status']) => {
    setUpdatingId(id);
    try {
      await fetch(`${API_ENDPOINTS.orders}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          deliveryStatus: newStatus.toUpperCase(),
        }),
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
      setSelected((prev) =>
        prev && prev.id === id ? { ...prev, status: newStatus } : prev
      );
      showFeedback(`Order #${id} updated to ${newStatus}`);
    } catch (e) {
      console.warn('Failed to update order status:', e);
      showFeedback('Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = ['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'] as const;

  // Metric counts
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const processingCount = orders.filter((o) => o.status === 'Processing').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Filter & Search
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const matchesFilter = filter === 'All' || o.status === filter;
        if (!matchesFilter) return false;

        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q) ||
          o.itemsSummary.toLowerCase().includes(q) ||
          o.deliveryAddress.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'highest') return b.total - a.total;
        if (sortBy === 'lowest') return a.total - b.total;
        return new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
      });
  }, [orders, filter, search, sortBy]);

  const getCustomerInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <View className="flex-1 bg-[#F0F4F1]">
      {/* Top Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-xl bg-[#0D2B1D] items-center justify-center">
              <ShoppingCart size={17} color="#FFFFFF" strokeWidth={2.4} />
            </View>
            <Text className="text-xl font-black text-[#1a1a2e]">
              Orders Management
            </Text>
          </View>
          <Text className="text-xs text-[#5a6a63] mt-0.5 ml-10">
            {totalOrdersCount} total orders · Real-time status & fulfillment
          </Text>
        </View>

        <TouchableOpacity
          className="w-10 h-10 rounded-xl bg-white border border-[#E2EBE6] items-center justify-center shadow-sm"
          onPress={() => loadOrders(true)}
          disabled={refreshing}
          activeOpacity={0.7}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#0D2B1D" />
          ) : (
            <RefreshCw size={17} color="#0D2B1D" strokeWidth={2.2} />
          )}
        </TouchableOpacity>
      </View>

      {/* Floating Status Feedback Toast */}
      {feedbackMsg && (
        <View className="bg-[#0D2B1D] px-4 py-2.5 rounded-xl mb-3 flex-row items-center gap-2 shadow-md">
          <CheckCircle2 size={16} color="#86EFAC" strokeWidth={2.5} />
          <Text className="text-white text-xs font-semibold flex-1">
            {feedbackMsg}
          </Text>
        </View>
      )}

      {/* Modern KPI Summary Tiles */}
      <View className="flex-row gap-2 mb-3">
        {/* Total Revenue */}
        <View className="flex-1 bg-white rounded-2xl p-3 border border-[#E2EBE6] shadow-sm">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-2xs font-bold text-[#5a6a63] uppercase tracking-wider">
              Revenue
            </Text>
            <View className="w-6 h-6 rounded-lg bg-[#DCFCE7] items-center justify-center">
              <Banknote size={13} color="#15803D" strokeWidth={2.4} />
            </View>
          </View>
          <Text className="text-lg font-black text-[#1a1a2e]">
            ₹{totalRevenue.toLocaleString()}
          </Text>
          <Text className="text-2xs text-[#15803D] font-bold mt-0.5">
            Active sales
          </Text>
        </View>

        {/* Pending Orders */}
        <TouchableOpacity
          className={`flex-1 rounded-2xl p-3 border shadow-sm ${
            filter === 'Pending'
              ? 'bg-[#FEF3C7] border-[#FCD34D]'
              : 'bg-white border-[#E2EBE6]'
          }`}
          onPress={() => setFilter(filter === 'Pending' ? 'All' : 'Pending')}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-2xs font-bold text-[#5a6a63] uppercase tracking-wider">
              Pending
            </Text>
            <View className="w-6 h-6 rounded-lg bg-[#FEF3C7] items-center justify-center">
              <Clock size={13} color="#B45309" strokeWidth={2.4} />
            </View>
          </View>
          <Text className="text-lg font-black text-[#B45309]">
            {pendingCount}
          </Text>
          <Text className="text-2xs text-[#B45309] font-medium mt-0.5">
            Needs action
          </Text>
        </TouchableOpacity>

        {/* Processing Orders */}
        <TouchableOpacity
          className={`flex-1 rounded-2xl p-3 border shadow-sm ${
            filter === 'Processing'
              ? 'bg-[#DBEAFE] border-[#93C5FD]'
              : 'bg-white border-[#E2EBE6]'
          }`}
          onPress={() => setFilter(filter === 'Processing' ? 'All' : 'Processing')}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-2xs font-bold text-[#5a6a63] uppercase tracking-wider">
              Packing
            </Text>
            <View className="w-6 h-6 rounded-lg bg-[#DBEAFE] items-center justify-center">
              <Truck size={13} color="#1D4ED8" strokeWidth={2.4} />
            </View>
          </View>
          <Text className="text-lg font-black text-[#1D4ED8]">
            {processingCount}
          </Text>
          <Text className="text-2xs text-[#1D4ED8] font-medium mt-0.5">
            In progress
          </Text>
        </TouchableOpacity>

        {/* Delivered Orders */}
        <TouchableOpacity
          className={`flex-1 rounded-2xl p-3 border shadow-sm ${
            filter === 'Delivered'
              ? 'bg-[#DCFCE7] border-[#86EFAC]'
              : 'bg-white border-[#E2EBE6]'
          }`}
          onPress={() => setFilter(filter === 'Delivered' ? 'All' : 'Delivered')}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-2xs font-bold text-[#5a6a63] uppercase tracking-wider">
              Delivered
            </Text>
            <View className="w-6 h-6 rounded-lg bg-[#DCFCE7] items-center justify-center">
              <CheckCircle2 size={13} color="#15803D" strokeWidth={2.4} />
            </View>
          </View>
          <Text className="text-lg font-black text-[#15803D]">
            {deliveredCount}
          </Text>
          <Text className="text-2xs text-[#15803D] font-medium mt-0.5">
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="bg-white rounded-2xl px-3.5 py-2 mb-2.5 flex-row items-center border border-[#E2EBE6] shadow-sm">
        <Search size={16} color="#5a6a63" strokeWidth={2.2} />
        <TextInput
          className="flex-1 ml-2.5 text-sm text-[#1a1a2e] font-medium py-1"
          placeholder="Search by order ID, customer, items, phone..."
          placeholderTextColor="#9aada6"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity
            className="w-6 h-6 rounded-full bg-[#F0F4F1] items-center justify-center"
            onPress={() => setSearch('')}
          >
            <X size={13} color="#5a6a63" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs & Sort Row */}
      <View className="flex-row items-center justify-between mb-3 gap-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-1"
        >
          {statuses.map((st) => {
            const isSelected = filter === st;
            const count =
              st === 'All'
                ? totalOrdersCount
                : st === 'Pending'
                ? pendingCount
                : st === 'Processing'
                ? processingCount
                : st === 'Delivered'
                ? deliveredCount
                : cancelledCount;

            return (
              <TouchableOpacity
                key={st}
                className={`py-1.5 px-3.5 rounded-full border mr-2 flex-row items-center gap-1.5 shadow-2xs ${
                  isSelected
                    ? 'bg-[#0D2B1D] border-[#0D2B1D]'
                    : 'bg-white border-[#E2EBE6]'
                }`}
                onPress={() => setFilter(st)}
                activeOpacity={0.8}
              >
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? 'text-white' : 'text-[#5a6a63]'
                  }`}
                >
                  {st}
                </Text>
                <View
                  className={`px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20' : 'bg-[#F0F4F1]'
                  }`}
                >
                  <Text
                    className={`text-2xs font-extrabold ${
                      isSelected ? 'text-white' : 'text-[#5a6a63]'
                    }`}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Quick Sort Button */}
        <TouchableOpacity
          className="py-1.5 px-2.5 rounded-full bg-white border border-[#E2EBE6] flex-row items-center gap-1 shadow-2xs"
          onPress={() =>
            setSortBy((prev) =>
              prev === 'newest'
                ? 'highest'
                : prev === 'highest'
                ? 'lowest'
                : 'newest'
            )
          }
          activeOpacity={0.8}
        >
          <ArrowUpDown size={12} color="#0D2B1D" strokeWidth={2.4} />
          <Text className="text-2xs font-bold text-[#0D2B1D] uppercase">
            {sortBy === 'newest'
              ? 'Newest'
              : sortBy === 'highest'
              ? '₹ High'
              : '₹ Low'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List View */}
      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#0D2B1D" />
          <Text className="text-sm font-semibold text-[#5a6a63] mt-3">
            Loading order records...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {filteredOrders.map((order) => {
            const badge = getStatusBadgeConfig(order.status);
            const isUpdating = updatingId === order.id;

            return (
              <View
                key={order.id}
                className="bg-white rounded-2xl mb-3 border border-[#E2EBE6] shadow-sm overflow-hidden"
              >
                {/* Order Item Header */}
                <View className="p-3.5 bg-[#FAFDFB] border-b border-[#F0F4F1] flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View className="w-7 h-7 rounded-lg bg-[#0D2B1D]/10 items-center justify-center">
                      <Package size={14} color="#0D2B1D" strokeWidth={2.5} />
                    </View>
                    <View>
                      <Text className="text-xs font-black text-[#1a1a2e] font-mono tracking-tight">
                        #{order.id}
                      </Text>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <Calendar size={10} color="#9aada6" strokeWidth={2} />
                        <Text className="text-2xs text-[#9aada6]">
                          {order.date} · {order.time}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View
                    className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border"
                    style={{
                      backgroundColor: badge.bg,
                      borderColor: badge.border,
                    }}
                  >
                    <View
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: badge.dot }}
                    />
                    <Text
                      className="text-2xs font-extrabold uppercase tracking-wider"
                      style={{ color: badge.text }}
                    >
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Card Body */}
                <TouchableOpacity
                  className="p-3.5"
                  onPress={() => setSelected(order)}
                  activeOpacity={0.85}
                >
                  {/* Customer Info Row */}
                  <View className="flex-row items-start justify-between mb-2.5">
                    <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                      <View className="w-9 h-9 rounded-full bg-[#E8F5E9] items-center justify-center border border-[#C8E6C9]">
                        <Text className="text-xs font-black text-[#2D6A4F]">
                          {getCustomerInitials(order.customerName)}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-sm font-bold text-[#1a1a2e]"
                          numberOfLines={1}
                        >
                          {order.customerName}
                        </Text>
                        <View className="flex-row items-center gap-2 mt-0.5">
                          <View className="flex-row items-center gap-1">
                            <Phone size={10} color="#5a6a63" strokeWidth={2} />
                            <Text className="text-2xs text-[#5a6a63]">
                              {order.customerPhone}
                            </Text>
                          </View>
                          <Text className="text-2xs text-[#9aada6]">·</Text>
                          <View className="flex-row items-center gap-1 flex-1">
                            <MapPin size={10} color="#9aada6" strokeWidth={2} />
                            <Text
                              className="text-2xs text-[#9aada6]"
                              numberOfLines={1}
                            >
                              {order.deliveryAddress}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Items Summary Strip */}
                  <View className="bg-[#F7FAF8] rounded-xl p-2.5 border border-[#E2EBE6] mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2 flex-1 mr-2">
                      <ShoppingBag size={13} color="#2D6A4F" strokeWidth={2.2} />
                      <Text
                        className="text-xs font-medium text-[#2D6A4F] flex-1"
                        numberOfLines={1}
                      >
                        {order.itemsSummary}
                      </Text>
                    </View>
                    <View className="bg-white px-2 py-0.5 rounded-md border border-[#E2EBE6]">
                      <Text className="text-2xs font-bold text-[#5a6a63]">
                        {order.itemsList.length > 0
                          ? `${order.itemsList.length} items`
                          : 'Details'}
                      </Text>
                    </View>
                  </View>

                  {/* Pricing and Action Footer */}
                  <View className="flex-row items-center justify-between pt-1">
                    <View>
                      <Text className="text-2xs text-[#9aada6] font-semibold uppercase">
                        Total Amount
                      </Text>
                      <View className="flex-row items-baseline gap-1.5">
                        <Text className="text-lg font-black text-[#0D2B1D]">
                          ₹{order.total.toLocaleString()}
                        </Text>
                        <View className="flex-row items-center gap-1 bg-[#F0F4F1] px-1.5 py-0.5 rounded">
                          <CreditCard size={10} color="#5a6a63" />
                          <Text className="text-2xs text-[#5a6a63] font-semibold">
                            {order.paymentMethod}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Quick Action Button Group */}
                    <View className="flex-row items-center gap-2">
                      {order.status === 'Pending' && (
                        <TouchableOpacity
                          className="bg-[#0D2B1D] py-1.5 px-3 rounded-xl flex-row items-center gap-1 shadow-sm"
                          onPress={() => updateStatus(order.id, 'Processing')}
                          disabled={isUpdating}
                          activeOpacity={0.8}
                        >
                          {isUpdating ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <Truck size={12} color="#fff" strokeWidth={2.4} />
                              <Text className="text-white text-xs font-bold">
                                Process
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}

                      {order.status === 'Processing' && (
                        <TouchableOpacity
                          className="bg-[#15803D] py-1.5 px-3 rounded-xl flex-row items-center gap-1 shadow-sm"
                          onPress={() => updateStatus(order.id, 'Delivered')}
                          disabled={isUpdating}
                          activeOpacity={0.8}
                        >
                          {isUpdating ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <CheckCircle2 size={12} color="#fff" strokeWidth={2.4} />
                              <Text className="text-white text-xs font-bold">
                                Deliver
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        className="bg-[#F0F4F1] p-2 rounded-xl flex-row items-center gap-1 border border-[#E2EBE6]"
                        onPress={() => setSelected(order)}
                        activeOpacity={0.8}
                      >
                        <Text className="text-xs font-bold text-[#0D2B1D]">
                          View
                        </Text>
                        <ChevronRight size={14} color="#0D2B1D" strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}

          {filteredOrders.length === 0 && (
            <View className="bg-white rounded-2xl p-8 items-center justify-center border border-[#E2EBE6] shadow-sm my-4">
              <View className="w-14 h-14 rounded-full bg-[#F0F4F1] items-center justify-center mb-3">
                <ShoppingCart size={26} color="#9aada6" strokeWidth={2} />
              </View>
              <Text className="text-base font-extrabold text-[#1a1a2e]">
                No orders found
              </Text>
              <Text className="text-xs text-[#9aada6] text-center mt-1 max-w-[240px]">
                {search.length > 0
                  ? `No orders match "${search}". Try checking your spelling or reset filter.`
                  : `There are currently no orders in the "${filter}" stage.`}
              </Text>
              {(search.length > 0 || filter !== 'All') && (
                <TouchableOpacity
                  className="mt-4 bg-[#0D2B1D] py-2 px-4 rounded-xl"
                  onPress={() => {
                    setSearch('');
                    setFilter('All');
                  }}
                >
                  <Text className="text-white text-xs font-bold">
                    Reset Filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Modern Order Detail Modal Sheet */}
      <CommonModal
        visible={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Order #${selected.id}` : 'Order Details'}
        subtitle={selected ? `Placed on ${selected.date} at ${selected.time}` : undefined}
        icon={<Package size={16} color={C.primary} />}
        maxHeight="92%"
      >
        {selected && (
          <>
            {selected.deliveryOtp && (
              <View className="mb-3.5 self-start bg-[#FEF3C7] px-2.5 py-1 rounded-lg border border-[#FCD34D]">
                <Text className="text-xs font-black text-[#B45309]">
                  Delivery OTP: {selected.deliveryOtp}
                </Text>
              </View>
            )}

            {/* Visual Order Progress Stepper */}
                <View className="bg-[#F7FAF8] rounded-2xl p-3.5 border border-[#E2EBE6] mb-4">
                  <Text className="text-2xs font-bold text-[#5a6a63] uppercase tracking-wider mb-2.5">
                    Order Status Progress
                  </Text>

                  {selected.status === 'Cancelled' ? (
                    <View className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl p-3 flex-row items-center gap-2">
                      <XCircle size={18} color="#B91C1C" strokeWidth={2.5} />
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-[#B91C1C]">
                          This order was cancelled
                        </Text>
                        <Text className="text-2xs text-[#EF4444]">
                          No further processing or dispatch required.
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-row items-center justify-between px-2">
                      {[
                        { label: 'Placed', stage: 1 },
                        { label: 'Processing', stage: 2 },
                        { label: 'Out for Delivery', stage: 3 },
                        { label: 'Delivered', stage: 4 },
                      ].map((step, idx) => {
                        const currentStage =
                          selected.status === 'Delivered'
                            ? 4
                            : selected.status === 'Processing'
                            ? 2
                            : 1;
                        const isDone = currentStage >= step.stage;
                        const isCurrent = currentStage === step.stage;

                        return (
                          <React.Fragment key={step.label}>
                            <View className="items-center">
                              <View
                                className={`w-7 h-7 rounded-full items-center justify-center border-2 ${
                                  isDone
                                    ? 'bg-[#15803D] border-[#15803D]'
                                    : 'bg-white border-[#E2EBE6]'
                                }`}
                              >
                                {isDone ? (
                                  <Check size={13} color="#fff" strokeWidth={3} />
                                ) : (
                                  <Text className="text-2xs font-bold text-[#9aada6]">
                                    {step.stage}
                                  </Text>
                                )}
                              </View>
                              <Text
                                className={`text-2xs font-bold mt-1 max-w-[64px] text-center ${
                                  isCurrent
                                    ? 'text-[#0D2B1D]'
                                    : isDone
                                    ? 'text-[#15803D]'
                                    : 'text-[#9aada6]'
                                }`}
                              >
                                {step.label}
                              </Text>
                            </View>
                            {idx < 3 && (
                              <View
                                className={`flex-1 h-0.5 mx-1 mb-4 ${
                                  currentStage > step.stage
                                    ? 'bg-[#15803D]'
                                    : 'bg-[#E2EBE6]'
                                }`}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Customer Information Card */}
                <View className="bg-white rounded-2xl p-3.5 border border-[#E2EBE6] mb-4">
                  <Text className="text-2xs font-bold text-[#5a6a63] uppercase tracking-wider mb-2">
                    Customer & Delivery Info
                  </Text>
                  <View className="space-y-2">
                    <View className="flex-row items-center justify-between py-1 border-b border-[#F0F4F1]">
                      <Text className="text-xs text-[#9aada6] font-medium">
                        Customer
                      </Text>
                      <Text className="text-xs font-bold text-[#1a1a2e]">
                        {selected.customerName}
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between py-1 border-b border-[#F0F4F1]">
                      <Text className="text-xs text-[#9aada6] font-medium">
                        Phone Number
                      </Text>
                      <Text className="text-xs font-bold text-[#1a1a2e]">
                        {selected.customerPhone}
                      </Text>
                    </View>
                    <View className="flex-row items-start justify-between py-1">
                      <Text className="text-xs text-[#9aada6] font-medium w-24">
                        Delivery Address
                      </Text>
                      <Text
                        className="text-xs font-semibold text-[#1a1a2e] flex-1 text-right"
                        numberOfLines={2}
                      >
                        {selected.deliveryAddress}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Order Items Breakdown */}
                <View className="bg-white rounded-2xl p-3.5 border border-[#E2EBE6] mb-4">
                  <Text className="text-2xs font-bold text-[#5a6a63] uppercase tracking-wider mb-2.5">
                    Items in Order ({selected.itemsList.length || 1})
                  </Text>
                  {selected.itemsList.length > 0 ? (
                    selected.itemsList.map((item, idx) => (
                      <View
                        key={idx}
                        className="flex-row items-center justify-between py-2 border-b border-[#F0F4F1]"
                      >
                        <View className="flex-row items-center gap-2 flex-1 mr-2">
                          <View className="w-6 h-6 rounded-md bg-[#F0F4F1] items-center justify-center">
                            <Text className="text-xs">🌱</Text>
                          </View>
                          <View className="flex-1">
                            <Text
                              className="text-xs font-bold text-[#1a1a2e]"
                              numberOfLines={1}
                            >
                              {item.name}
                            </Text>
                            <Text className="text-2xs text-[#9aada6]">
                              ₹{item.price} / {item.unit || 'unit'}
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text className="text-xs font-extrabold text-[#1a1a2e]">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </Text>
                          <Text className="text-2xs font-bold text-[#5a6a63]">
                            Qty: ×{item.quantity}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View className="py-2">
                      <Text className="text-xs font-semibold text-[#1a1a2e]">
                        {selected.itemsSummary}
                      </Text>
                    </View>
                  )}

                  {/* Bill Summary */}
                  <View className="mt-3 pt-2.5 border-t border-[#E2EBE6] space-y-1">
                    <View className="flex-row justify-between py-0.5">
                      <Text className="text-xs text-[#9aada6]">Subtotal</Text>
                      <Text className="text-xs font-semibold text-[#1a1a2e]">
                        ₹{selected.total.toLocaleString()}
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-0.5">
                      <Text className="text-xs text-[#9aada6]">
                        Delivery Fee
                      </Text>
                      <Text className="text-xs font-semibold text-[#15803D]">
                        FREE
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-1 border-t border-[#F0F4F1] mt-1">
                      <Text className="text-sm font-black text-[#1a1a2e]">
                        Grand Total
                      </Text>
                      <Text className="text-base font-black text-[#0D2B1D]">
                        ₹{selected.total.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Status Changer Actions */}
                <View className="bg-white rounded-2xl p-3.5 border border-[#E2EBE6] mb-4">
                  <Text className="text-2xs font-bold text-[#5a6a63] uppercase tracking-wider mb-2.5">
                    Update Order Status
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {(
                      [
                        'Pending',
                        'Processing',
                        'Delivered',
                        'Cancelled',
                      ] as AdminOrderRecord['status'][]
                    ).map((st) => {
                      const isActive = selected.status === st;
                      const badge = getStatusBadgeConfig(st);

                      return (
                        <TouchableOpacity
                          key={st}
                          className={`flex-1 min-w-[45%] py-2.5 px-3 rounded-xl border flex-row items-center justify-center gap-1.5 ${
                            isActive
                              ? 'bg-[#0D2B1D] border-[#0D2B1D]'
                              : 'bg-[#F7FAF8] border-[#E2EBE6]'
                          }`}
                          onPress={() => updateStatus(selected.id, st)}
                          activeOpacity={0.8}
                        >
                          <View
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: isActive ? '#86EFAC' : badge.dot,
                            }}
                          />
                          <Text
                            className={`text-xs font-bold ${
                              isActive ? 'text-white' : 'text-[#1a1a2e]'
                            }`}
                          >
                            {st}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  className="h-12 rounded-xl items-center justify-center bg-[#F0F4F1] border border-[#E2EBE6] mb-4"
                  onPress={() => setSelected(null)}
                >
                  <Text className="text-sm text-[#0D2B1D] font-bold">
                    Close Details
                  </Text>
                </TouchableOpacity>
              </>
            )}
      </CommonModal>
    </View>
  );
};

export default AdminOrdersScreen;
