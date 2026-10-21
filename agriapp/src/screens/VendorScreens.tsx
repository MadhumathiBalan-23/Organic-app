import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert, TextInput, Modal
} from 'react-native';
import { Product, MockProducts, MockDeliveries, Categories } from '../constants/mockData';

// ── Theme Palette for Vendor (Farmer Portal) ──────────────
const VC = {
  primary: '#064E3B',
  sub: '#047857',
  accent: '#10B981',
  accentLight: '#ECFDF5',
  bg: '#F0FDF4',
  cardBg: '#FFFFFF',
  border: '#A7F3D0',
  textPrimary: '#064E3B',
  textSec: '#047857',
  textMuted: '#059669',
  success: '#10B981',
  danger: '#EF4444',
  info: '#0284C7',
};

interface VendorScreensProps {
  triggerRefresh: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const VendorScreens: React.FC<VendorScreensProps> = ({
  triggerRefresh,
  activeTab: propActiveTab,
  onSelectTab
}) => {
  const [internalTab, setInternalTab] = useState<'dashboard' | 'crops' | 'orders' | 'harvests' | 'payouts'>('dashboard');
  const activeTab = (propActiveTab as any) || internalTab;

  const setActiveTab = (tab: any) => {
    setInternalTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  // Add Product Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pStock, setPStock] = useState('');
  const [pUnit, setPUnit] = useState('kg');
  const [pCategory, setPCategory] = useState(Categories[1]);

  const handlePublishCrop = () => {
    if (!pName || !pPrice || !pStock) {
      Alert.alert('Error', 'Please fill in all crop details.');
      return;
    }
    const newCrop: Product = {
      id: 'c_' + Date.now(),
      name: pName,
      category: pCategory,
      price: parseFloat(pPrice),
      unit: pUnit,
      rating: 5.0,
      stock: parseInt(pStock),
      minStock: 5,
      availabilityStart: '06:00 AM',
      availabilityEnd: '09:00 PM',
      description: 'Fresh organic harvest direct from farmer.',
      benefits: ['100% Pesticide Free', 'Fresh Daily Harvest'],
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
      subscriptionAllowed: true,
      oneTimeAllowed: true,
      organicCertified: true,
    };
    MockProducts.unshift(newCrop);
    triggerRefresh();
    setShowAddModal(false);
    setPName(''); setPPrice(''); setPStock('');
    Alert.alert('🎉 Published!', `${newCrop.name} is now live in the catalog!`);
  };

  // Mock Harvest Schedule data
  const [harvests] = useState([
    { id: 'h1', crop: 'Organic Tomatoes', expectedYield: '120 kg', harvestDate: '2026-10-02', status: 'Growing 🌿' },
    { id: 'h2', crop: 'Pure A2 Milk (Fresh Drop)', expectedYield: '250 L', harvestDate: '2026-09-28', status: 'Ready Tomorrow 🥛' },
    { id: 'h3', crop: 'Wild Forest Honey', expectedYield: '45 Jars', harvestDate: '2026-10-10', status: 'Maturing 🍯' },
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: VC.bg }}>
      {/* Top Tab Bar removed - Navigation is now driven exclusively by the sleek Sidebar Drawer */}

      {/* ── TAB 1: DASHBOARD ────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <ScrollView contentContainerStyle={vs.content}>
          {/* Executive Stats */}
          <View style={vs.statsRow}>
            <View style={[vs.statCard, { borderLeftColor: VC.accent }]}>
              <Text style={vs.statLabel}>MY CROPS LISTED</Text>
              <Text style={vs.statValue}>{MockProducts.length}</Text>
              <Text style={vs.statSub}>Active in catalog</Text>
            </View>
            <View style={[vs.statCard, { borderLeftColor: VC.success }]}>
              <Text style={vs.statLabel}>TOTAL EARNINGS</Text>
              <Text style={[vs.statValue, { color: VC.success }]}>₹48,250</Text>
              <Text style={vs.statSub}>+₹4,200 this week</Text>
            </View>
          </View>

          <View style={vs.statsRow}>
            <View style={[vs.statCard, { borderLeftColor: VC.info }]}>
              <Text style={vs.statLabel}>PENDING ORDERS</Text>
              <Text style={[vs.statValue, { color: VC.info }]}>{MockDeliveries.filter(d => d.status !== 'Delivered').length}</Text>
              <Text style={vs.statSub}>Ready to dispatch</Text>
            </View>
            <View style={[vs.statCard, { borderLeftColor: VC.danger }]}>
              <Text style={vs.statLabel}>LOW STOCK CROPS</Text>
              <Text style={[vs.statValue, { color: VC.danger }]}>{MockProducts.filter(p => p.stock <= p.minStock).length}</Text>
              <Text style={vs.statSub}>Needs restock</Text>
            </View>
          </View>

          {/* Action Bar */}
          <TouchableOpacity style={vs.addCropBarBtn} onPress={() => setShowAddModal(true)}>
            <Text style={vs.addCropBarBtnText}>+ Publish New Organic Crop</Text>
          </TouchableOpacity>

          {/* Recent Orders Preview */}
          <View style={vs.card}>
            <View style={vs.cardHeader}>
              <Text style={vs.cardTitle}>📦 Recent Incoming Orders</Text>
              <TouchableOpacity onPress={() => setActiveTab('orders')}>
                <Text style={{ fontSize: 12, color: VC.textMuted, fontWeight: '700' }}>View All →</Text>
              </TouchableOpacity>
            </View>
            {MockDeliveries.slice(0, 3).map((del) => (
              <View key={del.id} style={vs.orderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={vs.customerName}>{del.customerName}</Text>
                  <Text style={vs.orderProducts}>{del.products}</Text>
                </View>
                <View style={[vs.statusBadge, { backgroundColor: del.status === 'Delivered' ? '#DCFCE7' : '#FEF3C7' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: del.status === 'Delivered' ? VC.success : VC.accent }}>{del.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── TAB 2: MY CROPS INVENTORY ────────────────────────────── */}
      {activeTab === 'crops' && (
        <ScrollView contentContainerStyle={vs.content}>
          <TouchableOpacity style={vs.addCropBarBtn} onPress={() => setShowAddModal(true)}>
            <Text style={vs.addCropBarBtnText}>+ Add New Crop Harvest</Text>
          </TouchableOpacity>

          <View style={{ gap: 12 }}>
            {MockProducts.map((item) => (
              <View key={item.id} style={vs.cropCard}>
                <Image source={{ uri: item.imageUrl }} style={vs.cropImg} />
                <View style={{ flex: 1, padding: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={vs.cropName} numberOfLines={1}>{item.name}</Text>
                    <Text style={vs.cropPrice}>₹{item.price}/{item.unit}</Text>
                  </View>
                  <Text style={vs.cropCat}>{item.category}</Text>
                  <Text style={{ fontSize: 11, color: item.stock > 10 ? VC.success : VC.danger, fontWeight: '700', marginTop: 4 }}>
                    Stock: {item.stock} {item.unit}s {item.stock <= item.minStock ? '(Low Stock!)' : ''}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    {/* Stock adjustment */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <TouchableOpacity style={vs.qtyBtn} onPress={() => { if (item.stock > 0) item.stock--; triggerRefresh(); }}>
                        <Text style={vs.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={{ fontWeight: '800', fontSize: 14 }}>{item.stock}</Text>
                      <TouchableOpacity style={vs.qtyBtn} onPress={() => { item.stock++; triggerRefresh(); }}>
                        <Text style={vs.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Stock status pill toggle */}
                    <TouchableOpacity
                      style={[vs.pillToggle, { backgroundColor: item.stock > 0 ? '#DCFCE7' : '#FEE2E2' }]}
                      onPress={() => { item.stock = item.stock > 0 ? 0 : 20; triggerRefresh(); }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '700', color: item.stock > 0 ? VC.success : VC.danger }}>
                        {item.stock > 0 ? 'Active' : 'Out of Stock'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── TAB 3: DISPATCH & ORDERS ────────────────────────────── */}
      {activeTab === 'orders' && (
        <ScrollView contentContainerStyle={vs.content}>
          <Text style={vs.cardTitle}>Fulfillment & Dispatch Desk</Text>
          <View style={{ gap: 12, marginTop: 10 }}>
            {MockDeliveries.map((del) => (
              <View key={del.id} style={vs.dispatchCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={vs.customerName}>{del.customerName}</Text>
                    <Text style={vs.orderProducts}>{del.products}</Text>
                    <Text style={{ fontSize: 11, color: VC.textSec, marginTop: 4 }}>📍 {del.address}</Text>
                    <Text style={{ fontSize: 11, color: VC.textMuted, marginTop: 2 }}>🕐 Delivery Slot: {del.deliveryTime}</Text>
                  </View>
                  <View style={[vs.statusBadge, { backgroundColor: del.status === 'Delivered' ? '#DCFCE7' : del.status === 'Shipped' ? '#DBEAFE' : '#FEF3C7' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: del.status === 'Delivered' ? VC.success : del.status === 'Shipped' ? VC.info : VC.accent }}>{del.status}</Text>
                  </View>
                </View>

                {del.status !== 'Delivered' && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    {del.status === 'Pending' && (
                      <TouchableOpacity style={[vs.actionBtn, { backgroundColor: VC.info }]} onPress={() => { del.status = 'Shipped'; triggerRefresh(); Alert.alert('Shipped!', 'Marked order as SHIPPED.'); }}>
                        <Text style={vs.actionBtnText}>🚀 Mark Shipped</Text>
                      </TouchableOpacity>
                    )}
                    {del.status === 'Shipped' && (
                      <TouchableOpacity style={[vs.actionBtn, { backgroundColor: VC.success }]} onPress={() => { del.status = 'Delivered'; triggerRefresh(); Alert.alert('Delivered!', 'Order marked DELIVERED!'); }}>
                        <Text style={vs.actionBtnText}>✓ Mark Delivered</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── TAB 4: HARVEST SCHEDULE ────────────────────────────── */}
      {activeTab === 'harvests' && (
        <ScrollView contentContainerStyle={vs.content}>
          <Text style={vs.cardTitle}>🌱 Crop Harvest Tracker</Text>
          <Text style={{ fontSize: 12, color: VC.textSec, marginBottom: 14 }}>Track upcoming yield estimates and harvest dates for seamless supply planning.</Text>

          {harvests.map(h => (
            <View key={h.id} style={vs.harvestCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={vs.cropName}>{h.crop}</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: VC.textMuted }}>{h.status}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: VC.textSec }}>Est. Yield: <Text style={{ fontWeight: '800', color: VC.textPrimary }}>{h.expectedYield}</Text></Text>
                <Text style={{ fontSize: 12, color: VC.textSec }}>Harvest Date: <Text style={{ fontWeight: '800', color: VC.textPrimary }}>{h.harvestDate}</Text></Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── TAB 5: PAYOUTS ────────────────────────────────────── */}
      {activeTab === 'payouts' && (
        <ScrollView contentContainerStyle={vs.content}>
          <View style={vs.payoutBanner}>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: 1 }}>NEXT AUTOMATED PAYOUT</Text>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#FFF', marginVertical: 4 }}>₹14,600</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Scheduled for Monday, Oct 2nd · HDFC Bank **** 4892</Text>
          </View>

          <Text style={vs.cardTitle}>Payout History</Text>
          {[
            { date: '2026-09-21', amt: '₹18,450', status: 'Transfer Completed', ref: 'PAY_98124' },
            { date: '2026-09-14', amt: '₹15,200', status: 'Transfer Completed', ref: 'PAY_87123' },
            { date: '2026-09-07', amt: '₹12,800', status: 'Transfer Completed', ref: 'PAY_76120' },
          ].map(p => (
            <View key={p.ref} style={vs.payoutRow}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: VC.textPrimary }}>{p.amt}</Text>
                <Text style={{ fontSize: 11, color: VC.textMuted, marginTop: 2 }}>Ref: {p.ref} · {p.date}</Text>
              </View>
              <Text style={{ fontSize: 11, color: VC.success, fontWeight: '700' }}>✓ {p.status}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── ADD CROP MODAL ──────────────────────────────────────── */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={vs.modalBg}>
          <View style={vs.modalSheet}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: VC.textPrimary }}>Publish New Crop</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}><Text style={{ fontSize: 18, color: VC.textMuted }}>✕</Text></TouchableOpacity>
            </View>

            <Text style={vs.fieldLabel}>Crop Name</Text>
            <TextInput style={vs.input} placeholder="e.g. Organic Sweet Corn" value={pName} onChangeText={setPName} placeholderTextColor="#94A3B8" />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={vs.fieldLabel}>Price (₹)</Text>
                <TextInput style={vs.input} placeholder="60" keyboardType="number-pad" value={pPrice} onChangeText={setPPrice} placeholderTextColor="#94A3B8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={vs.fieldLabel}>Stock Qty</Text>
                <TextInput style={vs.input} placeholder="50" keyboardType="number-pad" value={pStock} onChangeText={setPStock} placeholderTextColor="#94A3B8" />
              </View>
            </View>

            <Text style={vs.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginVertical: 8 }}>
              {Categories.filter(c => c !== 'All').map(c => (
                <TouchableOpacity key={c} style={[vs.catPill, pCategory === c && vs.catPillActive]} onPress={() => setPCategory(c)}>
                  <Text style={[vs.catPillText, pCategory === c && vs.catPillTextActive]}>{c.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={vs.publishBtn} onPress={handlePublishCrop}>
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>Publish Crop to Market</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const vs = StyleSheet.create({
  tabBar: { backgroundColor: VC.primary, paddingVertical: 10, flexGrow: 0 },
  tabBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)' },
  tabBtnActive: { backgroundColor: VC.accent },
  tabText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  tabTextActive: { color: VC.primary },
  content: { padding: 16 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: VC.cardBg, borderRadius: 12, padding: 12, borderLeftWidth: 4, borderWidth: 1, borderColor: VC.border },
  statLabel: { fontSize: 9, fontWeight: '800', color: VC.textSec, letterSpacing: 0.5 },
  statValue: { fontSize: 20, fontWeight: '900', color: VC.textPrimary, marginVertical: 2 },
  statSub: { fontSize: 10, color: VC.textMuted },

  // Action
  addCropBarBtn: { backgroundColor: VC.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 14 },
  addCropBarBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  // Card
  card: { backgroundColor: VC.cardBg, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: VC.border, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: VC.textPrimary },
  orderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: VC.border },
  customerName: { fontSize: 13, fontWeight: '700', color: VC.textPrimary },
  orderProducts: { fontSize: 11, color: VC.textSec, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },

  // Crops
  cropCard: { flexDirection: 'row', backgroundColor: VC.cardBg, borderRadius: 14, borderWidth: 1, borderColor: VC.border, overflow: 'hidden' },
  cropImg: { width: 90, height: 100, backgroundColor: VC.border },
  cropName: { fontSize: 13, fontWeight: '800', color: VC.textPrimary, flex: 1 },
  cropPrice: { fontSize: 13, fontWeight: '800', color: VC.primary },
  cropCat: { fontSize: 10, color: VC.textMuted },
  qtyBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: VC.bg, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: VC.primary },
  pillToggle: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },

  // Dispatch
  dispatchCard: { backgroundColor: VC.cardBg, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: VC.border },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  // Harvest
  harvestCard: { backgroundColor: VC.cardBg, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: VC.border, marginBottom: 10 },

  // Payouts
  payoutBanner: { backgroundColor: VC.primary, borderRadius: 16, padding: 20, marginBottom: 16 },
  payoutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: VC.cardBg, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: VC.border, marginBottom: 8 },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: VC.cardBg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: VC.textPrimary, marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: VC.bg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: VC.textPrimary, borderWidth: 1, borderColor: VC.border },
  catPill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: VC.border, marginRight: 8, backgroundColor: VC.bg },
  catPillActive: { backgroundColor: VC.primary, borderColor: VC.primary },
  catPillText: { fontSize: 11, color: VC.textSec, fontWeight: '600' },
  catPillTextActive: { color: '#FFF', fontWeight: '800' },
  publishBtn: { backgroundColor: VC.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
});
