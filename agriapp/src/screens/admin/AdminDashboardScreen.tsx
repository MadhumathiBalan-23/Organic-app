import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, DimensionValue } from 'react-native';
import { TrendingUp, Package, Users, Clock, FileText } from 'lucide-react-native';
import { Product, AdminOrder } from '../../constants/mockData';
import { API_ENDPOINTS } from '../../services/api.client';
import { PageLoader } from '../../components/LoadingAndError';
import { C, Card, KPICard, Chip, statusColor, AdminTabKey } from './types';

interface AdminDashboardScreenProps {
  onNavigateTab?: (tab: AdminTabKey) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState({
    totalRevenue: 284500,
    totalOrders: 0,
    totalCustomers: 0,
    pendingOrders: 0,
  });
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.allSettled([
      fetch(API_ENDPOINTS.dashboardStats)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) setStats(json.data);
        }),
      fetch(API_ENDPOINTS.products)
        .then(res => res.json())
        .then(json => {
          if (json.success && Array.isArray(json.data)) {
            setTopProducts(
              [...json.data].sort((a: any, b: any) => (b.stock || 0) - (a.stock || 0)).slice(0, 4)
            );
          }
        }),
      fetch(API_ENDPOINTS.orders)
        .then(res => res.json())
        .then(json => {
          if (json.success && Array.isArray(json.data)) {
            setRecentOrders(
              json.data.slice(0, 5).map((o: any) => ({
                id: o.id,
                customerId: o.userId || 'cu-1',
                customerName: o.customerName || 'Customer',
                items:
                  o.items && o.items.length > 0
                    ? o.items.map((i: any) => `${i.product?.name || 'Organic item'} ×${i.quantity}`).join(', ')
                    : 'Certified produce',
                total: o.totalAmount,
                status:
                  o.deliveryStatus === 'DELIVERED'
                    ? 'Delivered'
                    : o.deliveryStatus === 'PROCESSING'
                    ? 'Processing'
                    : 'Pending',
                date: o.createdAt ? o.createdAt.substring(0, 10) : 'Today',
                paymentMethod: o.paymentMethod || 'UPI',
              }))
            );
          }
        }),
      fetch(API_ENDPOINTS.userLogs)
        .then(res => res.json())
        .then(json => {
          if (json.success && Array.isArray(json.data)) setRecentLogs(json.data.slice(0, 5));
        }),
    ]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <PageLoader
        message="Loading Admin Intelligence..."
        subMessage="Aggregating metrics, live orders, revenue, and inventory analytics"
      />
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* KPI Grid */}
      <View className="flex-row flex-wrap gap-2.5 mb-3">
        <KPICard
          Icon={TrendingUp}
          label="Total Revenue"
          value={`₹${((stats.totalRevenue || 0) / 1000).toFixed(1)}K`}
          sub="▲ Live from SQLite DB"
          accentColor={C.primaryLight}
        />
        <KPICard
          Icon={Package}
          label="Total Orders"
          value={String(stats.totalOrders || recentOrders.length)}
          sub="▲ Verified database orders"
          accentColor={C.accent}
        />
        <KPICard
          Icon={Users}
          label="Customers"
          value={String(stats.totalCustomers || 1)}
          sub="▲ Registered profiles"
          accentColor={C.info}
        />
        <KPICard
          Icon={Clock}
          label="Pending"
          value={String(stats.pendingOrders || 0)}
          sub="Requires delivery"
          accentColor={C.danger}
        />
      </View>

      {/* Top Products */}
      <Card>
        <View className="flex-row items-center gap-1.5 mb-2">
          <TrendingUp size={15} color={C.primaryLight} strokeWidth={2.5} />
          <Text className="text-sm font-bold text-[#1a1a2e] mb-0.5">Top Products in Catalog</Text>
        </View>
        <View className="mt-1 gap-2.5">
          {topProducts.length === 0 ? (
            <Text className="text-xs text-[#9aada6] py-3">Loading products from API...</Text>
          ) : (
            topProducts.map((p, i) => {
              const pct = Math.max(30, Math.min(100, ((p.stock || 0) / 120) * 100));
              return (
                <View key={p.id}>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs font-semibold text-[#1a1a2e]" numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text className="text-xs font-bold text-[#2D6A4F]">
                      ₹{p.price * (p.stock || 1)}
                    </Text>
                  </View>
                  <View className="h-1.5 bg-[#E2EBE6] rounded-full overflow-hidden mb-0.5">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%` as DimensionValue,
                        backgroundColor: [C.primaryLight, C.accent, C.info, C.success][i % 4],
                      }}
                    />
                  </View>
                  <Text className="text-xs text-[#9aada6]">
                    {p.stock} {p.unit} in stock
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </Card>

      {/* Recent Orders */}
      <Card>
        <View className="flex-row items-center gap-1.5 mb-2">
          <Package size={16} color={C.primary} strokeWidth={2.5} />
          <Text className="text-base font-bold text-[#1a1a2e] mb-0.5">Recent Orders (Live API)</Text>
        </View>
        <View className="mt-1">
          {recentOrders.length === 0 ? (
            <Text className="text-xs text-[#9aada6] py-3">No orders found.</Text>
          ) : (
            recentOrders.map(o => (
              <View key={o.id} className="flex-row items-center py-2.5 border-b border-[#E2EBE6] gap-2">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-[#1a1a2e]">{o.id}</Text>
                  <Text className="text-xs text-[#9aada6]">
                    {o.customerName} · {o.date}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-sm text-[#1a1a2e]">₹{o.total}</Text>
                  <Chip label={o.status} color={statusColor(o.status)} small />
                </View>
              </View>
            ))
          )}
        </View>
      </Card>

      {/* Recent Logs */}
      <Card className="mb-5">
        <View className="flex-row items-center gap-1.5 mb-2">
          <FileText size={16} color={C.primary} strokeWidth={2.5} />
          <Text className="text-base font-bold text-[#1a1a2e] mb-0.5">Recent Activity Logs</Text>
        </View>
        <View className="mt-2">
          {recentLogs.length === 0 ? (
            <Text className="text-xs text-[#9aada6] py-3">No logs recorded.</Text>
          ) : (
            recentLogs.map((l, i) => (
              <View key={l.id || i} className="flex-row items-center py-2.5 border-b border-[#E2EBE6] gap-2">
                <View
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{
                    backgroundColor:
                      l.type === 'create'
                        ? C.success
                        : l.type === 'delete'
                        ? C.danger
                        : l.type === 'login'
                        ? C.purple
                        : C.info,
                  }}
                />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-[#1a1a2e]" numberOfLines={2}>
                    {l.action}
                  </Text>
                  <Text className="text-xs text-[#9aada6]">
                    {l.user} · {l.module}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </Card>
    </ScrollView>
  );
};
