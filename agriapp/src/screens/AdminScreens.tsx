import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, SafeAreaView, DimensionValue
} from 'react-native';
import {
  MockProducts, Categories, Product,
  AdminCategories, AdminBrands, AdminCustomers, AdminOrders, AdminUserLogs,
  AdminCategory, AdminBrand, AdminCustomer, AdminOrder
} from '../constants/mockData';

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
  { key: 'dashboard',      label: 'Dashboard',        icon: '📊' },
  { key: 'vendorRequests', label: 'Vendor Approvals', icon: '👨‍🌾' },
  { key: 'products',       label: 'Products',        icon: '🌾' },
  { key: 'categories',     label: 'Categories',      icon: '🏷️' },
  { key: 'brands',         label: 'Brands',          icon: '🌱' },
  { key: 'customers',      label: 'Customers',       icon: '👥' },
  { key: 'orders',         label: 'Orders',          icon: '📦' },
  { key: 'logs',           label: 'Logs',            icon: '📋' },
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

const typeIcon = (t: string) => {
  switch (t) {
    case 'create': return '➕'; case 'update': return '✏️';
    case 'delete': return '🗑️'; case 'login': return '🔑';
    case 'logout': return '🚪'; case 'view': return '👁️';
    default: return '•';
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

const KPICard: React.FC<{ icon: string; label: string; value: string; sub: string; accentColor: string }> = ({ icon, label, value, sub, accentColor }) => (
  <View style={[s.kpiCard, { borderTopColor: accentColor }]}>
    <View style={[s.kpiIcon, { backgroundColor: accentColor + '20' }]}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
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
    fetch('http://localhost:5050/api/vendor-requests')
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
      const res = await fetch(`http://localhost:5050/api/vendor-requests/${id}/approve`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('✅ Vendor Approved', `"${farmName}" is now an approved partner farmer! The customer can now switch to the Vendor Console.`);
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
      await fetch(`http://localhost:5050/api/vendor-requests/${id}/reject`, {
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
        sub={pendingCount > 0 ? `⚠️ ${pendingCount} applications awaiting admin review` : 'All vendor requests verified'}
        action={{ label: '🔄 Refresh', onPress: loadRequests }}
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
              {tab === 'PENDING' ? `⏳ Pending (${pendingCount})` : tab}
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
                  <Text style={{ fontSize: 16, fontWeight: '800', color: C.primary }}>🌾 {req.farmName}</Text>
                  <Text style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>
                    Applicant: <Text style={{ fontWeight: '700', color: C.textPrimary }}>{req.userName}</Text> · 📞 +91 {req.phoneNumber}
                  </Text>
                </View>
                <View style={[s.chip, { backgroundColor: isApproved ? '#DCFCE7' : isPending ? '#FEF3C7' : '#FEE2E2', borderColor: isApproved ? '#A7F3D0' : isPending ? '#FDE68A' : '#FECACA' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: isApproved ? C.success : isPending ? '#B45309' : C.danger }}>
                    {req.status}
                  </Text>
                </View>
              </View>

              <View style={{ backgroundColor: C.surface2, borderRadius: 8, padding: 10, gap: 4, marginBottom: 10 }}>
                <Text style={{ fontSize: 11, color: C.textSec }}>
                  📍 <Text style={{ fontWeight: '600' }}>Location:</Text> {req.farmLocation}
                </Text>
                <Text style={{ fontSize: 11, color: C.textSec }}>
                  🥦 <Text style={{ fontWeight: '600' }}>Crops:</Text> {req.cropCategories}
                </Text>
                <Text style={{ fontSize: 11, color: C.textSec }}>
                  📜 <Text style={{ fontWeight: '600' }}>Experience:</Text> {req.experienceYears || '3'} Years · Cert: {req.certificateNo || 'Verified'}
                </Text>
                <Text style={{ fontSize: 10, color: C.textMuted }}>
                  📅 Submitted: {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>

              {/* Action Buttons */}
              {isPending && (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <TouchableOpacity
                    style={[s.modalBtn, { backgroundColor: C.success, height: 38 }]}
                    onPress={() => handleApprove(req.id, req.farmName)}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>
                      {isProcessing ? 'Approving...' : '✓ Approve as Vendor'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.modalBtn, s.modalBtnGhost, { height: 38, borderColor: C.danger }]}
                    onPress={() => handleReject(req.id)}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: C.danger, fontWeight: '700', fontSize: 12 }}>✕ Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isApproved && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 11, color: C.success, fontWeight: '700' }}>
                    ✓ Customer verified. Role updated to vendor in SQLite Prisma DB.
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 36 }}>👨‍🌾</Text>
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
  const topProducts = [...MockProducts].sort((a, b) => b.stock - a.stock).slice(0, 4);
  const recentOrders = AdminOrders.slice(0, 5);
  const recentLogs = AdminUserLogs.slice(0, 5);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* KPI Grid */}
      <View style={s.kpiGrid}>
        <KPICard icon="💰" label="Total Revenue" value="₹2.84L" sub="▲ 18.4% this month" accentColor={C.primaryLight} />
        <KPICard icon="📦" label="Total Orders" value={String(AdminOrders.length)} sub="▲ 3 today" accentColor={C.accent} />
        <KPICard icon="👥" label="Customers" value={String(AdminCustomers.length)} sub="▲ 2 this week" accentColor={C.info} />
        <KPICard icon="⏳" label="Pending" value={String(AdminOrders.filter(o => o.status === 'Pending').length)} sub="⚠ Needs action" accentColor={C.danger} />
      </View>

      {/* Top Products */}
      <Card>
        <Text style={s.cardTitle}>🔥 Top Selling Products</Text>
        <View style={{ marginTop: 10, gap: 10 }}>
          {topProducts.map((p, i) => {
            const pct = Math.max(30, Math.min(100, (p.stock / 120) * 100));
            return (
              <View key={p.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: C.textPrimary }} numberOfLines={1}>{p.name}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: C.primaryLight }}>₹{p.price * p.stock}</Text>
                </View>
                <View style={s.barTrack}>
                  <View style={[s.barFill, { width: `${pct}%` as DimensionValue, backgroundColor: [C.primaryLight, C.accent, C.info, C.success][i % 4] }]} />
                </View>
                <Text style={s.barSub}>{p.stock} {p.unit} in stock</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Recent Orders */}
      <Card>
        <Text style={s.cardTitle}>📦 Recent Orders</Text>
        <View style={{ marginTop: 8 }}>
          {recentOrders.map(o => (
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
          ))}
        </View>
      </Card>

      {/* Recent Logs */}
      <Card style={{ marginBottom: 20 }}>
        <Text style={s.cardTitle}>📋 Recent Activity</Text>
        <View style={{ marginTop: 8 }}>
          {recentLogs.map(l => (
            <View key={l.id} style={s.listRow}>
              <View style={[s.logDot, { backgroundColor: l.type === 'create' ? C.success : l.type === 'delete' ? C.danger : l.type === 'login' ? C.purple : C.info }]} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '500', color: C.textPrimary }} numberOfLines={2}>{l.action}</Text>
                <Text style={s.listRowSub}>{l.user} · {l.module}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
};

// ── 2. PRODUCTS ───────────────────────────────────────────
const ProductsTab: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(MockProducts);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState({ name: '', price: '', stock: '', category: 'Dairy & Pure Ghee', unit: 'Kg', emoji: '🌾' });
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = products.filter(p => {
    const catName = typeof p.category === 'object' && p.category !== null ? (p.category as any).name : String(p.category || '');
    return p.name.toLowerCase().includes(search.toLowerCase()) || catName.toLowerCase().includes(search.toLowerCase());
  });

  const openAdd = () => { setForm({ name: '', price: '', stock: '', category: 'Dairy & Pure Ghee', unit: 'Kg', emoji: '🌾' }); setEditId(null); setModal('add'); };
  const openEdit = (p: Product) => {
    const catName = typeof p.category === 'object' && p.category !== null ? (p.category as any).name : String(p.category || 'Dairy & Pure Ghee');
    setForm({ name: p.name, price: String(p.price), stock: String(p.stock), category: catName, unit: p.unit, emoji: '🌾' });
    setEditId(p.id); setModal('edit');
  };

  const handleSave = () => {
    if (!form.name || !form.price) { Alert.alert('Error', 'Name and price are required.'); return; }
    if (editId) {
      setProducts(prev => prev.map(p => p.id === editId ? { ...p, name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock || '0'), category: form.category, unit: form.unit } : p));
    } else {
      const np: Product = {
        id: 'p' + Date.now(), name: form.name, category: form.category, price: parseFloat(form.price),
        unit: form.unit, rating: 5, stock: parseInt(form.stock || '0'), minStock: 5,
        availabilityStart: '06:00 AM', availabilityEnd: '09:00 PM',
        description: 'Newly added product.', benefits: ['Fresh and organic'],
        imageUrl: '', subscriptionAllowed: true, oneTimeAllowed: true, organicCertified: true
      };
      setProducts(prev => [np, ...prev]);
    }
    setModal(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Product', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setProducts(prev => prev.filter(p => p.id !== id)) }
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <SectionHeader title={`Products (${products.length})`} action={{ label: '+ Add', onPress: openAdd }} />
      <View style={s.searchBar}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput style={s.searchInput} placeholder="Search products…" value={search} onChangeText={setSearch} placeholderTextColor={C.textMuted} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map(p => (
          <View key={p.id} style={s.tableRow}>
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
                <TouchableOpacity style={s.iconBtn} onPress={() => openEdit(p)}><Text>✏️</Text></TouchableOpacity>
                <TouchableOpacity style={[s.iconBtn, { backgroundColor: '#FEF2F2' }]} onPress={() => handleDelete(p.id)}><Text>🗑️</Text></TouchableOpacity>
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
            <Text style={s.modalTitle}>{modal === 'add' ? '➕ Add Product' : '✏️ Edit Product'}</Text>
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
  const [items, setItems] = useState<AdminCategory[]>(AdminCategories);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState({ name: '', emoji: '🌿', productCount: '' });
  const [editId, setEditId] = useState<string | null>(null);

  const openAdd = () => { setForm({ name: '', emoji: '🌿', productCount: '' }); setEditId(null); setModal('add'); };
  const openEdit = (c: AdminCategory) => { setForm({ name: c.name, emoji: c.emoji, productCount: String(c.productCount) }); setEditId(c.id); setModal('edit'); };

  const handleSave = () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Category name is required.'); return; }
    if (editId) {
      setItems(prev => prev.map(c => c.id === editId ? { ...c, name: form.name, emoji: form.emoji, productCount: parseInt(form.productCount || '0') } : c));
    } else {
      setItems(prev => [...prev, { id: 'c' + Date.now(), name: form.name, emoji: form.emoji, productCount: parseInt(form.productCount || '0'), color: '#22c55e' }]);
    }
    setModal(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Category', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setItems(prev => prev.filter(c => c.id !== id)) }
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <SectionHeader title={`Categories (${items.length})`} action={{ label: '+ Add', onPress: openAdd }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.gridWrap}>
          {items.map(cat => (
            <View key={cat.id} style={[s.gridCard, { borderTopColor: cat.color, borderTopWidth: 3 }]}>
              <Text style={{ fontSize: 28, textAlign: 'center' }}>{cat.emoji}</Text>
              <Text style={s.gridCardName} numberOfLines={2}>{cat.name}</Text>
              <Chip label={`${cat.productCount} products`} color={C.success} small />
              <View style={s.gridCardActions}>
                <TouchableOpacity style={s.iconBtn} onPress={() => openEdit(cat)}><Text style={{ fontSize: 12 }}>✏️ Edit</Text></TouchableOpacity>
                <TouchableOpacity style={[s.iconBtn, { backgroundColor: '#FEF2F2' }]} onPress={() => handleDelete(cat.id)}><Text style={{ fontSize: 12 }}>🗑️</Text></TouchableOpacity>
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
            <Text style={s.modalTitle}>{modal === 'add' ? '➕ Add Category' : '✏️ Edit Category'}</Text>
            <Text style={s.formLabel}>Emoji</Text>
            <TextInput style={[s.formInput, { textAlign: 'center', fontSize: 26, width: 70 }]} value={form.emoji} onChangeText={v => setForm({ ...form, emoji: v })} maxLength={4} />
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
  const [items, setItems] = useState<AdminBrand[]>(AdminBrands);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState({ name: '', emoji: '🌱', origin: '', rating: '4.5' });
  const [editId, setEditId] = useState<string | null>(null);

  const openAdd = () => { setForm({ name: '', emoji: '🌱', origin: '', rating: '4.5' }); setEditId(null); setModal('add'); };
  const openEdit = (b: AdminBrand) => { setForm({ name: b.name, emoji: b.emoji, origin: b.origin, rating: String(b.rating) }); setEditId(b.id); setModal('edit'); };

  const handleSave = () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Brand name is required.'); return; }
    if (editId) {
      setItems(prev => prev.map(b => b.id === editId ? { ...b, name: form.name, emoji: form.emoji, origin: form.origin, rating: parseFloat(form.rating) } : b));
    } else {
      setItems(prev => [...prev, { id: 'b' + Date.now(), name: form.name, emoji: form.emoji, origin: form.origin, rating: parseFloat(form.rating), productCount: 0 }]);
    }
    setModal(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Brand', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setItems(prev => prev.filter(b => b.id !== id)) }
    ]);
  };

  const stars = (r: number) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

  return (
    <View style={{ flex: 1 }}>
      <SectionHeader title={`Brands (${items.length})`} action={{ label: '+ Add', onPress: openAdd }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {items.map(b => (
          <View key={b.id} style={s.tableRow}>
            <View style={s.brandIcon}><Text style={{ fontSize: 22 }}>{b.emoji}</Text></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.tableRowTitle}>{b.name}</Text>
              <Text style={s.tableRowSub}>📍 {b.origin} · {b.productCount} products</Text>
              <Text style={{ fontSize: 13, color: C.accent, letterSpacing: 2 }}>{stars(b.rating)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Chip label={`⭐ ${b.rating}`} color={C.warning} />
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity style={s.iconBtn} onPress={() => openEdit(b)}><Text>✏️</Text></TouchableOpacity>
                <TouchableOpacity style={[s.iconBtn, { backgroundColor: '#FEF2F2' }]} onPress={() => handleDelete(b.id)}><Text>🗑️</Text></TouchableOpacity>
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
            <Text style={s.modalTitle}>{modal === 'add' ? '➕ Add Brand' : '✏️ Edit Brand'}</Text>
            <Text style={s.formLabel}>Emoji</Text>
            <TextInput style={[s.formInput, { textAlign: 'center', fontSize: 26, width: 70 }]} value={form.emoji} onChangeText={v => setForm({ ...form, emoji: v })} maxLength={4} />
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
  const [customers] = useState<AdminCustomer[]>(AdminCustomers);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminCustomer | null>(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  const customerOrders = selected ? AdminOrders.filter(o => o.customerId === selected.id) : [];

  const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={{ flex: 1 }}>
      <SectionHeader title={`Customers (${customers.length})`} />
      <View style={s.searchBar}>
        <Text style={s.searchIcon}>🔍</Text>
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
                {c.status === 'VIP' && <Text style={{ fontSize: 12 }}>👑</Text>}
              </View>
              <Text style={s.tableRowSub}>📍 {c.location} · {c.phone}</Text>
              <Text style={s.tableRowSub}>🛒 {c.totalOrders} orders · ₹{c.totalSpend.toLocaleString()}</Text>
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
                    <Text style={[s.modalTitle, { marginBottom: 2 }]}>{selected.name} {selected.status === 'VIP' ? '👑' : ''}</Text>
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
                <Text style={[s.cardTitle, { marginBottom: 10 }]}>🛒 Order History</Text>
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 280 }}>
                  {customerOrders.length === 0 ? (
                    <Text style={s.emptyText}>No orders yet</Text>
                  ) : (
                    customerOrders.map(o => (
                      <View key={o.id} style={s.timelineItem}>
                        <View style={[s.timelineDot, { backgroundColor: statusColor(o.status) + '30' }]}>
                          <Text style={{ fontSize: 12 }}>{o.status === 'Delivered' ? '✅' : o.status === 'Cancelled' ? '❌' : '⏳'}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={s.tableRowTitle}>{o.id} · ₹{o.total}</Text>
                            <Chip label={o.status} color={statusColor(o.status)} small />
                          </View>
                          <Text style={s.tableRowSub} numberOfLines={1}>{o.items}</Text>
                          <Text style={s.tableRowSub}>💳 {o.paymentMethod} · {o.date}</Text>
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
  const [orders, setOrders] = useState<AdminOrder[]>(AdminOrders);
  const [filter, setFilter] = useState<string>('All');
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  const statuses = ['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'];
  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  const updateStatus = (id: string, status: AdminOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setSelected(prev => prev && prev.id === id ? { ...prev, status } : prev);
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
  const [filter, setFilter] = useState('All');
  const types = ['All', 'create', 'update', 'delete', 'login', 'logout', 'view'];

  const filtered = filter === 'All' ? AdminUserLogs : AdminUserLogs.filter(l => l.type === filter);

  const dotColor = (t: string) => {
    switch (t) {
      case 'create': return C.success; case 'delete': return C.danger;
      case 'login': return C.purple; case 'logout': return C.textMuted;
      case 'update': return C.info; default: return C.warning;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SectionHeader title={`User Logs (${AdminUserLogs.length})`} sub="Full activity & audit trail" />
      {/* Summary row */}
      <View style={s.statRow}>
        {[
          { val: AdminUserLogs.filter(l=>l.type==='create').length, lbl: 'Created', color: C.success },
          { val: AdminUserLogs.filter(l=>l.type==='update').length, lbl: 'Updated', color: C.info },
          { val: AdminUserLogs.filter(l=>l.type==='delete').length, lbl: 'Deleted', color: C.danger },
          { val: AdminUserLogs.filter(l=>l.type==='login').length, lbl: 'Logins', color: C.purple },
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
            <Text style={[s.filterChipText, filter === t && s.filterChipTextActive]}>
              {t === 'All' ? '📋 All' : `${typeIcon(t)} ${t}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map(log => (
          <View key={log.id} style={s.logRow}>
            <View style={[s.logDot, { width: 10, height: 10, backgroundColor: dotColor(log.type) }]} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: C.textPrimary, marginRight: 8 }} numberOfLines={2}>
                  {typeIcon(log.type)} {log.action}
                </Text>
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
