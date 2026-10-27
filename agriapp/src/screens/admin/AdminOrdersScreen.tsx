import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { AdminOrder } from '../../constants/mockData';
import { API_ENDPOINTS } from '../../services';
import { C, Chip, SectionHeader, statusColor } from './types';

export const AdminOrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  const loadOrders = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.orders);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(
          data.map((o: any) => ({
            id: String(o.id),
            customerId: String(o.customerId || o.customer?.id || ''),
            customerName: o.customer?.name || o.customerName || 'Customer',
            items: Array.isArray(o.items)
              ? o.items
                  .map(
                    (i: any) =>
                      `${i.product?.name || i.name || 'Item'} (${i.quantity || 1})`
                  )
                  .join(', ')
              : o.items || 'Organic Grocery',
            total: o.totalAmount || o.total || 0,
            status: o.status || 'Pending',
            paymentMethod: o.paymentMethod || 'Online',
            date: o.createdAt
              ? new Date(o.createdAt).toLocaleDateString()
              : 'Today',
          }))
        );
      }
    } catch (e) {
      console.warn('Failed to fetch orders:', e);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const statuses = ['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'];
  const filtered =
    filter === 'All' ? orders : orders.filter((o) => o.status === filter);

  const updateStatus = async (id: string, status: AdminOrder['status']) => {
    try {
      await fetch(`${API_ENDPOINTS.orders}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
      setSelected((prev) =>
        prev && prev.id === id ? { ...prev, status } : prev
      );
    } catch (e) {
      console.warn('Failed to update order status:', e);
    }
  };

  const pending = orders.filter((o) => o.status === 'Pending').length;
  const delivered = orders.filter((o) => o.status === 'Delivered').length;

  return (
    <View className="flex-1">
      <SectionHeader
        title={`Orders (${orders.length})`}
        sub={`${pending} pending · ${delivered} delivered`}
      />
      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-2.5"
      >
        {statuses.map((st) => (
          <TouchableOpacity
            key={st}
            className={`py-1.5 px-3.5 rounded-full border mr-1.5 ${
              filter === st
                ? 'bg-[#0D2B1D] border-[#0D2B1D]'
                : 'bg-white border-[#E2EBE6]'
            }`}
            onPress={() => setFilter(st)}
          >
            <Text
              className={`text-xs font-semibold ${
                filter === st ? 'text-white font-bold' : 'text-[#5a6a63]'
              }`}
            >
              {st}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map((o) => (
          <TouchableOpacity
            key={o.id}
            className="bg-white rounded-xl p-3 mb-2 flex-row items-center border border-[#E2EBE6] shadow-sm"
            onPress={() => setSelected(o)}
          >
            <View className="flex-1">
              <Text className="text-sm font-bold text-[#1a1a2e]">{o.id}</Text>
              <Text className="text-xs text-[#5a6a63] mt-0.5">
                {o.customerName} · {o.date}
              </Text>
              <Text className="text-xs text-[#9aada6]" numberOfLines={1}>
                {o.items}
              </Text>
            </View>
            <View className="items-end gap-1.5">
              <Text className="font-extrabold text-sm text-[#2D6A4F]">
                ₹{o.total}
              </Text>
              <Chip label={o.status} color={statusColor(o.status)} />
              <Text className="text-2xs text-[#9aada6]">
                {o.paymentMethod}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <Text className="text-center text-[#9aada6] text-sm py-10">
            No orders in this filter
          </Text>
        )}
        <View className="h-5" />
      </ScrollView>

      {/* Order Detail Modal */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setSelected(null)}
        >
          <View
            className="bg-white rounded-t-3xl p-5 pb-8 max-h-[85%]"
            onStartShouldSetResponder={() => true}
          >
            <View className="w-9 h-1 bg-[#E2EBE6] rounded-full self-center mb-4" />
            {selected && (
              <>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-base font-extrabold text-[#1a1a2e]">
                    {selected.id}
                  </Text>
                  <Chip label={selected.status} color={statusColor(selected.status)} />
                </View>
                {[
                  { lbl: 'Customer', val: selected.customerName },
                  { lbl: 'Items', val: selected.items },
                  { lbl: 'Total', val: `₹${selected.total}` },
                  { lbl: 'Payment', val: selected.paymentMethod },
                  { lbl: 'Date', val: selected.date },
                ].map((row) => (
                  <View
                    key={row.lbl}
                    className="flex-row py-2 border-b border-[#E2EBE6]"
                  >
                    <Text className="w-20 text-sm text-[#9aada6] font-medium">
                      {row.lbl}
                    </Text>
                    <Text
                      className="flex-1 text-sm font-semibold text-[#1a1a2e]"
                      numberOfLines={2}
                    >
                      {row.val}
                    </Text>
                  </View>
                ))}
                <Text className="text-xs font-bold text-[#5a6a63] uppercase tracking-wider mb-1 mt-3">
                  Update Status
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {(
                    [
                      'Pending',
                      'Processing',
                      'Delivered',
                      'Cancelled',
                    ] as AdminOrder['status'][]
                  ).map((st) => (
                    <TouchableOpacity
                      key={st}
                      className={`py-1.5 px-3.5 rounded-full border mr-1.5 ${
                        selected.status === st
                          ? 'bg-[#0D2B1D] border-[#0D2B1D]'
                          : 'bg-white border-[#E2EBE6]'
                      }`}
                      onPress={() => updateStatus(selected.id, st)}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          selected.status === st
                            ? 'text-white font-bold'
                            : 'text-[#5a6a63]'
                        }`}
                      >
                        {st}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  className="h-11 rounded-full items-center justify-center bg-[#F7FAF8] border border-[#E2EBE6] mt-3.5"
                  onPress={() => setSelected(null)}
                >
                  <Text className="text-sm text-[#5a6a63] font-semibold">Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
