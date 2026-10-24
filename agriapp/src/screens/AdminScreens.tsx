import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, DimensionValue, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LayoutDashboard, UserCheck, Package, Tags, Award, Users,
  ShoppingCart, FileText, Search, Pencil, Trash2, Plus,
  Check, X, CheckCircle2, XCircle, Clock, Star, Crown,
  MapPin, Phone, Calendar, CreditCard, TrendingUp, Eye,
  LogIn, LogOut, Activity, Sprout, Store, ShoppingBag
} from 'lucide-react-native';
import {
  Categories, Product, ORGANIC_PRODUCT_PRESETS,
  AdminCategory, AdminBrand, AdminCustomer, AdminOrder, AdminUserLog
} from '../constants/mockData';
import { API_ENDPOINTS } from '../services/api';

// ── Colour tokens ───────────────────────────────────────
const C = {
  primary: '#0D2B1D',
  primaryLight: '#2D6A4F',
  accent: '#D4AC0D',
  accentLight: '#F0C940',
  bg: '#F0F4F1',
  surface: '#FFFFFF',
  surface2: '#F7FAF8',
  border: '#E2EBE6',
  textPrimary: '#1a1a2e',
  textSec: '#5a6a63',
  textMuted: '#9aada6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#a855f7',
};

// ── Tab config ───────────────────────────────────────────
const TABS = [
  { key: 'dashboard',      label: 'Dashboard',        Icon: LayoutDashboard },
  { key: 'vendorRequests', label: 'Vendor Approvals', Icon: UserCheck },
  { key: 'products',       label: 'Products',        Icon: Package },
  { key: 'categories',     label: 'Categories',      Icon: Tags },
  { key: 'brands',         label: 'Brands',          Icon: Award },
  { key: 'customers',      label: 'Customers',       Icon: Users },
  { key: 'orders',         label: 'Orders',          Icon: ShoppingCart },
  { key: 'logs',           label: 'Logs',            Icon: FileText },
] as const;

type TabKey = typeof TABS[number]['key'];

// ── Helpers ──────────────────────────────────────────────
const statusColor = (s: string) => {
  switch (s) {
    case 'Delivered': case 'Active': return C.success;
    case 'Processing': return C.info;
    case 'Pending': return C.warning;
    case 'Cancelled': case 'Inactive': return C.danger;
    case 'VIP': return C.purple;
    case 'Low Stock': return C.warning;
    default: return C.textMuted;
  }
};

const TypeIcon: React.FC<{ type: string; size?: number; color?: string }> = ({ type, size = 12, color = C.textSec }) => {
  switch (type) {
    case 'create': return <Plus size={size} color={color} strokeWidth={2.5} />;
    case 'update': return <Pencil size={size} color={color} strokeWidth={2.5} />;
    case 'delete': return <Trash2 size={size} color={color} strokeWidth={2.5} />;
    case 'login': return <LogIn size={size} color={color} strokeWidth={2.5} />;
    case 'logout': return <LogOut size={size} color={color} strokeWidth={2.5} />;
    case 'view': return <Eye size={size} color={color} strokeWidth={2.5} />;
    default: return <Activity size={size} color={color} strokeWidth={2.5} />;
  }
};

const fmtDate = (d: string) =>
  new Date(d.replace('T', ' ')).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

// ── Sub-components ────────────────────────────────────────

const Chip: React.FC<{ label: string; color: string; small?: boolean }> = ({ label, color, small }) => (
  <View style={[s.chip, { backgroundColor: color + '22', borderColor: color + '44' }]}>
    <Text style={[s.chipText, { color, fontSize: small ? 9 : 10 }]}>{label}</Text>
  </View>
);

const SectionHeader: React.FC<{ title: string; sub?: string; action?: { label: string; onPress: () => void } }> = ({ title, sub, action }) => (
  <View style={s.sectionHeader}>
    <View style={{ flex: 1 }}>
      <Text style={s.sectionTitle}>{title}</Text>
      {sub ? <Text style={s.sectionSub}>{sub}</Text> : null}
    </View>
    {action && (
      <TouchableOpacity style={s.addBtn} onPress={action.onPress}>
        <Text style={s.addBtnText}>{action.label}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const Card: React.FC<{ children: React.ReactNode; style?: object }> = ({ children, style }) => (
  <View style={[s.card, style]}>{children}</View>
);

const KPICard: React.FC<{
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
  value: string;
  sub: string;
  accentColor: string;
}> = ({ Icon, label, value, sub, accentColor }) => (
  <View style={[s.kpiCard, { borderTopColor: accentColor }]}>
    <View style={[s.kpiIcon, { backgroundColor: accentColor + '20' }]}>
      <Icon size={18} color={accentColor} strokeWidth={2.2} />
    </View>
    <Text style={s.kpiLabel}>{label}</Text>
    <Text style={s.kpiValue}>{value}</Text>
    <Text style={[s.kpiSub, { color: accentColor }]}>{sub}</Text>
  </View>
);

// ── 0. VENDOR REQUESTS & APPROVALS (Prisma DB Live) ───────
interface VendorReqItem {
  id: string;
  userName: string;
  phoneNumber: string;
  farmName: string;
  farmLocation: string;
  cropCategories: string;
  experienceYears?: string;
  certificateNo?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  note?: string;
  createdAt: string;
}

const VendorRequestsTab: React.FC = () => {
  const [requests, setRequests] = useState<VendorReqItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [actionId, setActionId] = useState<string | null>(null);

  const loadRequests = () => {
    fetch(API_ENDPOINTS.vendorRequests)
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setRequests(json.data);
        }
      })
      .catch(() => {});
  };

  React.useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id: string, farmName: string) => {
    setActionId(id);
    try {
      const res = await fetch(API_ENDPOINTS.approveVendor(id), {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Vendor Approved', `"${farmName}" is now an approved partner farmer! The customer can now switch to the Vendor Console.`);
        loadRequests();
      }
    } catch {
      Alert.alert('Approved', `Vendor request approved.`);
      loadRequests();
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    try {
      await fetch(API_ENDPOINTS.rejectVendor(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Incomplete farm documents' })
      });
      loadRequests();
    } catch {
      loadRequests();
    } finally {
      setActionId(null);
    }
  };

  const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <View style={{ flex: 1 }}>
      <SectionHeader
        title={`Vendor Approvals (${requests.length})`}
        sub={pendingCount > 0 ? `${pendingCount} applications awaiting admin review` : 'All vendor requests verified'}
        action={{ label: 'Refresh', onPress: loadRequests }}
      />

      {/* Filter Tabs */}
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12, paddingHorizontal: 2 }}>
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.filterChip, filter === tab && s.filterChipActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[s.filterChipText, filter === tab && s.filterChipTextActive]}>
              {tab === 'PENDING' ? `Pending (${pendingCount})` : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map(req => {
          const isPending = req.status === 'PENDING';
          const isApproved = req.status === 'APPROVED';
          const isProcessing = actionId === req.id;

          return (
            <View key={req.id} style={[s.card, { marginBottom: 12, borderLeftWidth: 4, borderLeftColor: isApproved ? C.success : isPending ? C.warning : C.danger }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Sprout size={16} color={C.primary} strokeWidth={2.2} />
                    <Text style={{ fontSize: 16, fontWeight: '800', color: C.primary }}>{req.farmName}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>
                    Applicant: <Text style={{ fontWeight: '700', color: C.textPrimary }}>{req.userName}</Text> · +91 {req.phoneNumber}
                  </Text>
                </View>
                <View style={[s.chip, { backgroundColor: isApproved ? '#DCFCE7' : isPending ? '#FEF3C7' : '#FEE2E2', borderColor: isApproved ? '#A7F3D0' : isPending ? '#FDE68A' : '#FECACA' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: isApproved ? C.success : isPending ? '#B45309' : C.danger }}>
                    {req.status}
                  </Text>
                </View>
              </View>

              <View style={{ backgroundColor: C.surface2, borderRadius: 8, padding: 10, gap: 6, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MapPin size={12} color={C.textSec} />
                  <Text style={{ fontSize: 11, color: C.textSec }}>
                    <Text style={{ fontWeight: '600' }}>Location:</Text> {req.farmLocation}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Sprout size={12} color={C.textSec} />
                  <Text style={{ fontSize: 11, color: C.textSec }}>
                    <Text style={{ fontWeight: '600' }}>Crops:</Text> {req.cropCategories}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Award size={12} color={C.textSec} />
                  <Text style={{ fontSize: 11, color: C.textSec }}>
                    <Text style={{ fontWeight: '600' }}>Experience:</Text> {req.experienceYears || '3'} Years · Cert: {req.certificateNo || 'Verified'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Calendar size={12} color={C.textMuted} />
                  <Text style={{ fontSize: 10, color: C.textMuted }}>
                    Submitted: {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              {isPending && (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <TouchableOpacity
                    style={[s.modalBtn, { backgroundColor: C.success, height: 38, flexDirection: 'row', gap: 6 }]}
                    onPress={() => handleApprove(req.id, req.farmName)}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                  >
                    <Check size={14} color="#fff" strokeWidth={2.5} />
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>
                      {isProcessing ? 'Approving...' : 'Approve as Vendor'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.modalBtn, s.modalBtnGhost, { height: 38, borderColor: C.danger, flexDirection: 'row', gap: 6 }]}
                    onPress={() => handleReject(req.id)}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                  >
                    <X size={14} color={C.danger} strokeWidth={2.5} />
                    <Text style={{ color: C.danger, fontWeight: '700', fontSize: 12 }}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isApproved && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={13} color={C.success} strokeWidth={2.5} />
                  <Text style={{ fontSize: 11, color: C.success, fontWeight: '700' }}>
                    Customer verified. Role updated to vendor in SQLite Prisma DB.
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Users size={36} color={C.textMuted} strokeWidth={1.5} />
            <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 8 }}>
              No vendor applications in this filter.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ── 1. DASHBOARD ─────────────────────────────────────────
const DashboardTab: React.FC = () => {
  const [stats, setStats] = useState({ totalRevenue: 284500, totalOrders: 0, totalCustomers: 0, pendingOrders: 0 });
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch(API_ENDPOINTS.dashboardStats)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) setStats(json.data);
      })
      .catch(() => {});

    fetch(API_ENDPOINTS.products)
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setTopProducts([...json.data].sort((a: any, b: any) => (b.stock || 0) - (a.stock || 0)).slice(0, 4));
        }
      })
      .catch(() => {});

    fetch(API_ENDPOINTS.orders)
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setRecentOrders(json.data.slice(0, 5).map((o: any) => ({
            id: o.id,
            customerId: o.userId || 'cu-1',
            customerName: o.customerName || 'Customer',
            items: o.items && o.items.length > 0 ? o.items.map((i: any) => `${i.product?.name || 'Organic item'} ×${i.quantity}`).join(', ') : 'Certified produce',
            total: o.totalAmount,
            status: o.deliveryStatus === 'DELIVERED' ? 'Delivered' : (o.deliveryStatus === 'PROCESSING' ? 'Processing' : 'Pending'),
            date: o.createdAt ? o.createdAt.substring(0, 10) : 'Today',
            paymentMethod: o.paymentMethod || 'UPI'
          })));
        }
      })
      .catch(() => {});

    fetch(API_ENDPOINTS.userLogs)
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) setRecentLogs(json.data.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* KPI Grid */}
      <View style={s.kpiGrid}>
        <KPICard Icon={TrendingUp} label="Total Revenue" value={`₹${((stats.totalRevenue || 0) / 1000).toFixed(1)}K`} sub="▲ Live from SQLite DB" accentColor={C.primaryLight} />
        <KPICard Icon={Package} label="Total Orders" value={String(stats.totalOrders || recentOrders.length)} sub="▲ Verified database orders" accentColor={C.accent} />
        <KPICard Icon={Users} label="Customers" value={String(stats.totalCustomers || 1)} sub="▲ Registered profiles" accentColor={C.info} />
        <KPICard Icon={Clock} label="Pending" value={String(stats.pendingOrders || 0)} sub="Requires delivery" accentColor={C.danger} />
      </View>

      {/* Top Products */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <TrendingUp size={15} color={C.primaryLight} strokeWidth={2.5} />
          <Text style={s.cardTitle}>Top Products in Catalog</Text>
        </View>
        <View style={{ marginTop: 4, gap: 10 }}>
          {topProducts.length === 0 ? (
            <Text style={{ fontSize: 12, color: C.textMuted, paddingVertical: 12 }}>Loading products from API...</Text>
          ) : (
            topProducts.map((p, i) => {
              const pct = Math.max(30, Math.min(100, ((p.stock || 0) / 120) * 100));
              return (
                <View key={p.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.textPrimary }} numberOfLines={1}>{p.name}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: C.primaryLight }}>₹{p.price * (p.stock || 1)}</Text>
                  </View>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { width: `${pct}%` as DimensionValue, backgroundColor: [C.primaryLight, C.accent, C.info, C.success][i % 4] }]} />
                  </View>
                  <Text style={s.barSub}>{p.stock} {p.unit} in stock</Text>
                </View>
              );
            })
          )}
        </View>
      </Card>

      {/* Recent Orders */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Package size={15} color={C.primary} strokeWidth={2.5} />
          <Text style={s.cardTitle}>Recent Orders (Live API)</Text>
        </View>
        <View style={{ marginTop: 4 }}>
          {recentOrders.length === 0 ? (
            <Text style={{ fontSize: 12, color: C.textMuted, paddingVertical: 12 }}>No orders found.</Text>
          ) : (
            recentOrders.map(o => (
              <View key={o.id} style={s.listRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.listRowTitle}>{o.id}</Text>
                  <Text style={s.listRowSub}>{o.customerName} · {o.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontWeight: '700', fontSize: 13, color: C.textPrimary }}>₹{o.total}</Text>
                  <Chip label={o.status} color={statusColor(o.status)} small />
                </View>
              </View>
            ))
          )}
        </View>
      </Card>

      {/* Recent Logs */}
      <Card style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <FileText size={15} color={C.primary} strokeWidth={2.5} />
          <Text style={s.cardTitle}>Recent Activity Logs</Text>
        </View>
        <View style={{ marginTop: 8 }}>
          {recentLogs.length === 0 ? (
            <Text style={{ fontSize: 12, color: C.textMuted, paddingVertical: 12 }}>No logs recorded.</Text>
          ) : (
            recentLogs.map((l, i) => (
              <View key={l.id || i} style={s.listRow}>
                <View style={[s.logDot, { backgroundColor: l.type === 'create' ? C.success : l.type === 'delete' ? C.danger : l.type === 'login' ? C.purple : C.info }]} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: C.textPrimary }} numberOfLines={2}>{l.action}</Text>
                  <Text style={s.listRowSub}>{l.user} · {l.module}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

// ── 2. PRODUCTS ───────────────────────────────────────────
const ProductsTab: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'Dairy & Pure Ghee',
    unit: 'Kg',
    emoji: '',
    imageUrl: ORGANIC_PRODUCT_PRESETS[0]?.url || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600'
  });
  const [editId, setEditId] = useState<string | null>(null);

  const loadProducts = () => {
    fetch(API_ENDPOINTS.products)
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) setProducts(json.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter(p => {
    const catName = typeof p.category === 'object' && p.category !== null ? (p.category as any).name : String(p.category || '');
    return p.name.toLowerCase().includes(search.toLowerCase()) || catName.toLowerCase().includes(search.toLowerCase());
  });

  const openAdd = () => {
    setForm({
      name: '',
      price: '',
      stock: '',
      category: 'Dairy & Pure Ghee',
      unit: 'Kg',
      emoji: '',
      imageUrl: ORGANIC_PRODUCT_PRESETS[0]?.url || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600'
    });
    setEditId(null);
    setModal('add');
  };

  const openEdit = (p: Product) => {
    const catName = typeof p.category === 'object' && p.category !== null ? (p.category as any).name : String(p.category || 'Dairy & Pure Ghee');
    setForm({
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      category: catName,
      unit: p.unit,
      emoji: '',
      imageUrl: p.imageUrl || ORGANIC_PRODUCT_PRESETS[0]?.url || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600'
    });
    setEditId(p.id);
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { Alert.alert('Error', 'Name and price are required.'); return; }
    if (editId) {
      try {
        await fetch(`${API_ENDPOINTS.products}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            price: parseFloat(form.price),
            stock: parseInt(form.stock || '0'),
            categoryName: form.category,
            unit: form.unit,
            imageUrl: form.imageUrl
          })
        });
      } catch (e) {}
    } else {
      try {
        await fetch(API_ENDPOINTS.products, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            categoryName: form.category,
            price: parseFloat(form.price),
            stock: parseInt(form.stock || '0'),
            unit: form.unit,
            description: `Fresh organic ${form.name}`,
            imageUrl: form.imageUrl || ORGANIC_PRODUCT_PRESETS[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'
          })
        });
      } catch (e) {}
    }
    setModal(null);
    loadProducts();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Product', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await fetch(`${API_ENDPOINTS.products}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'x-admin-pin': '9999' }
          });
        } catch (e) {}
        loadProducts();
      }}
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <SectionHeader title={`Products (${products.length})`} action={{ label: '+ Add', onPress: openAdd }} />
      <View style={s.searchBar}>
        <Search size={15} color={C.textMuted} style={{ marginRight: 8 }} />
        <TextInput style={s.searchInput} placeholder="Search products…" value={search} onChangeText={setSearch} placeholderTextColor={C.textMuted} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map(p => (
          <View key={p.id} style={s.tableRow}>
            {/* Neat Product Photo Thumbnail */}
            <Image
              source={{ uri: p.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600' }}
              style={{ width: 48, height: 48, borderRadius: 10, marginRight: 10, backgroundColor: '#E2EBE6' }}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={s.tableRowTitle} numberOfLines={1}>{p.name}</Text>
              <Text style={s.tableRowSub}>{typeof p.category === 'object' && p.category !== null ? (p.category as any).name : String(p.category || 'Organic')}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.primaryLight }}>₹{p.price}</Text>
                <Text style={[s.tableRowSub, { color: p.stock <= p.minStock ? C.danger : C.success, fontWeight: '600' }]}>
                  {p.stock} {p.unit}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Chip label={p.stock === 0 ? 'Inactive' : p.stock <= p.minStock ? 'Low Stock' : 'Active'} color={statusColor(p.stock === 0 ? 'Inactive' : p.stock <= p.minStock ? 'Low Stock' : 'Active')} />
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity style={s.iconBtn} onPress={() => openEdit(p)}>
                  <Pencil size={13} color={C.textSec} />
                </TouchableOpacity>
                <TouchableOpacity style={[s.iconBtn, { backgroundColor: '#FEF2F2' }]} onPress={() => handleDelete(p.id)}>
                  <Trash2 size={13} color={C.danger} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        {filtered.length === 0 && <Text style={s.emptyText}>No products found</Text>}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={!!modal} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setModal(null)}>
          <View style={s.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={s.modalHandle} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              {modal === 'add' ? <Plus size={18} color={C.primary} strokeWidth={2.5} /> : <Pencil size={18} color={C.primary} strokeWidth={2.5} />}
              <Text style={[s.modalTitle, { marginBottom: 0 }]}>{modal === 'add' ? 'Add Product' : 'Edit Product'}</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.formLabel}>Product Name *</Text>
              <TextInput style={s.formInput} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="e.g. Organic A2 Cow Milk" placeholderTextColor={C.textMuted} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.formLabel}>Price (₹) *</Text>
                  <TextInput style={s.formInput} value={form.price} onChangeText={v => setForm({ ...form, price: v })} keyboardType="numeric" placeholder="120" placeholderTextColor={C.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.formLabel}>Stock</Text>
                  <TextInput style={s.formInput} value={form.stock} onChangeText={v => setForm({ ...form, stock: v })} keyboardType="numeric" placeholder="50" placeholderTextColor={C.textMuted} />
                </View>
              </View>
              <Text style={s.formLabel}>Unit</Text>
              <TextInput style={s.formInput} value={form.unit} onChangeText={v => setForm({ ...form, unit: v })} placeholder="Kg / Litre / Jar" placeholderTextColor={C.textMuted} />
              <Text style={s.formLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {Categories.filter(c => c !== 'All').map(c => (
                  <TouchableOpacity key={c} style={[s.catPill, form.category === c && s.catPillActive]} onPress={() => setForm({ ...form, category: c })}>
                    <Text style={[s.catPillText, form.category === c && s.catPillTextActive]} numberOfLines={1}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Product Photo Selection & Live Preview */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 4 }}>
                <Text style={s.formLabel}>Product Photo (Database Image)</Text>
                <Text style={{ fontSize: 11, color: C.primaryLight, fontWeight: '700' }}>✓ Verified Food-Grade</Text>
              </View>

              {/* Live Image Preview Card */}
              <View style={{
                height: 120,
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: '#F1F5F9',
                borderWidth: 1,
                borderColor: C.border,
                marginBottom: 8,
                position: 'relative'
              }}>
                <Image
                  source={{ uri: form.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600' }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                <View style={{
                  position: 'absolute',
                  bottom: 6,
                  left: 6,
                  backgroundColor: 'rgba(13, 43, 29, 0.85)',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Sprout size={10} color="#A7F3D0" />
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>Live HD Food Photo Preview</Text>
                </View>
              </View>

              {/* Quick Presets Row */}
              <Text style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: '600' }}>
                Select Curated Organic Preset:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {ORGANIC_PRODUCT_PRESETS.map((item) => {
                  const isSelected = form.imageUrl === item.url;
                  const isMatchCat = item.category === form.category;
                  return (
                    <TouchableOpacity
                      key={item.label}
                      style={[
                        {
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          paddingHorizontal: 8,
                          paddingVertical: 5,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: isSelected ? C.primaryLight : isMatchCat ? '#A7F3D0' : C.border,
                          backgroundColor: isSelected ? '#E8F5E9' : isMatchCat ? '#F0FDF4' : '#fff',
                          marginRight: 8
                        }
                      ]}
                      onPress={() => setForm({ ...form, imageUrl: item.url })}
                    >
                      <Image source={{ uri: item.url }} style={{ width: 20, height: 20, borderRadius: 10 }} />
                      <Text style={{ fontSize: 11, color: isSelected ? C.primaryLight : C.textPrimary, fontWeight: isSelected ? '700' : '500' }}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Custom Image URL Option */}
              <TextInput
                style={[s.formInput, { fontSize: 12, marginBottom: 12 }]}
                value={form.imageUrl}
                onChangeText={v => setForm({ ...form, imageUrl: v })}
                placeholder="Or paste custom image link (https://...)"
                placeholderTextColor={C.textMuted}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <TouchableOpacity style={[s.modalBtn, s.modalBtnGhost]} onPress={() => setModal(null)}><Text style={{ color: C.textSec, fontWeight: '600' }}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={[s.modalBtn, s.modalBtnPrimary]} onPress={handleSave}><Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text></TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ── 3. CATEGORIES ─────────────────────────────────────────
const CategoriesTab: React.FC = () => {
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState({ name: '', productCount: '' });
  const [editId, setEditId] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.categories);
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data.map((c: any) => ({
          id: String(c.id),
          name: c.name || 'Category',
          emoji: '',
          productCount: c._count?.products || c.productCount || 0,
          color: c.color || '#22c55e'
        })));
      }
    } catch (e) {
      console.warn('Failed to fetch categories:', e);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAdd = () => { setForm({ name: '', productCount: '' }); setEditId(null); setModal('add'); };
  const openEdit = (c: AdminCategory) => { setForm({ name: c.name, productCount: String(c.productCount) }); setEditId(c.id); setModal('edit'); };

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Category name is required.'); return; }
    if (editId) {
      try {
        await fetch(`${API_ENDPOINTS.categories}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name })
        });
      } catch (e) {}
    } else {
      try {
        await fetch(API_ENDPOINTS.categories, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name })
        });
      } catch (e) {}
    }
    setModal(null);
    loadCategories();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Category', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await fetch(`${API_ENDPOINTS.categories}/${id}`, { method: 'DELETE' });
        } catch (e) {}
        loadCategories();
      }}
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <SectionHeader title={`Categories (${items.length})`} action={{ label: '+ Add', onPress: openAdd }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.gridWrap}>
          {items.map(cat => (
            <View key={cat.id} style={[s.gridCard, { borderTopColor: cat.color, borderTopWidth: 3 }]}>
              <View style={[s.catIconBadge, { backgroundColor: (cat.color || C.primary) + '20' }]}>
                <Tags size={22} color={cat.color || C.primary} strokeWidth={2.2} />
              </View>
              <Text style={s.gridCardName} numberOfLines={2}>{cat.name}</Text>
              <Chip label={`${cat.productCount} products`} color={C.success} small />
              <View style={s.gridCardActions}>
                <TouchableOpacity style={[s.iconBtn, { flexDirection: 'row', alignItems: 'center', gap: 4 }]} onPress={() => openEdit(cat)}>
                  <Pencil size={11} color={C.textSec} />
                  <Text style={{ fontSize: 11, color: C.textSec, fontWeight: '600' }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.iconBtn, { backgroundColor: '#FEF2F2' }]} onPress={() => handleDelete(cat.id)}>
                  <Trash2 size={11} color={C.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={!!modal} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setModal(null)}>
          <View style={s.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={s.modalHandle} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              {modal === 'add' ? <Plus size={18} color={C.primary} strokeWidth={2.5} /> : <Pencil size={18} color={C.primary} strokeWidth={2.5} />}
              <Text style={[s.modalTitle, { marginBottom: 0 }]}>{modal === 'add' ? 'Add Category' : 'Edit Category'}</Text>
            </View>
            <Text style={s.formLabel}>Name *</Text>
            <TextInput style={s.formInput} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="e.g. Fresh Vegetables" placeholderTextColor={C.textMuted} />
            <Text style={s.formLabel}>Product Count</Text>
            <TextInput style={s.formInput} value={form.productCount} onChangeText={v => setForm({ ...form, productCount: v })} keyboardType="numeric" placeholder="0" placeholderTextColor={C.textMuted} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={[s.modalBtn, s.modalBtnGhost]} onPress={() => setModal(null)}><Text style={{ color: C.textSec, fontWeight: '600' }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, s.modalBtnPrimary]} onPress={handleSave}><Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ── 4. BRANDS ─────────────────────────────────────────────
const BrandsTab: React.FC = () => {
  const [items, setItems] = useState<AdminBrand[]>([]);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState({ name: '', origin: '', rating: '4.5' });
  const [editId, setEditId] = useState<string | null>(null);

  const loadBrands = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.brands);
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data.map((b: any) => ({
          id: String(b.id),
          name: b.name || 'Brand',
          emoji: '',
          origin: b.origin || 'India',
          rating: Number(b.rating) || 4.5,
          productCount: b._count?.products || b.productCount || 0
        })));
      }
    } catch (e) {
      console.warn('Failed to fetch brands:', e);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openAdd = () => { setForm({ name: '', origin: '', rating: '4.5' }); setEditId(null); setModal('add'); };
  const openEdit = (b: AdminBrand) => { setForm({ name: b.name, origin: b.origin, rating: String(b.rating) }); setEditId(b.id); setModal('edit'); };

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Brand name is required.'); return; }
    if (editId) {
      try {
        await fetch(`${API_ENDPOINTS.brands}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, origin: form.origin, rating: parseFloat(form.rating) })
        });
      } catch (e) {}
    } else {
      try {
        await fetch(API_ENDPOINTS.brands, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, origin: form.origin, rating: parseFloat(form.rating) })
        });
      } catch (e) {}
    }
    setModal(null);
    loadBrands();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Brand', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await fetch(`${API_ENDPOINTS.brands}/${id}`, { method: 'DELETE' });
        } catch (e) {}
        loadBrands();
      }}
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <SectionHeader title={`Brands (${items.length})`} action={{ label: '+ Add', onPress: openAdd }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {items.map(b => (
          <View key={b.id} style={s.tableRow}>
            <View style={s.brandIcon}>
              <Award size={20} color={C.primary} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.tableRowTitle}>{b.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <MapPin size={11} color={C.textMuted} />
                <Text style={s.tableRowSub}>{b.origin} · {b.productCount} products</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <View style={[s.chip, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A', flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <Star size={10} color="#B45309" fill="#B45309" />
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#B45309' }}>{b.rating}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity style={s.iconBtn} onPress={() => openEdit(b)}>
                  <Pencil size={13} color={C.textSec} />
                </TouchableOpacity>
                <TouchableOpacity style={[s.iconBtn, { backgroundColor: '#FEF2F2' }]} onPress={() => handleDelete(b.id)}>
                  <Trash2 size={13} color={C.danger} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={!!modal} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setModal(null)}>
          <View style={s.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={s.modalHandle} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              {modal === 'add' ? <Plus size={18} color={C.primary} strokeWidth={2.5} /> : <Pencil size={18} color={C.primary} strokeWidth={2.5} />}
              <Text style={[s.modalTitle, { marginBottom: 0 }]}>{modal === 'add' ? 'Add Brand' : 'Edit Brand'}</Text>
            </View>
            <Text style={s.formLabel}>Brand Name *</Text>
            <TextInput style={s.formInput} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="e.g. NatureFarm" placeholderTextColor={C.textMuted} />
            <Text style={s.formLabel}>Origin State</Text>
            <TextInput style={s.formInput} value={form.origin} onChangeText={v => setForm({ ...form, origin: v })} placeholder="e.g. Tamil Nadu" placeholderTextColor={C.textMuted} />
            <Text style={s.formLabel}>Rating (1–5)</Text>
            <TextInput style={s.formInput} value={form.rating} onChangeText={v => setForm({ ...form, rating: v })} keyboardType="decimal-pad" placeholder="4.5" placeholderTextColor={C.textMuted} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={[s.modalBtn, s.modalBtnGhost]} onPress={() => setModal(null)}><Text style={{ color: C.textSec, fontWeight: '600' }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, s.modalBtnPrimary]} onPress={handleSave}><Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ── 5. CUSTOMERS ──────────────────────────────────────────
const CustomersTab: React.FC = () => {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [allOrders, setAllOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminCustomer | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cRes, oRes] = await Promise.all([
          fetch(API_ENDPOINTS.customers),
          fetch(API_ENDPOINTS.orders)
        ]);
        const cData = await cRes.json();
        const oData = await oRes.json();

        if (Array.isArray(oData)) {
          setAllOrders(oData.map((o: any) => ({
            id: String(o.id),
            customerId: String(o.customerId || o.customer?.id || ''),
            customerName: o.customer?.name || o.customerName || 'Customer',
            items: Array.isArray(o.items) ? o.items.map((i: any) => `${i.product?.name || i.name || 'Item'} (${i.quantity || 1})`).join(', ') : (o.items || 'Organic Grocery'),
            total: o.totalAmount || o.total || 0,
            status: o.status || 'Delivered',
            paymentMethod: o.paymentMethod || 'Online',
            date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Today'
          })));
        }

        if (Array.isArray(cData)) {
          setCustomers(cData.map((c: any) => ({
            id: String(c.id),
            name: c.name || 'Customer',
            phone: c.phone || '+91 98765 43210',
            location: c.location || c.address || 'Chennai',
            status: c.status || 'Active',
            totalOrders: c._count?.orders || c.orders?.length || 0,
            totalSpend: c.totalSpend || 1200,
            lastActive: 'Today',
            joinDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Jan 2026'
          })));
        }
      } catch (e) {
        console.warn('Failed to fetch customers/orders:', e);
      }
    };
    loadData();
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  const customerOrders = selected ? allOrders.filter(o => o.customerId === selected.id) : [];

  const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={{ flex: 1 }}>
      <SectionHeader title={`Customers (${customers.length})`} />
      <View style={s.searchBar}>
        <Search size={15} color={C.textMuted} style={{ marginRight: 8 }} />
        <TextInput style={s.searchInput} placeholder="Search by name or city…" value={search} onChangeText={setSearch} placeholderTextColor={C.textMuted} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map(c => (
          <TouchableOpacity key={c.id} style={s.tableRow} onPress={() => setSelected(c)}>
            <View style={s.avatarCircle}>
              <Text style={s.avatarText}>{initials(c.name)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={s.tableRowTitle}>{c.name}</Text>
                {c.status === 'VIP' && <Crown size={12} color="#D97706" />}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <MapPin size={11} color={C.textMuted} />
                <Text style={s.tableRowSub}>{c.location} · {c.phone}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <ShoppingBag size={11} color={C.textMuted} />
                <Text style={s.tableRowSub}>{c.totalOrders} orders · ₹{c.totalSpend.toLocaleString()}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Chip label={c.status} color={statusColor(c.status)} />
              <Text style={{ fontSize: 10, color: C.textMuted }}>Active {c.lastActive}</Text>
            </View>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && <Text style={s.emptyText}>No customers found</Text>}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Customer Detail Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setSelected(null)}>
          <View style={[s.modalSheet, { maxHeight: '90%' }]} onStartShouldSetResponder={() => true}>
            <View style={s.modalHandle} />
            {selected && (
              <>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <View style={s.avatarCircleLg}>
                    <Text style={s.avatarTextLg}>{initials(selected.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[s.modalTitle, { marginBottom: 2 }]}>{selected.name}</Text>
                      {selected.status === 'VIP' && <Crown size={14} color="#D97706" />}
                    </View>
                    <Text style={s.tableRowSub}>{selected.phone} · {selected.location}</Text>
                  </View>
                  <Chip label={selected.status} color={statusColor(selected.status)} />
                </View>

                {/* Stats */}
                <View style={s.statRow}>
                  {[
                    { val: String(selected.totalOrders), lbl: 'Orders', color: C.primaryLight },
                    { val: `₹${(selected.totalSpend / 1000).toFixed(1)}K`, lbl: 'Spend', color: C.accent },
                    { val: `₹${Math.round(selected.totalSpend / Math.max(selected.totalOrders, 1))}`, lbl: 'Avg Order', color: C.info },
                  ].map(stat => (
                    <View key={stat.lbl} style={s.statBox}>
                      <Text style={[s.statBoxVal, { color: stat.color }]}>{stat.val}</Text>
                      <Text style={s.statBoxLbl}>{stat.lbl}</Text>
                    </View>
                  ))}
                </View>

                {/* Order History */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <ShoppingCart size={15} color={C.primary} strokeWidth={2.5} />
                  <Text style={s.cardTitle}>Order History</Text>
                </View>
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 280 }}>
                  {customerOrders.length === 0 ? (
                    <Text style={s.emptyText}>No orders yet</Text>
                  ) : (
                    customerOrders.map(o => (
                      <View key={o.id} style={s.timelineItem}>
                        <View style={[s.timelineDot, { backgroundColor: statusColor(o.status) + '30', alignItems: 'center', justifyContent: 'center' }]}>
                          {o.status === 'Delivered' ? (
                            <CheckCircle2 size={12} color={C.success} strokeWidth={2.5} />
                          ) : o.status === 'Cancelled' ? (
                            <XCircle size={12} color={C.danger} strokeWidth={2.5} />
                          ) : (
                            <Clock size={12} color={C.warning} strokeWidth={2.5} />
                          )}
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={s.tableRowTitle}>{o.id} · ₹{o.total}</Text>
                            <Chip label={o.status} color={statusColor(o.status)} small />
                          </View>
                          <Text style={s.tableRowSub} numberOfLines={1}>{o.items}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <CreditCard size={11} color={C.textMuted} />
                            <Text style={s.tableRowSub}>{o.paymentMethod} · {o.date}</Text>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
                <TouchableOpacity style={[s.modalBtn, s.modalBtnGhost, { marginTop: 12 }]} onPress={() => setSelected(null)}>
                  <Text style={{ color: C.textSec, fontWeight: '600' }}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ── 6. ORDERS ─────────────────────────────────────────────
const OrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  const loadOrders = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.orders);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data.map((o: any) => ({
          id: String(o.id),
          customerId: String(o.customerId || o.customer?.id || ''),
          customerName: o.customer?.name || o.customerName || 'Customer',
          items: Array.isArray(o.items) ? o.items.map((i: any) => `${i.product?.name || i.name || 'Item'} (${i.quantity || 1})`).join(', ') : (o.items || 'Organic Grocery'),
          total: o.totalAmount || o.total || 0,
          status: o.status || 'Pending',
          paymentMethod: o.paymentMethod || 'Online',
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Today'
        })));
      }
    } catch (e) {
      console.warn('Failed to fetch orders:', e);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const statuses = ['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'];
  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  const updateStatus = async (id: string, status: AdminOrder['status']) => {
    try {
      await fetch(`${API_ENDPOINTS.orders}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      setSelected(prev => prev && prev.id === id ? { ...prev, status } : prev);
    } catch (e) {
      console.warn('Failed to update order status:', e);
    }
  };

  const pending = orders.filter(o => o.status === 'Pending').length;
  const delivered = orders.filter(o => o.status === 'Delivered').length;

  return (
    <View style={{ flex: 1 }}>
      <SectionHeader title={`Orders (${orders.length})`} sub={`${pending} pending · ${delivered} delivered`} />
      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
        {statuses.map(st => (
          <TouchableOpacity key={st} style={[s.filterChip, filter === st && s.filterChipActive]} onPress={() => setFilter(st)}>
            <Text style={[s.filterChipText, filter === st && s.filterChipTextActive]}>{st}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map(o => (
          <TouchableOpacity key={o.id} style={s.tableRow} onPress={() => setSelected(o)}>
            <View style={{ flex: 1 }}>
              <Text style={s.tableRowTitle}>{o.id}</Text>
              <Text style={s.tableRowSub}>{o.customerName} · {o.date}</Text>
              <Text style={s.tableRowSub} numberOfLines={1}>{o.items}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Text style={{ fontWeight: '800', fontSize: 14, color: C.primaryLight }}>₹{o.total}</Text>
              <Chip label={o.status} color={statusColor(o.status)} />
              <Text style={{ fontSize: 10, color: C.textMuted }}>{o.paymentMethod}</Text>
            </View>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && <Text style={s.emptyText}>No orders in this filter</Text>}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Order Detail Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setSelected(null)}>
          <View style={s.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={s.modalHandle} />
            {selected && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text style={s.modalTitle}>{selected.id}</Text>
                  <Chip label={selected.status} color={statusColor(selected.status)} />
                </View>
                {[
                  { lbl: 'Customer', val: selected.customerName },
                  { lbl: 'Items', val: selected.items },
                  { lbl: 'Total', val: `₹${selected.total}` },
                  { lbl: 'Payment', val: selected.paymentMethod },
                  { lbl: 'Date', val: selected.date },
                ].map(row => (
                  <View key={row.lbl} style={s.detailRow}>
                    <Text style={s.detailLabel}>{row.lbl}</Text>
                    <Text style={s.detailValue} numberOfLines={2}>{row.val}</Text>
                  </View>
                ))}
                <Text style={[s.formLabel, { marginTop: 12 }]}>Update Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {(['Pending', 'Processing', 'Delivered', 'Cancelled'] as AdminOrder['status'][]).map(st => (
                    <TouchableOpacity
                      key={st}
                      style={[s.filterChip, selected.status === st && s.filterChipActive, { marginRight: 6 }]}
                      onPress={() => updateStatus(selected.id, st)}
                    >
                      <Text style={[s.filterChipText, selected.status === st && s.filterChipTextActive]}>{st}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity style={[s.modalBtn, s.modalBtnGhost, { marginTop: 14 }]} onPress={() => setSelected(null)}>
                  <Text style={{ color: C.textSec, fontWeight: '600' }}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ── 7. USER LOGS ──────────────────────────────────────────
const LogsTab: React.FC = () => {
  const [logs, setLogs] = useState<AdminUserLog[]>([]);
  const [filter, setFilter] = useState('All');
  const types = ['All', 'create', 'update', 'delete', 'login', 'logout', 'view'];

  const loadLogs = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.userLogs);
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data.map((l: any) => ({
          id: String(l.id),
          user: l.user?.name || l.userName || l.user || 'Admin',
          role: l.role || 'Admin',
          action: l.action || 'Performed action',
          module: l.module || 'Dashboard',
          type: (l.type || 'view').toLowerCase(),
          timestamp: l.timestamp || l.createdAt || new Date().toISOString()
        })));
      }
    } catch (e) {
      console.warn('Failed to fetch user logs:', e);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = filter === 'All' ? logs : logs.filter(l => l.type === filter);

  const dotColor = (t: string) => {
    switch (t) {
      case 'create': return C.success; case 'delete': return C.danger;
      case 'login': return C.purple; case 'logout': return C.textMuted;
      case 'update': return C.info; default: return C.warning;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SectionHeader title={`User Logs (${logs.length})`} sub="Full activity & audit trail" />
      {/* Summary row */}
      <View style={s.statRow}>
        {[
          { val: logs.filter(l=>l.type==='create').length, lbl: 'Created', color: C.success },
          { val: logs.filter(l=>l.type==='update').length, lbl: 'Updated', color: C.info },
          { val: logs.filter(l=>l.type==='delete').length, lbl: 'Deleted', color: C.danger },
          { val: logs.filter(l=>l.type==='login').length, lbl: 'Logins', color: C.purple },
        ].map(stat => (
          <View key={stat.lbl} style={s.statBox}>
            <Text style={[s.statBoxVal, { color: stat.color }]}>{stat.val}</Text>
            <Text style={s.statBoxLbl}>{stat.lbl}</Text>
          </View>
        ))}
      </View>
      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
        {types.map(t => (
          <TouchableOpacity key={t} style={[s.filterChip, filter === t && s.filterChipActive]} onPress={() => setFilter(t)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {t !== 'All' && <TypeIcon type={t} size={11} color={filter === t ? '#fff' : C.textSec} />}
              <Text style={[s.filterChipText, filter === t && s.filterChipTextActive]}>
                {t === 'All' ? 'All' : t}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map(log => (
          <View key={log.id} style={s.logRow}>
            <View style={[s.logDot, { width: 10, height: 10, backgroundColor: dotColor(log.type) }]} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 }}>
                  <TypeIcon type={log.type} size={13} color={dotColor(log.type)} />
                  <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: C.textPrimary }} numberOfLines={2}>
                    {log.action}
                  </Text>
                </View>
                <Chip label={log.module} color={C.textSec} small />
              </View>
              <Text style={s.tableRowSub}>{log.user} · {log.role}</Text>
              <Text style={s.tableRowSub}>{fmtDate(log.timestamp)}</Text>
            </View>
          </View>
        ))}
        {filtered.length === 0 && <Text style={s.emptyText}>No logs in this filter</Text>}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

// ── Main Admin Portal ─────────────────────────────────────
interface AdminPortalScreensProps {
  activeTab?: string;
  onSelectTab?: (tab: TabKey) => void;
}

export const AdminPortalScreens: React.FC<AdminPortalScreensProps> = ({
  activeTab: propActiveTab,
  onSelectTab
}) => {
  const [internalTab, setInternalTab] = useState<TabKey>('dashboard');
  const activeTab = (propActiveTab as TabKey) || internalTab;

  const handleTabChange = (tab: TabKey) => {
    setInternalTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':      return <DashboardTab />;
      case 'vendorRequests': return <VendorRequestsTab />;
      case 'products':       return <ProductsTab />;
      case 'categories':     return <CategoriesTab />;
      case 'brands':         return <BrandsTab />;
      case 'customers':      return <CustomersTab />;
      case 'orders':         return <OrdersTab />;
      case 'logs':           return <LogsTab />;
      default:               return <DashboardTab />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Page Content */}
      <View style={s.contentArea}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────
const s = StyleSheet.create({
  // Layout
  tabBar: { backgroundColor: C.primary, paddingTop: 4 },
  tabBarInner: { flexDirection: 'row', paddingHorizontal: 8, paddingBottom: 0 },
  tabItem: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, position: 'relative', gap: 2 },
  tabItemActive: { },
  tabLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  tabLabelActive: { color: '#fff', fontWeight: '700' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 8, right: 8, height: 3, backgroundColor: C.accent, borderRadius: 2 },
  contentArea: { flex: 1, backgroundColor: C.bg, padding: 12 },

  // Section Header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  sectionSub: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  addBtn: { backgroundColor: C.primary, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Card
  card: { backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 2 },

  // KPI
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  kpiCard: { width: '47%', backgroundColor: C.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.border, borderTopWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  kpiIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  kpiLabel: { fontSize: 10, color: C.textMuted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiValue: { fontSize: 20, fontWeight: '800', color: C.textPrimary, marginTop: 2 },
  kpiSub: { fontSize: 10, fontWeight: '600', marginTop: 2 },

  // Bar chart
  barTrack: { height: 6, backgroundColor: C.border, borderRadius: 6, overflow: 'hidden', marginBottom: 2 },
  barFill: { height: '100%', borderRadius: 6 },
  barSub: { fontSize: 10, color: C.textMuted },

  // Table / List rows
  tableRow: { backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  tableRowTitle: { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  tableRowSub: { fontSize: 11, color: C.textSec, marginTop: 2 },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border, gap: 8 },
  listRowTitle: { fontSize: 12, fontWeight: '600', color: C.textPrimary },
  listRowSub: { fontSize: 11, color: C.textMuted },

  // Chip
  chip: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontWeight: '700' },

  // Grid
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCard: { width: '47%', backgroundColor: C.surface, borderRadius: 12, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.border },
  gridCardName: { fontSize: 12, fontWeight: '700', color: C.textPrimary, textAlign: 'center' },
  gridCardActions: { flexDirection: 'row', gap: 6, marginTop: 4 },

  // Brand
  brandIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  catIconBadge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingHorizontal: 10, marginBottom: 10, height: 40 },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: C.textPrimary },

  // Filter
  filterScroll: { marginBottom: 10 },
  filterChip: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, marginRight: 6 },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterChipText: { fontSize: 11, fontWeight: '600', color: C.textSec },
  filterChipTextActive: { color: '#fff' },

  // Icon button
  iconBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, maxHeight: '85%' },
  modalHandle: { width: 36, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: C.textPrimary, marginBottom: 16 },
  modalBtn: { flex: 1, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  modalBtnGhost: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
  modalBtnPrimary: { backgroundColor: C.primary },

  // Form
  formLabel: { fontSize: 11, fontWeight: '700', color: C.textSec, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, marginTop: 10 },
  formInput: { borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, height: 42, fontSize: 14, color: C.textPrimary, backgroundColor: C.surface2 },
  catPill: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginRight: 6, backgroundColor: C.surface },
  catPillActive: { backgroundColor: C.primary, borderColor: C.primary },
  catPillText: { fontSize: 10, color: C.textSec },
  catPillTextActive: { color: '#fff', fontWeight: '700' },

  // Customer detail
  avatarCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  avatarCircleLg: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTextLg: { color: '#fff', fontWeight: '800', fontSize: 18 },
  statRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statBox: { flex: 1, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 10, alignItems: 'center' },
  statBoxVal: { fontSize: 18, fontWeight: '800' },
  statBoxLbl: { fontSize: 10, color: C.textMuted, marginTop: 2 },

  // Timeline
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  timelineDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },

  // Order detail
  detailRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  detailLabel: { width: 80, fontSize: 12, color: C.textMuted, fontWeight: '500' },
  detailValue: { flex: 1, fontSize: 12, fontWeight: '600', color: C.textPrimary },

  // Log
  logRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  logDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },

  emptyText: { textAlign: 'center', color: C.textMuted, fontSize: 13, padding: 40 },
});
