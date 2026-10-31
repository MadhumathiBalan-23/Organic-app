import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  Search,
  Crown,
  MapPin,
  ShoppingBag,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  User,
} from 'lucide-react-native';
import { AdminCustomer, AdminOrder } from '../../constants/mockData';
import { API_ENDPOINTS } from '../../services';
import { CommonModal } from '../../components/CommonModal';
import { C, Chip, SectionHeader, statusColor } from './types';

export const AdminCustomersScreen: React.FC = () => {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [allOrders, setAllOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminCustomer | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cRes, oRes] = await Promise.all([
          fetch(API_ENDPOINTS.customers),
          fetch(API_ENDPOINTS.orders),
        ]);
        const cData = await cRes.json();
        const oData = await oRes.json();

        if (Array.isArray(oData)) {
          setAllOrders(
            oData.map((o: any) => ({
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
              status: o.status || 'Delivered',
              paymentMethod: o.paymentMethod || 'Online',
              date: o.createdAt
                ? new Date(o.createdAt).toLocaleDateString()
                : 'Today',
            }))
          );
        }

        if (Array.isArray(cData)) {
          setCustomers(
            cData.map((c: any) => ({
              id: String(c.id),
              name: c.name || 'Customer',
              phone: c.phone || '+91 98765 43210',
              location: c.location || c.address || 'Chennai',
              status: c.status || 'Active',
              totalOrders: c._count?.orders || c.orders?.length || 0,
              totalSpend: c.totalSpend || 1200,
              lastActive: 'Today',
              joinDate: c.createdAt
                ? new Date(c.createdAt).toLocaleDateString()
                : 'Jan 2026',
            }))
          );
        }
      } catch (e) {
        console.warn('Failed to fetch customers/orders:', e);
      }
    };
    loadData();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
  );

  const customerOrders = selected
    ? allOrders.filter((o) => o.customerId === selected.id)
    : [];

  const initials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <View className="flex-1">
      <SectionHeader title={`Customers (${customers.length})`} />
      <View className="flex-row items-center bg-white rounded-xl border border-[#E2EBE6] px-3 mb-2.5 h-10">
        <Search size={15} color={C.textMuted} />
        <TextInput
          className="flex-1 text-[13px] text-[#1a1a2e] ml-2"
          placeholder="Search by name or city…"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={C.textMuted}
        />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map((c) => (
          <TouchableOpacity
            key={c.id}
            className="bg-white rounded-xl p-3 mb-2 flex-row items-center border border-[#E2EBE6] shadow-sm"
            onPress={() => setSelected(c)}
          >
            <View className="w-11 h-11 rounded-full bg-[#2D6A4F] items-center justify-center shrink-0">
              <Text className="text-white font-extrabold text-sm">
                {initials(c.name)}
              </Text>
            </View>
            <View className="flex-1 ml-3">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm font-bold text-[#1a1a2e]">{c.name}</Text>
                {c.status === 'VIP' && <Crown size={13} color="#D97706" />}
              </View>
              <View className="flex-row items-center gap-1 mt-0.5">
                <MapPin size={12} color={C.textMuted} />
                <Text className="text-xs text-[#5a6a63]">
                  {c.location} · {c.phone}
                </Text>
              </View>
              <View className="flex-row items-center gap-1 mt-0.5">
                <ShoppingBag size={12} color={C.textMuted} />
                <Text className="text-xs text-[#5a6a63]">
                  {c.totalOrders} orders · ₹{c.totalSpend.toLocaleString()}
                </Text>
              </View>
            </View>
            <View className="items-end gap-1.5">
              <Chip label={c.status} color={statusColor(c.status)} />
              <Text className="text-xs text-[#9aada6]">Active {c.lastActive}</Text>
            </View>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <Text className="text-center text-[#9aada6] text-[13px] py-10">
            No customers found
          </Text>
        )}
        <View className="h-5" />
      </ScrollView>

      {/* Customer Detail Modal */}
      <CommonModal
        visible={!!selected}
        onClose={() => setSelected(null)}
        title="Customer Details"
        icon={<User size={16} color={C.primary} />}
        maxHeight="90%"
      >
        {selected && (
          <>
            {/* Header */}
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="w-14 h-14 rounded-full bg-[#2D6A4F] items-center justify-center shrink-0">
                    <Text className="text-white font-extrabold text-lg">
                      {initials(selected.name)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-base font-extrabold text-[#1a1a2e] mb-0.5">
                        {selected.name}
                      </Text>
                      {selected.status === 'VIP' && <Crown size={14} color="#D97706" />}
                    </View>
                    <Text className="text-xs text-[#5a6a63]">
                      {selected.phone} · {selected.location}
                    </Text>
                  </View>
                  <Chip label={selected.status} color={statusColor(selected.status)} />
                </View>

                {/* Stats */}
                <View className="flex-row gap-2 mb-3.5">
                  {[
                    {
                      val: String(selected.totalOrders),
                      lbl: 'Orders',
                      color: C.primaryLight,
                    },
                    {
                      val: `₹${(selected.totalSpend / 1000).toFixed(1)}K`,
                      lbl: 'Spend',
                      color: C.accent,
                    },
                    {
                      val: `₹${Math.round(
                        selected.totalSpend / Math.max(selected.totalOrders, 1)
                      )}`,
                      lbl: 'Avg Order',
                      color: C.info,
                    },
                  ].map((stat) => (
                    <View
                      key={stat.lbl}
                      className="flex-1 bg-[#F7FAF8] border border-[#E2EBE6] rounded-xl p-2.5 items-center"
                    >
                      <Text
                        className="text-lg font-extrabold"
                        style={{ color: stat.color }}
                      >
                        {stat.val}
                      </Text>
                      <Text className="text-2xs text-[#9aada6] mt-0.5">
                        {stat.lbl}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Order History */}
                <View className="flex-row items-center gap-1.5 mb-2.5">
                  <ShoppingCart size={15} color={C.primary} strokeWidth={2.5} />
                  <Text className="text-sm font-bold text-[#1a1a2e] mb-0.5">
                    Order History
                  </Text>
                </View>
                <View>
                  {customerOrders.length === 0 ? (
                    <Text className="text-center text-[#9aada6] text-sm py-10">
                      No orders yet
                    </Text>
                  ) : (
                    customerOrders.map((o) => (
                      <View
                        key={o.id}
                        className="flex-row items-start gap-2 mb-3"
                      >
                        <View
                          className="w-7 h-7 rounded-full items-center justify-center shrink-0 mt-0.5"
                          style={{
                            backgroundColor: statusColor(o.status) + '30',
                          }}
                        >
                          {o.status === 'Delivered' ? (
                            <CheckCircle2
                              size={12}
                              color={C.success}
                              strokeWidth={2.5}
                            />
                          ) : o.status === 'Cancelled' ? (
                            <XCircle
                              size={12}
                              color={C.danger}
                              strokeWidth={2.5}
                            />
                          ) : (
                            <Clock
                              size={12}
                              color={C.warning}
                              strokeWidth={2.5}
                            />
                          )}
                        </View>
                        <View className="flex-1 ml-2.5">
                          <View className="flex-row justify-between">
                            <Text className="text-sm font-bold text-[#1a1a2e]">
                              {o.id} · ₹{o.total}
                            </Text>
                            <Chip label={o.status} color={statusColor(o.status)} small />
                          </View>
                          <Text
                            className="text-xs text-[#5a6a63]"
                            numberOfLines={1}
                          >
                            {o.items}
                          </Text>
                          <View className="flex-row items-center gap-1 mt-0.5">
                            <CreditCard size={11} color={C.textMuted} />
                            <Text className="text-xs text-[#5a6a63]">
                              {o.paymentMethod} · {o.date}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
                <TouchableOpacity
                  className="h-11 rounded-full items-center justify-center bg-[#F7FAF8] border border-[#E2EBE6] mt-3 mb-4"
                  onPress={() => setSelected(null)}
                >
                  <Text className="text-[#5a6a63] font-semibold">Close</Text>
                </TouchableOpacity>
              </>
            )}
      </CommonModal>
    </View>
  );
};
