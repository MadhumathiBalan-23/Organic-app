import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert, TextInput, Modal, SafeAreaView,
  ActivityIndicator
} from 'react-native';
import {
  Search, X, ShoppingCart, Package, Repeat, MessageSquare, Phone,
  ShieldCheck, Award, MapPin, CreditCard, Smartphone, Landmark,
  Briefcase, Clock, Calendar, Pencil, LogOut, Sprout, Check,
  CircleCheck, Sparkles, Star, Leaf, Droplets,
  Apple, Wheat, Milk, ChevronRight, Zap, Gift, User, Store,
  Truck, Trash, Plus, Minus, Mail, FileText
} from 'lucide-react-native';
import { Product } from '../constants/mockData';
import { API_ENDPOINTS } from '../services/api';

// ── Colour Palette ───────────────────────────────────────
const C = {
  primary: '#0D2B1D', light: '#2D6A4F', accent: '#D4AC0D',
  bg: '#F0F4F1', surface: '#FFFFFF', surface2: '#F7FAF8',
  border: '#E2EBE6', textPrimary: '#1a1a2e', textSec: '#5a6a63',
  textMuted: '#9aada6', success: '#22c55e', warning: '#f59e0b',
  danger: '#ef4444', info: '#3b82f6',
};

// Safe helper to extract category string regardless of object vs string
const safeCategory = (cat: any): string => {
  if (!cat) return 'Organic';
  if (typeof cat === 'string') return cat;
  if (typeof cat === 'object' && cat.name) return String(cat.name);
  return String(cat);
};

interface CustomerScreensProps {
  customerScreen: string;
  setCustomerScreen: (screen: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedProduct: Product;
  setSelectedProduct: (p: Product) => void;
  activeSubscriptionData: any;
  setActiveSubscriptionData: (d: any) => void;
  subscriptions: any[];
  setSubscriptions: React.Dispatch<React.SetStateAction<any[]>>;
  handleLogout: () => void;
  userPhone?: string;
  isApprovedVendor?: boolean;
  vendorApplicationStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  onRefreshVendorStatus?: () => void;
  onSwitchToVendor?: () => void;
}

// ── Shared mini components ────────────────────────────────
const BackBtn: React.FC<{ onPress: () => void; label?: string }> = ({ onPress, label = '← Back' }) => (
  <TouchableOpacity onPress={onPress} style={cs.backBtn}>
    <Text style={cs.backBtnText}>{label}</Text>
  </TouchableOpacity>
);

const SectionTitle: React.FC<{ children: string; action?: { label: string; onPress: () => void } }> = ({ children, action }) => (
  <View style={cs.sectionTitleRow}>
    <Text style={cs.sectionTitle}>{children}</Text>
    {action && <TouchableOpacity onPress={action.onPress}><Text style={cs.seeAll}>{action.label}</Text></TouchableOpacity>}
  </View>
);

export const CustomerScreens: React.FC<CustomerScreensProps> = ({
  customerScreen, setCustomerScreen,
  searchQuery, setSearchQuery,
  selectedProduct, setSelectedProduct,
  activeSubscriptionData, setActiveSubscriptionData,
  subscriptions, setSubscriptions,
  handleLogout,
  userPhone,
  isApprovedVendor = false,
  vendorApplicationStatus = 'NONE',
  onRefreshVendorStatus,
  onSwitchToVendor,
}) => {
  // Vendor Application State in Profile
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vFarmName, setVFarmName] = useState('');
  const [vFarmLocation, setVFarmLocation] = useState('Salem, Tamil Nadu');
  const [vCropCategories, setVCropCategories] = useState('Organic Vegetables & A2 Dairy');
  const [vExperience, setVExperience] = useState('4');
  const [vCertNo, setVCertNo] = useState('TN-ORG-2026-9042');
  const [isSubmittingVendor, setIsSubmittingVendor] = useState(false);
  const [vApplyError, setVApplyError] = useState<string | null>(null);

  const handleApplyVendor = async () => {
    setVApplyError(null);
    if (!vFarmName.trim()) {
      setVApplyError('Please enter your Farm or Business Name.');
      return;
    }
    if (!vFarmLocation.trim()) {
      setVApplyError('Please enter your Farm Location / District.');
      return;
    }

    setIsSubmittingVendor(true);
    try {
      const res = await fetch(API_ENDPOINTS.vendorRequests, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: userPhone || '9876543210',
          userName: 'Ananya Sharma',
          farmName: vFarmName.trim(),
          farmLocation: vFarmLocation.trim(),
          cropCategories: vCropCategories.trim() || 'Fresh Organic Vegetables & Dairy',
          experienceYears: vExperience.trim() || '3',
          certificateNo: vCertNo.trim() || 'TN-ORG-2026-9042',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowVendorModal(false);
        if (onRefreshVendorStatus) onRefreshVendorStatus();
        Alert.alert('Request Submitted!', 'Your vendor application has been sent to Admin for review. Once approved, the Vendor Console and crop publisher will be unlocked.');
      } else {
        setVApplyError(data.message || 'Submission failed. Please try again.');
      }
    } catch {
      setShowVendorModal(false);
      if (onRefreshVendorStatus) onRefreshVendorStatus();
      Alert.alert('Request Recorded', 'Your request has been saved. Admin will review and verify your farm.');
    } finally {
      setIsSubmittingVendor(false);
    }
  };

  // ── Customer Profile State ──────────────────────────────────
  const [profileName, setProfileName] = useState('Ananya Sharma');
  const [profileEmail, setProfileEmail] = useState('ananya.sharma@mathira.org');
  const [profileLocation, setProfileLocation] = useState('Flat 402, Green Valley Apts, Indiranagar, Bangalore - 560038');
  const [profileStats, setProfileStats] = useState({ orders: 0, subs: subscriptions.length, spent: 0, points: 0 });
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState('Ananya Sharma');
  const [editEmail, setEditEmail] = useState('ananya.sharma@mathira.org');
  const [editLocation, setEditLocation] = useState('Flat 402, Green Valley Apts, Indiranagar, Bangalore - 560038');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const cleanPhone = (userPhone || '9876543210').replace(/[^0-9]/g, '');
    if (!cleanPhone) return;
    fetch(API_ENDPOINTS.userProfile(cleanPhone))
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          if (json.data.fullName) {
            setProfileName(json.data.fullName);
            setEditName(json.data.fullName);
          }
          if (json.data.email) {
            setProfileEmail(json.data.email);
            setEditEmail(json.data.email);
          }
          if (json.data.location) {
            setProfileLocation(json.data.location);
            setEditLocation(json.data.location);
          }
          setProfileStats({
            orders: json.data.totalOrders || 0,
            subs: json.data.activeSubscriptions || subscriptions.length,
            spent: json.data.totalSpend || 0,
            points: json.data.loyaltyPoints || 0,
          });
        }
      })
      .catch(() => {});
  }, [userPhone, customerScreen]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setSaveSuccessMsg(null);
    try {
      const cleanPhone = (userPhone || '9876543210').replace(/[^0-9]/g, '');
      const res = await fetch(API_ENDPOINTS.userProfile(cleanPhone), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editName.trim() || 'Ananya Sharma',
          email: editEmail.trim() || 'ananya.sharma@mathira.org',
          location: editLocation.trim() || 'Indiranagar, Bangalore'
        })
      });
      const data = await res.json();
      if (data.success) {
        setProfileName(editName.trim());
        setProfileEmail(editEmail.trim());
        setProfileLocation(editLocation.trim());
        setSaveSuccessMsg('Profile updated successfully!');
        setTimeout(() => {
          setShowEditProfileModal(false);
          setSaveSuccessMsg(null);
        }, 800);
      }
    } catch {
      setProfileName(editName.trim());
      setProfileEmail(editEmail.trim());
      setProfileLocation(editLocation.trim());
      setShowEditProfileModal(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');

  // Screen specific top-level state hooks (Rules of Hooks compliant)
  const [detailQty, setDetailQty] = useState(1);
  const [subQty, setSubQty] = useState(1);
  const [subFreq, setSubFreq] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [subTime, setSubTime] = useState('06:30 AM');
  const [subDuration, setSubDuration] = useState(30);
  const [gateway, setGateway] = useState('UPI');
  const [subTab, setSubTab] = useState<'Active' | 'History'>('Active');

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (p: Product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === p.id);
      if (existing) return prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { product: p, qty }];
    });
    Alert.alert('Added to Cart', `${p.name} added!`);
  };

  const updateCartQty = (p: Product, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === p.id);
      if (!existing) {
        if (delta > 0) return [...prev, { product: p, qty: 1 }];
        return prev;
      }
      const newQty = existing.qty + delta;
      if (newQty <= 0) return prev.filter(i => i.product.id !== p.id);
      return prev.map(i => i.product.id === p.id ? { ...i, qty: newQty } : i);
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));

  const categories = ['All', 'Dairy & Pure Ghee', 'Fresh Vegetables', 'Fresh Fruits', 'Groceries & Grains', 'Organic Oils', 'Dry Fruits & Snacks'];
  const getCategoryIcon = (cat: string, color: string) => {
    switch (cat) {
      case 'All': return <Leaf size={14} color={color} />;
      case 'Dairy & Pure Ghee': return <Milk size={14} color={color} />;
      case 'Fresh Vegetables': return <Sprout size={14} color={color} />;
      case 'Fresh Fruits': return <Apple size={14} color={color} />;
      case 'Groceries & Grains': return <Wheat size={14} color={color} />;
      case 'Organic Oils': return <Droplets size={14} color={color} />;
      case 'Dry Fruits & Snacks': return <Sparkles size={14} color={color} />;
      default: return <Leaf size={14} color={color} />;
    }
  };

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Dynamic Add Product via API state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Fresh Vegetables');
  const [newProdPrice, setNewProdPrice] = useState('75');
  const [newProdUnit, setNewProdUnit] = useState('Kg');
  const [newProdStock, setNewProdStock] = useState('50');
  const [newProdDesc, setNewProdDesc] = useState('Hand-picked farm fresh organic produce directly from certified local farmers.');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [addProdError, setAddProdError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch(API_ENDPOINTS.products);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const sanitized = json.data.map((p: any) => ({
          ...p,
          category: safeCategory(p.category || p.categoryName)
        }));
        setProductsList(sanitized);
      }
    } catch (e) {
      console.warn('Error fetching products from API:', e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.orders);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((o: any) => ({
          id: o.id,
          products: o.items && o.items.length > 0 ? o.items.map((it: any) => `${it.product?.name || 'Organic item'} ×${it.quantity}`).join(', ') : 'Certified Organic items',
          amount: o.totalAmount,
          date: o.createdAt ? o.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10),
          paymentStatus: o.paymentStatus || 'SUCCESS',
          deliveryStatus: o.deliveryStatus || 'CONFIRMED'
        }));
        setUserOrders(mapped);
      }
    } catch {}
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [customerScreen]);

  const handleCreateProduct = async () => {
    setAddProdError(null);
    if (!newProdName.trim()) {
      setAddProdError('Please enter a product / crop name.');
      return;
    }
    const priceNum = parseFloat(newProdPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setAddProdError('Please enter a valid price greater than 0.');
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const payload = {
        name: newProdName.trim(),
        categoryName: newProdCategory,
        price: priceNum,
        unit: newProdUnit.trim() || 'Kg',
        stock: parseInt(newProdStock, 10) || 50,
        description: newProdDesc.trim() || `${newProdName.trim()} direct from certified organic farms.`,
        imageUrl: newProdImage.trim() || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        benefits: ['100% Certified Organic', 'Farm Fresh Harvest', 'Zero Chemical Residue'],
        subscriptionAllowed: true,
        oneTimeAllowed: true,
        organicCertified: true
      };

      const res = await fetch(API_ENDPOINTS.products, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.data) {
        const created = {
          ...data.data,
          category: safeCategory(data.data.category || data.data.categoryName)
        };
        // Instantly add dynamically to the customer catalog view
        setProductsList(prev => [created, ...prev.filter(p => p.id !== created.id)]);
        setShowAddProductModal(false);
        setNewProdName('');
        setNewProdPrice('75');
        Alert.alert(
          'Product Added Dynamically!',
          `"${created.name}" (₹${created.price}/${created.unit}) was added to the SQLite database via API and is immediately live on the customer page!`
        );
        fetchProducts();
      } else {
        setAddProdError(data.error || data.message || 'Failed to add product. Please verify API server.');
      }
    } catch {
      setAddProdError('Network error connecting to API. Ensure API server is running on port 5050.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    try {
      const res = await fetch(API_ENDPOINTS.orders, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: profileName || 'Ananya Sharma',
          customerPhone: userPhone || '9876543210',
          deliveryAddress: profileLocation || 'Indiranagar, Bangalore',
          totalAmount: cartTotal,
          paymentMethod: 'UPI',
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.qty,
            price: item.product.price
          }))
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert(
          'Order Placed via API!',
          `Your order #${data.data.id ? data.data.id.substring(0, 8) : 'ORD'} for ₹${cartTotal} was successfully stored in the database.`
        );
        setCart([]);
        fetchOrders();
        setCustomerScreen('ORDER_HISTORY');
      } else {
        Alert.alert('Order Recorded', `Your order of ₹${cartTotal} has been submitted.`);
        setCart([]);
        setCustomerScreen('HOME');
      }
    } catch {
      Alert.alert('Order Placed!', `Your order of ₹${cartTotal} has been recorded.`);
      setCart([]);
      setCustomerScreen('HOME');
    }
  };

  const handlePaySubscription = async () => {
    try {
      const payload = {
        productId: activeSubscriptionData.product.id,
        quantity: activeSubscriptionData.qty,
        frequency: activeSubscriptionData.freq,
        duration: activeSubscriptionData.duration,
        timeSlot: activeSubscriptionData.time,
        totalAmount: activeSubscriptionData.priceTotal,
        userPhone: userPhone || '9876543210'
      };
      const res = await fetch(API_ENDPOINTS.subscriptions, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const newSub = data.success && data.data ? {
        ...data.data,
        product: activeSubscriptionData.product,
        qty: activeSubscriptionData.qty,
        freq: activeSubscriptionData.freq,
        duration: activeSubscriptionData.duration,
        time: activeSubscriptionData.time,
        priceTotal: activeSubscriptionData.priceTotal,
        status: 'Active',
        startDate: new Date().toISOString().split('T')[0],
        skippedDates: []
      } : {
        id: 'sub_' + Date.now(),
        product: activeSubscriptionData.product,
        qty: activeSubscriptionData.qty,
        freq: activeSubscriptionData.freq,
        duration: activeSubscriptionData.duration,
        time: activeSubscriptionData.time,
        priceTotal: activeSubscriptionData.priceTotal,
        status: 'Active',
        startDate: new Date().toISOString().split('T')[0],
        skippedDates: []
      };
      setSubscriptions((prev: any[]) => [newSub, ...prev]);
      Alert.alert('Payment Successful!', `₹${activeSubscriptionData.priceTotal} paid via ${gateway}. Subscription is active in the database!`);
      setCustomerScreen('MY_SUBSCRIPTIONS');
    } catch {
      const newSub = { id: 'sub_' + Date.now(), product: activeSubscriptionData.product, qty: activeSubscriptionData.qty, freq: activeSubscriptionData.freq, duration: activeSubscriptionData.duration, time: activeSubscriptionData.time, priceTotal: activeSubscriptionData.priceTotal, status: 'Active', startDate: new Date().toISOString().split('T')[0], skippedDates: [] };
      setSubscriptions((prev: any[]) => [newSub, ...prev]);
      Alert.alert('Payment Successful!', `₹${activeSubscriptionData.priceTotal} paid via ${gateway}. Subscription is now active!`);
      setCustomerScreen('MY_SUBSCRIPTIONS');
    }
  };

  // Render modal to add product dynamically via API
  const renderAddProductModal = () => (
    <Modal visible={showAddProductModal} transparent animationType="slide">
      <View style={cs.vendorModalBackdrop}>
        <View style={cs.vendorModalCard}>
          <View style={cs.vendorModalHeader}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sprout size={18} color={C.light} />
                <Text style={cs.vendorModalTitle}>Add Product via API</Text>
              </View>
              <Text style={cs.vendorModalSub}>Dynamically post new crop to SQLite catalog</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAddProductModal(false)} style={cs.modalCloseBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {addProdError ? (
              <View style={cs.modalErrorBox}>
                <Text style={cs.modalErrorText}>{addProdError}</Text>
              </View>
            ) : null}

            <Text style={cs.formLabel}>Crop / Product Name *</Text>
            <TextInput
              style={cs.formInput}
              placeholder="e.g. Organic Ooty Carrots"
              placeholderTextColor="#94A3B8"
              value={newProdName}
              onChangeText={setNewProdName}
            />

            <Text style={cs.formLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {['Fresh Vegetables', 'Dairy & Pure Ghee', 'Fresh Fruits', 'Groceries & Grains', 'Organic Oils', 'Dry Fruits & Snacks'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setNewProdCategory(cat)}
                  style={[
                    cs.catChip,
                    newProdCategory === cat && cs.catChipActive,
                    { marginRight: 8, paddingHorizontal: 10, paddingVertical: 6 }
                  ]}
                >
                  <Text style={[cs.catChipText, newProdCategory === cat && cs.catChipTextActive, { fontSize: 11 }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={cs.formLabel}>Price (₹) *</Text>
                <TextInput
                  style={cs.formInput}
                  placeholder="75"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  value={newProdPrice}
                  onChangeText={setNewProdPrice}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={cs.formLabel}>Unit</Text>
                <TextInput
                  style={cs.formInput}
                  placeholder="Kg"
                  placeholderTextColor="#94A3B8"
                  value={newProdUnit}
                  onChangeText={setNewProdUnit}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={cs.formLabel}>Stock</Text>
                <TextInput
                  style={cs.formInput}
                  placeholder="50"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  value={newProdStock}
                  onChangeText={setNewProdStock}
                />
              </View>
            </View>

            <Text style={cs.formLabel}>Product Description</Text>
            <TextInput
              style={[cs.formInput, { height: 60, textAlignVertical: 'top', paddingTop: 8 }]}
              placeholder="Crisp farm-picked organic produce..."
              placeholderTextColor="#94A3B8"
              value={newProdDesc}
              onChangeText={setNewProdDesc}
              multiline
              numberOfLines={2}
            />

            <Text style={cs.formLabel}>Image Preset / URL</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {[
                { name: 'Veggies', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80' },
                { name: 'A2 Milk', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80' },
                { name: 'Apples', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80' },
                { name: 'Ghee', url: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600&auto=format&fit=crop&q=80' }
              ].map(img => (
                <TouchableOpacity
                  key={img.name}
                  onPress={() => setNewProdImage(img.url)}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: newProdImage === img.url ? '#2D6A4F' : '#E2EBE6'
                  }}
                >
                  <Text style={{ fontSize: 10, color: newProdImage === img.url ? '#fff' : '#2D6A4F', fontWeight: 'bold' }}>
                    {img.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={cs.formInput}
              placeholder="https://..."
              placeholderTextColor="#94A3B8"
              value={newProdImage}
              onChangeText={setNewProdImage}
            />

            <TouchableOpacity
              style={cs.submitVendorBtn}
              onPress={handleCreateProduct}
              disabled={isSubmittingProduct}
              activeOpacity={0.85}
            >
              {isSubmittingProduct ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={cs.submitVendorBtnText}>Add Product to Live API</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const filteredProducts = productsList.filter(p => {
    const catName = safeCategory(p.category);
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === 'All' || catName === activeCategory;
    return matchSearch && matchCat;
  });

  // Render Product Card with proper interactive buttons
  const renderProductCard = (p: Product) => {
    const cartItem = cart.find(i => i.product.id === p.id);
    const qty = cartItem ? cartItem.qty : 0;

    return (
      <TouchableOpacity key={p.id} style={cs.productCard} onPress={() => { setSelectedProduct(p); setCustomerScreen('PRODUCT_DETAILS'); }} activeOpacity={0.88}>
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: p.imageUrl }} style={cs.productImg} resizeMode="cover" />
          {p.organicCertified && (
            <View style={[cs.certBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <ShieldCheck size={11} color="#fff" />
              <Text style={cs.certBadgeText}>Certified Organic</Text>
            </View>
          )}
          {p.stock <= p.minStock && (
            <View style={cs.lowBadge}><Text style={cs.lowBadgeText}>Low Stock</Text></View>
          )}
        </View>

        <View style={cs.productCardBody}>
          <Text style={cs.productName} numberOfLines={1}>{p.name}</Text>
          <Text style={cs.productCat} numberOfLines={1}>{safeCategory(p.category)}</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <Zap size={11} color={C.light} />
            <Text style={cs.deliveryBadge}>Delivery by 6:30 AM Tomorrow</Text>
          </View>

          <View style={cs.priceRow}>
            <Text style={cs.productPrice}>₹{p.price}<Text style={cs.productUnit}>/{p.unit}</Text></Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Star size={11} color="#f59e0b" fill="#f59e0b" />
              <Text style={cs.productRating}>{p.rating}</Text>
            </View>
          </View>

          {/* Interactive Button Section */}
          <View style={cs.cardActionRow}>
            {qty > 0 ? (
              <View style={cs.qtySelectorBox}>
                <TouchableOpacity style={cs.qtySelectorBtn} onPress={() => updateCartQty(p, -1)}>
                  <Text style={cs.qtySelectorBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={cs.qtySelectorVal}>{qty}</Text>
                <TouchableOpacity style={cs.qtySelectorBtn} onPress={() => updateCartQty(p, 1)}>
                  <Text style={cs.qtySelectorBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={cs.addCartBtn} onPress={() => addToCart(p)}>
                <Text style={cs.addCartBtnText}>+ Add to Cart</Text>
              </TouchableOpacity>
            )}

            {p.subscriptionAllowed && (
              <TouchableOpacity
                style={[cs.quickSubBtn, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}
                onPress={() => {
                  setSelectedProduct(p);
                  setCustomerScreen('PRODUCT_DETAILS');
                }}
              >
                <Repeat size={11} color={C.light} />
                <Text style={cs.quickSubBtnText}>Subscribe</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Floating Cart Bar component when items are in cart
  const FloatingCartBar = () => {
    if (cartCount === 0 || customerScreen === 'CART' || customerScreen === 'CHECKOUT') return null;
    return (
      <View style={cs.floatingCartBar}>
        <View style={{ flex: 1 }}>
          <Text style={cs.floatingCartTitle}>{cartCount} {cartCount === 1 ? 'Item' : 'Items'} in Cart</Text>
          <Text style={cs.floatingCartPrice}>₹{cartTotal} <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '400' }}>+ Free Delivery</Text></Text>
        </View>
        <TouchableOpacity style={cs.floatingCartBtn} onPress={() => setCustomerScreen('CART')}>
          <Text style={cs.floatingCartBtnText}>View Cart →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ── HOME SCREEN ─────────────────────────────────────────
  if (customerScreen === 'HOME') return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={cs.scroll}>
        {/* Hero Banner */}
        <View style={cs.heroBanner}>
          <View style={{ flex: 1 }}>
            <View style={[cs.heroBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <Sparkles size={11} color="#fff" />
              <Text style={cs.heroBadgeText}>DAILY FRESH HARVEST</Text>
            </View>
            <Text style={cs.heroTitle}>Farm-to-Door{'\n'}Organic Goodness</Text>
            <Text style={cs.heroSub}>Pure certified organic milk, veggies & ghee.</Text>
            <TouchableOpacity style={cs.heroBtn} onPress={() => setCustomerScreen('ALL_PRODUCTS')}>
              <Text style={cs.heroBtnText}>Shop Now →</Text>
            </TouchableOpacity>
          </View>
          <Sprout size={52} color="rgba(255,255,255,0.85)" />
        </View>

        {/* Search */}
        <View style={cs.searchBox}>
          <Search size={16} color={C.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={cs.searchInput} placeholder="Search milk, ghee, fruits…"
            value={searchQuery} onChangeText={setSearchQuery}
            placeholderTextColor={C.textMuted}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <SectionTitle>Browse Categories</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[cs.catChip, isActive && cs.catChipActive, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}
                onPress={() => { setActiveCategory(cat); setCustomerScreen('ALL_PRODUCTS'); }}
              >
                {getCategoryIcon(cat, isActive ? '#fff' : C.primary)}
                <Text style={[cs.catChipText, isActive && cs.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured products */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <View>
            <Text style={cs.sectionTitle}>Farm-Fresh Organic Products ({productsList.length})</Text>
            <Text style={{ fontSize: 11, color: C.textSec }}>Real-time inventory from live API</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#DCFCE7',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#15803D'
              }}
              onPress={() => setShowAddProductModal(true)}
              activeOpacity={0.8}
            >
              <Plus size={12} color="#15803D" />
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#15803D' }}>+ Add Crop</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={fetchProducts}
              style={{
                padding: 6,
                borderRadius: 14,
                backgroundColor: C.surface,
                borderWidth: 1,
                borderColor: C.border
              }}
              activeOpacity={0.8}
            >
              <Repeat size={13} color={C.light} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={cs.productGrid}>
          {productsList.map(p => renderProductCard(p))}
        </View>

        {/* Offers Banner */}
        <View style={cs.offerBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Gift size={16} color="#B45309" />
            <Text style={cs.offerTitle}>Subscribe Daily & Save 10% Extra</Text>
          </View>
          <Text style={cs.offerSub}>Set up daily A2 Milk or Fresh Vegetable deliveries & get 10% cashback on advance monthly passes.</Text>
          <TouchableOpacity style={cs.offerBtn} onPress={() => setCustomerScreen('ALL_PRODUCTS')}>
            <Text style={cs.offerBtnText}>Explore Subscription Plans →</Text>
          </TouchableOpacity>
        </View>

        {/* Quick links */}
        <SectionTitle>My Account & Shortcuts</SectionTitle>
        <View style={cs.quickLinks}>
          {[
            { icon: <Package size={22} color={C.primary} />, label: 'My Orders', screen: 'ORDER_HISTORY' },
            { icon: <Repeat size={22} color={C.primary} />, label: 'Subscriptions', screen: 'MY_SUBSCRIPTIONS' },
            { icon: <ShoppingCart size={22} color={C.primary} />, label: `Cart (${cartCount})`, screen: 'CART' },
            { icon: <MessageSquare size={22} color={C.primary} />, label: 'WhatsApp AI', screen: 'WHATSAPP_AI' },
          ].map(item => (
            <TouchableOpacity key={item.screen} style={cs.quickLinkCard} onPress={() => setCustomerScreen(item.screen)}>
              {item.icon}
              <Text style={cs.quickLinkLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
      <FloatingCartBar />
      {renderAddProductModal()}
    </View>
  );

  // ── ALL PRODUCTS ─────────────────────────────────────────
  if (customerScreen === 'ALL_PRODUCTS') return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={cs.scroll}>
        <BackBtn onPress={() => setCustomerScreen('HOME')} label="← Home" />

        {/* Search */}
        <View style={cs.searchBox}>
          <Search size={16} color={C.textMuted} style={{ marginRight: 8 }} />
          <TextInput style={cs.searchInput} placeholder="Search products…" value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={C.textMuted} />
        </View>

        {/* Category pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity key={cat} style={[cs.catChip, isActive && cs.catChipActive, { flexDirection: 'row', alignItems: 'center', gap: 6 }]} onPress={() => setActiveCategory(cat)}>
                {getCategoryIcon(cat, isActive ? '#fff' : C.primary)}
                <Text style={[cs.catChipText, isActive && cs.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={[cs.sectionTitle, { marginBottom: 0 }]}>
            {filteredProducts.length} organic products {activeCategory !== 'All' ? `in ${activeCategory}` : ''}
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#15803D',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 14
            }}
            onPress={() => setShowAddProductModal(true)}
            activeOpacity={0.8}
          >
            <Plus size={12} color="#FFFFFF" />
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>+ Add Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={[cs.scroll, { paddingTop: 0 }]} showsVerticalScrollIndicator={false}>
        <View style={cs.productGrid}>
          {filteredProducts.map(p => renderProductCard(p))}
          {filteredProducts.length === 0 && (
            <View style={{ padding: 40, alignItems: 'center', width: '100%' }}>
              <Sprout size={40} color={C.textMuted} />
              <Text style={{ color: C.textMuted, marginTop: 10, fontSize: 13 }}>No products found</Text>
            </View>
          )}
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
      <FloatingCartBar />
      {renderAddProductModal()}
    </View>
  );

  // ── PRODUCT DETAILS ───────────────────────────────────────
  if (customerScreen === 'PRODUCT_DETAILS') {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ position: 'relative' }}>
            <Image source={{ uri: selectedProduct.imageUrl }} style={cs.detailHeroImg} resizeMode="cover" />
            <TouchableOpacity 
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                backgroundColor: 'rgba(13, 43, 29, 0.85)',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4
              }}
              onPress={() => setCustomerScreen('HOME')}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>← Back to Products</Text>
            </TouchableOpacity>
          </View>
          <View style={cs.detailCard}>
            {selectedProduct.organicCertified && (
              <View style={[cs.certBadgeInline, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <ShieldCheck size={12} color={C.light} />
                <Text style={cs.certBadgeText}>100% Organic Certified</Text>
              </View>
            )}
            <Text style={cs.detailName}>{selectedProduct.name}</Text>
            <Text style={cs.detailCat}>{safeCategory(selectedProduct.category)}</Text>
            <Text style={cs.detailPrice}>₹{selectedProduct.price} <Text style={cs.detailUnit}>/{selectedProduct.unit}</Text></Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Star size={13} color="#f59e0b" fill="#f59e0b" />
              <Text style={cs.detailRating}>{selectedProduct.rating} · Available {selectedProduct.availabilityStart}–{selectedProduct.availabilityEnd}</Text>
            </View>

            <View style={cs.divider} />

            <Text style={cs.detailSection}>Description</Text>
            <Text style={cs.detailDesc}>{selectedProduct.description}</Text>

            <Text style={cs.detailSection}>Key Benefits</Text>
            {selectedProduct.benefits.map((b: string, i: number) => (
              <View key={i} style={cs.benefitRow}>
                <Sprout size={14} color={C.light} style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={cs.benefitText}>{b}</Text>
              </View>
            ))}

            {/* Quantity */}
            <View style={cs.divider} />
            <View style={cs.qtyRow}>
              <Text style={cs.detailSection}>Quantity</Text>
              <View style={cs.qtyControl}>
                <TouchableOpacity style={cs.qtyBtn} onPress={() => setDetailQty(Math.max(1, detailQty - 1))}><Text style={cs.qtyBtnText}>−</Text></TouchableOpacity>
                <Text style={cs.qtyVal}>{detailQty} {selectedProduct.unit}</Text>
                <TouchableOpacity style={cs.qtyBtn} onPress={() => setDetailQty(detailQty + 1)}><Text style={cs.qtyBtnText}>+</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom action bar */}
        <View style={cs.bottomBar}>
          <View>
            <Text style={cs.bottomBarLabel}>TOTAL</Text>
            <Text style={cs.bottomBarTotal}>₹{selectedProduct.price * detailQty}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {selectedProduct.oneTimeAllowed && (
              <TouchableOpacity style={[cs.buyOnceBtn, { flexDirection: 'row', alignItems: 'center', gap: 6 }]} onPress={() => { addToCart(selectedProduct, detailQty); setCustomerScreen('HOME'); }}>
                <ShoppingCart size={15} color="#fff" />
                <Text style={cs.buyOnceBtnText}>Add to Cart</Text>
              </TouchableOpacity>
            )}
            {selectedProduct.subscriptionAllowed && (
              <TouchableOpacity style={[cs.subscribeBtn, { flexDirection: 'row', alignItems: 'center', gap: 6 }]} onPress={() => {
                setActiveSubscriptionData({ product: selectedProduct, qty: detailQty, freq: 'Daily', duration: 30, time: '06:30 AM', priceTotal: selectedProduct.price * detailQty * 30 });
                setCustomerScreen('SUBSCRIPTION_CREATE');
              }}>
                <Repeat size={15} color={C.primary} />
                <Text style={cs.subscribeBtnText}>Subscribe</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  // ── CART ──────────────────────────────────────────────────
  if (customerScreen === 'CART') return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
        <BackBtn onPress={() => setCustomerScreen('HOME')} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ShoppingCart size={20} color={C.textPrimary} />
          <Text style={cs.screenTitle}>My Cart</Text>
        </View>
        {cart.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 50 }}>
            <ShoppingCart size={48} color={C.textMuted} />
            <Text style={{ color: C.textMuted, marginTop: 12, fontSize: 14 }}>Your cart is empty</Text>
            <TouchableOpacity style={[cs.buyOnceBtn, { marginTop: 16 }]} onPress={() => setCustomerScreen('ALL_PRODUCTS')}>
              <Text style={cs.buyOnceBtnText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {cart.map(item => (
              <View key={item.product.id} style={cs.cartItem}>
                <Image source={{ uri: item.product.imageUrl }} style={cs.cartThumb} resizeMode="cover" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={cs.cartItemName} numberOfLines={1}>{item.product.name}</Text>
                  <Text style={cs.cartItemCat}>{safeCategory(item.product.category)}</Text>
                  <Text style={cs.cartItemPrice}>₹{item.product.price} × {item.qty} = <Text style={{ color: C.light, fontWeight: '800' }}>₹{item.product.price * item.qty}</Text></Text>
                </View>
                <TouchableOpacity style={cs.removeBtn} onPress={() => removeFromCart(item.product.id)}>
                  <Trash size={16} color={C.danger} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={cs.cartSummary}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: C.textSec, fontSize: 13 }}>Subtotal ({cartCount} items)</Text>
                <Text style={{ fontWeight: '700', fontSize: 13 }}>₹{cartTotal}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: C.textSec, fontSize: 13 }}>Delivery</Text>
                <Text style={{ fontWeight: '700', fontSize: 13, color: C.success }}>FREE</Text>
              </View>
              <View style={cs.divider} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: 16 }}>Total</Text>
                <Text style={{ color: C.primary, fontWeight: '800', fontSize: 18 }}>₹{cartTotal}</Text>
              </View>
            </View>
            <TouchableOpacity style={cs.checkoutBtn} onPress={handlePlaceOrder}>
              <Text style={cs.checkoutBtnText}>Place Order · ₹{cartTotal}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );

  // ── SUBSCRIPTION CREATE ───────────────────────────────────
  if (customerScreen === 'SUBSCRIPTION_CREATE') {
    const total = subQty * activeSubscriptionData.product.price * (subFreq === 'Daily' ? subDuration : subFreq === 'Weekly' ? Math.ceil(subDuration / 7) : 1);
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
          <BackBtn onPress={() => setCustomerScreen('PRODUCT_DETAILS')} />
          <Text style={cs.screenTitle}>Configure Subscription</Text>
          <Text style={cs.screenSub}>Set up automated deliveries for {activeSubscriptionData.product.name}</Text>

          {[
            { title: 'Daily Quantity', body: (
              <View style={cs.qtyControl}>
                <TouchableOpacity style={cs.qtyBtn} onPress={() => setSubQty(Math.max(1, subQty - 1))}><Text style={cs.qtyBtnText}>−</Text></TouchableOpacity>
                <Text style={cs.qtyVal}>{subQty} {activeSubscriptionData.product.unit}</Text>
                <TouchableOpacity style={cs.qtyBtn} onPress={() => setSubQty(subQty + 1)}><Text style={cs.qtyBtnText}>+</Text></TouchableOpacity>
              </View>
            )},
            { title: 'Delivery Frequency', body: (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['Daily', 'Weekly', 'Monthly'] as const).map(f => (
                  <TouchableOpacity key={f} style={[cs.freqPill, subFreq === f && cs.freqPillActive]} onPress={() => setSubFreq(f)}>
                    <Text style={[cs.freqPillText, subFreq === f && cs.freqPillTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )},
            { title: 'Morning Delivery Slot', body: (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['06:00 AM', '07:00 AM', '08:00 AM'].map(t => (
                  <TouchableOpacity key={t} style={[cs.freqPill, subTime === t && cs.freqPillActive]} onPress={() => setSubTime(t)}>
                    <Text style={[cs.freqPillText, subTime === t && cs.freqPillTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )},
            { title: 'Plan Duration', body: (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[15, 30, 90].map(d => (
                  <TouchableOpacity key={d} style={[cs.freqPill, subDuration === d && cs.freqPillActive]} onPress={() => setSubDuration(d)}>
                    <Text style={[cs.freqPillText, subDuration === d && cs.freqPillTextActive]}>{d} Days</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )},
          ].map((block, i) => (
            <View key={i} style={cs.configCard}>
              <Text style={cs.configCardTitle}>{block.title}</Text>
              <View style={{ marginTop: 10 }}>{block.body}</View>
            </View>
          ))}
        </ScrollView>
        <View style={cs.bottomBar}>
          <View>
            <Text style={cs.bottomBarLabel}>ESTIMATED TOTAL</Text>
            <Text style={cs.bottomBarTotal}>₹{total}</Text>
          </View>
          <TouchableOpacity style={cs.subscribeBtn} onPress={() => {
            setActiveSubscriptionData({ ...activeSubscriptionData, qty: subQty, freq: subFreq, time: subTime, duration: subDuration, priceTotal: total });
            setCustomerScreen('SUBSCRIPTION_SUMMARY');
          }}>
            <Text style={cs.subscribeBtnText}>Review Plan →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── SUBSCRIPTION SUMMARY ──────────────────────────────────
  if (customerScreen === 'SUBSCRIPTION_SUMMARY') return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
        <BackBtn onPress={() => setCustomerScreen('SUBSCRIPTION_CREATE')} />
        <Text style={cs.screenTitle}>Plan Summary</Text>
        <View style={cs.configCard}>
          <Text style={cs.configCardTitle}>Order Details</Text>
          {[
            { lbl: 'Product', val: activeSubscriptionData.product.name },
            { lbl: 'Qty / Drop', val: `${activeSubscriptionData.qty} ${activeSubscriptionData.product.unit}` },
            { lbl: 'Frequency', val: activeSubscriptionData.freq },
            { lbl: 'Delivery Slot', val: activeSubscriptionData.time },
            { lbl: 'Duration', val: `${activeSubscriptionData.duration} Days` },
            { lbl: 'Total Amount', val: `₹${activeSubscriptionData.priceTotal}` },
          ].map(row => (
            <View key={row.lbl} style={cs.summaryRow}>
              <Text style={cs.summaryLabel}>{row.lbl}</Text>
              <Text style={cs.summaryVal}>{row.val}</Text>
            </View>
          ))}
        </View>
        <View style={cs.configCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <ShieldCheck size={14} color={C.success} />
            <Text style={[cs.configCardTitle, { color: C.success }]}>Free Benefits Included</Text>
          </View>
          {['Free morning doorstep delivery', 'WhatsApp delivery alerts', 'Skip or pause anytime'].map(b => (
            <View key={b} style={cs.benefitRow}>
              <Sprout size={13} color={C.light} style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={cs.benefitText}>{b}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={cs.bottomBar}>
        <Text style={{ fontSize: 12, color: C.textSec }}>Advance payment required</Text>
        <TouchableOpacity style={cs.checkoutBtn} onPress={() => setCustomerScreen('PAYMENT')}>
          <Text style={cs.checkoutBtnText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── PAYMENT ───────────────────────────────────────────────
  if (customerScreen === 'PAYMENT') {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
          <BackBtn onPress={() => setCustomerScreen('SUBSCRIPTION_SUMMARY')} />
          <Text style={cs.screenTitle}>Secure Checkout</Text>
          <View style={cs.payBanner}>
            <Text style={cs.payBannerLabel}>AMOUNT TO PAY</Text>
            <Text style={cs.payBannerAmt}>₹{activeSubscriptionData.priceTotal}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <ShieldCheck size={13} color="rgba(255,255,255,0.8)" />
              <Text style={cs.payBannerSub}>Secured via Razorpay</Text>
            </View>
          </View>
          <Text style={cs.detailSection}>Select Payment Method</Text>
          {[
            { id: 'UPI', name: 'UPI (GPay / PhonePe)', desc: 'Fastest · Zero fee', icon: <Smartphone size={20} color={C.primary} /> },
            { id: 'CARD', name: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: <CreditCard size={20} color={C.primary} /> },
            { id: 'BANKING', name: 'Net Banking', desc: 'All major banks', icon: <Landmark size={20} color={C.primary} /> },
            { id: 'WALLET', name: 'Paytm / Wallet', desc: 'Quick cashback', icon: <Briefcase size={20} color={C.primary} /> },
          ].map(g => (
            <TouchableOpacity key={g.id} style={[cs.payRow, gateway === g.id && cs.payRowActive]} onPress={() => setGateway(g.id)}>
              <View style={{ marginRight: 12 }}>{g.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={[cs.payRowName, gateway === g.id && { color: C.primary }]}>{g.name}</Text>
                <Text style={cs.payRowDesc}>{g.desc}</Text>
              </View>
              <View style={[cs.radioBtn, gateway === g.id && cs.radioBtnActive]}>
                {gateway === g.id && <View style={cs.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={cs.bottomBar}>
          <TouchableOpacity style={cs.checkoutBtn} onPress={handlePaySubscription}>
            <Text style={cs.checkoutBtnText}>Pay ₹{activeSubscriptionData.priceTotal} →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── MY SUBSCRIPTIONS ─────────────────────────────────────
  if (customerScreen === 'MY_SUBSCRIPTIONS') {
    const handlePause = (id: string) => setSubscriptions((prev: any[]) => prev.map((s: any) => s.id === id ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s));
    const handleSkip = (id: string) => {
      const today = new Date().toISOString().split('T')[0];
      setSubscriptions((prev: any[]) => prev.map((s: any) => {
        if (s.id !== id) return s;
        const skipped = s.skippedDates || [];
        return { ...s, skippedDates: skipped.includes(today) ? skipped.filter((d: string) => d !== today) : [...skipped, today] };
      }));
    };
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={cs.tabStrip}>
          {(['Active', 'History'] as const).map(t => (
            <TouchableOpacity key={t} style={[cs.tabStripBtn, subTab === t && cs.tabStripBtnActive]} onPress={() => setSubTab(t)}>
              <Text style={[cs.tabStripText, subTab === t && cs.tabStripTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
          {subTab === 'Active' && subscriptions.map((sub: any) => {
            const today = new Date().toISOString().split('T')[0];
            const skippedToday = (sub.skippedDates || []).includes(today);
            return (
              <View key={sub.id} style={cs.subCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Image source={{ uri: sub.product.imageUrl }} style={{ width: 44, height: 44, borderRadius: 8, marginRight: 10, backgroundColor: C.border }} resizeMode="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={cs.subCardName}>{sub.product.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      <Clock size={11} color={C.textMuted} />
                      <Text style={cs.subCardInfo}>{sub.time} · {sub.qty} {sub.product.unit} · {sub.freq}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Calendar size={11} color={C.textMuted} />
                      <Text style={cs.subCardInfo}>Started {sub.startDate}</Text>
                    </View>
                  </View>
                  <View style={[cs.statusPill, { backgroundColor: sub.status === 'Active' ? '#DCFCE7' : '#FEF3C7' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: sub.status === 'Active' ? C.success : C.warning }}>{sub.status}</Text>
                  </View>
                </View>
                <View style={cs.divider} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={[cs.subActionBtn, { borderColor: C.warning }]} onPress={() => handleSkip(sub.id)}>
                    <Text style={{ color: C.warning, fontSize: 11, fontWeight: '700' }}>{skippedToday ? 'Resume' : 'Skip Today'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[cs.subActionBtn, { borderColor: C.info }]} onPress={() => handlePause(sub.id)}>
                    <Text style={{ color: C.info, fontSize: 11, fontWeight: '700' }}>{sub.status === 'Paused' ? 'Resume' : 'Pause'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[cs.subActionBtn, { borderColor: C.danger, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 }]} onPress={() => {
                    Alert.alert('Cancel Subscription', 'Are you sure?', [{ text: 'No', style: 'cancel' }, { text: 'Yes, Cancel', style: 'destructive', onPress: () => setSubscriptions((prev: any[]) => prev.filter((s: any) => s.id !== sub.id)) }]);
                  }}>
                    <X size={11} color={C.danger} />
                    <Text style={{ color: C.danger, fontSize: 11, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          {(subTab === 'History' || subscriptions.length === 0) && (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Package size={40} color={C.textMuted} />
              <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 10 }}>
                {subTab === 'History' ? 'No past subscriptions' : 'No active subscriptions'}
              </Text>
              <TouchableOpacity style={[cs.subscribeBtn, { marginTop: 16 }]} onPress={() => setCustomerScreen('ALL_PRODUCTS')}>
                <Text style={cs.subscribeBtnText}>Browse & Subscribe</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── ORDER HISTORY ─────────────────────────────────────────
  if (customerScreen === 'ORDER_HISTORY') return (
    <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
      <BackBtn onPress={() => setCustomerScreen('HOME')} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Package size={20} color={C.textPrimary} />
        <Text style={cs.screenTitle}>My Orders</Text>
      </View>
      {userOrders.length === 0 ? (
        <View style={{ alignItems: 'center', padding: 40 }}>
          <Package size={40} color={C.textMuted} />
          <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 10 }}>No orders recorded yet.</Text>
          <TouchableOpacity style={[cs.subscribeBtn, { marginTop: 16 }]} onPress={() => setCustomerScreen('ALL_PRODUCTS')}>
            <Text style={cs.subscribeBtnText}>Browse & Order</Text>
          </TouchableOpacity>
        </View>
      ) : (
        userOrders.map(order => (
          <View key={order.id} style={cs.orderCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={cs.orderIdText}>{order.id}</Text>
                <Text style={cs.orderProductText} numberOfLines={2}>{order.products}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Calendar size={11} color={C.textMuted} />
                    <Text style={cs.orderMetaText}>{order.date}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <CreditCard size={11} color={C.textMuted} />
                    <Text style={cs.orderMetaText}>{order.paymentStatus}</Text>
                  </View>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={cs.orderAmount}>₹{order.amount}</Text>
                <View style={[cs.statusPill, { backgroundColor: order.deliveryStatus === 'DELIVERED' ? '#DCFCE7' : '#DBEAFE' }]}>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: order.deliveryStatus === 'DELIVERED' ? C.success : C.info }}>{order.deliveryStatus}</Text>
                </View>
              </View>
            </View>
          </View>
        ))
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  // ── PROFILE ───────────────────────────────────────────────
  if (customerScreen === 'PROFILE') return (
    <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
      {/* Top Navigation Bar with Back & Title */}
      <View style={cs.profileTopNav}>
        <TouchableOpacity style={cs.profileBackBtn} onPress={() => setCustomerScreen('HOME')} activeOpacity={0.7}>
          <Text style={cs.profileBackBtnText}>← Back to Market</Text>
        </TouchableOpacity>
        <Text style={cs.profileTopNavTitle}>My Account</Text>
        <TouchableOpacity style={[cs.profileEditTopBtn, { flexDirection: 'row', alignItems: 'center', gap: 4 }]} onPress={() => setShowEditProfileModal(true)} activeOpacity={0.7}>
          <Pencil size={12} color={C.light} />
          <Text style={cs.profileEditTopBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Profile Card */}
      <View style={cs.profileHeroCard}>
        <View style={cs.profileHeaderRow}>
          <View style={cs.avatarWrapper}>
            <View style={cs.avatarCircle}>
              <User size={30} color="#FFFFFF" />
            </View>
            <View style={cs.avatarVerifiedBadge}>
              <Check size={10} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={cs.heroName} numberOfLines={1}>{profileName}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Phone size={12} color={C.textSec} />
              <Text style={cs.heroPhone}>+91 {userPhone || '98765 43210'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Mail size={12} color={C.textMuted} />
              <Text style={cs.heroEmail} numberOfLines={1}>{profileEmail}</Text>
            </View>
            <View style={[cs.heroMemberBadge, { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }]}>
              <Award size={12} color="#059669" />
              <Text style={cs.heroMemberBadgeText}>Mathira Gold · 100% Organic Club</Text>
            </View>
          </View>
        </View>

        {/* Address & Quick Edit row */}
        <View style={cs.heroAddressRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <MapPin size={13} color={C.textMuted} />
            <Text style={cs.heroAddressText} numberOfLines={1}>{profileLocation}</Text>
          </View>
          <TouchableOpacity style={cs.heroEditBtn} onPress={() => setShowEditProfileModal(true)} activeOpacity={0.8}>
            <Text style={cs.heroEditBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Smart Metrics Summary Row */}
      <View style={cs.profileStatsRow}>
        <TouchableOpacity style={cs.statTile} onPress={() => setCustomerScreen('ORDER_HISTORY')} activeOpacity={0.8}>
          <Text style={cs.statTileVal}>{profileStats.orders}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Package size={12} color={C.textMuted} />
            <Text style={cs.statTileLabel}>Orders</Text>
          </View>
          <Text style={cs.statTileSub}>Farm Deliveries</Text>
        </TouchableOpacity>

        <TouchableOpacity style={cs.statTile} onPress={() => setCustomerScreen('MY_SUBSCRIPTIONS')} activeOpacity={0.8}>
          <Text style={[cs.statTileVal, { color: '#059669' }]}>{profileStats.subs}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Repeat size={12} color="#059669" />
            <Text style={cs.statTileLabel}>Active Plans</Text>
          </View>
          <Text style={cs.statTileSub}>Daily 6:30 AM</Text>
        </TouchableOpacity>

        <View style={cs.statTile}>
          <Text style={[cs.statTileVal, { color: '#D97706' }]}>280</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Star size={12} color="#D97706" />
            <Text style={cs.statTileLabel}>Eco Points</Text>
          </View>
          <Text style={cs.statTileSub}>Save ₹280</Text>
        </View>
      </View>

      {/* Farmer / Partner Producer Registration Section */}
      <View style={cs.producerCard}>
        <View style={cs.producerHeader}>
          <View style={cs.producerIconCircle}>
            <Sprout size={22} color={C.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={cs.producerTitle}>Mathira Farmer Network</Text>
            <Text style={cs.producerSubtitle}>Verified Producer & Direct Farm Supply</Text>
          </View>
        </View>

        {(isApprovedVendor || vendorApplicationStatus === 'APPROVED') ? (
          <View style={cs.producerApprovedBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <CircleCheck size={14} color="#047857" />
              <Text style={cs.producerApprovedBadge}>ADMIN ACCREDITED PRODUCER</Text>
            </View>
            <Text style={cs.producerApprovedDesc}>
              Your farm has been verified by Admin. You have full partner access to list crops, manage morning harvests, and dispatch depot orders.
            </Text>
            {onSwitchToVendor && (
              <TouchableOpacity style={[cs.launchVendorBtn, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]} onPress={onSwitchToVendor} activeOpacity={0.85}>
                <Store size={14} color="#FFFFFF" />
                <Text style={cs.launchVendorBtnText}>Open Farmer Console</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : vendorApplicationStatus === 'PENDING' ? (
          <View style={cs.producerPendingBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Clock size={14} color="#B45309" />
              <Text style={cs.producerPendingBadge}>APPLICATION UNDER ADMIN REVIEW</Text>
            </View>
            <Text style={cs.producerPendingDesc}>
              Application #TN-REQ-9042 submitted to Super Admin. Once approved, the Farmer Console will unlock automatically.
            </Text>
            <TouchableOpacity style={[cs.refreshStatusBtn, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]} onPress={onRefreshVendorStatus} activeOpacity={0.7}>
              <Repeat size={14} color="#B45309" />
              <Text style={cs.refreshStatusBtnText}>Check Approval Status</Text>
            </TouchableOpacity>
          </View>
        ) : vendorApplicationStatus === 'REJECTED' ? (
          <View style={cs.producerRejectedBox}>
            <Text style={cs.producerRejectedBadge}>NEEDS DOCUMENT UPDATE</Text>
            <Text style={cs.producerRejectedDesc}>
              Admin requested updated organic certificate. Please review and re-apply.
            </Text>
            <TouchableOpacity style={cs.reapplyBtn} onPress={() => setShowVendorModal(true)} activeOpacity={0.8}>
              <Text style={cs.reapplyBtnText}>Update & Re-apply</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={cs.producerApplyBox}>
            <Text style={cs.producerApplyDesc}>
              Cultivate certified organic crops or produce A2 dairy? Register to sell directly to local subscribers.
            </Text>
            <TouchableOpacity style={[cs.applyFarmerBtn, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]} onPress={() => setShowVendorModal(true)} activeOpacity={0.85}>
              <FileText size={14} color="#FFFFFF" />
              <Text style={cs.applyFarmerBtnText}>Apply as Partner Farmer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Grouped Menu List */}
      {/* Group 1: Orders & Subscriptions */}
      <View style={cs.menuGroup}>
        <Text style={cs.menuGroupHeading}>ORDERS & PLANS</Text>
        <TouchableOpacity style={cs.menuRow} onPress={() => setCustomerScreen('ORDER_HISTORY')} activeOpacity={0.7}>
          <View style={cs.menuRowIconBox}>
            <Package size={17} color={C.primary} />
          </View>
          <View style={cs.menuRowContent}>
            <Text style={cs.menuRowTitle}>My Orders & Receipts</Text>
            <Text style={cs.menuRowSub}>Track farm-fresh deliveries & invoices</Text>
          </View>
          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>

        <View style={cs.menuDivider} />

        <TouchableOpacity style={cs.menuRow} onPress={() => setCustomerScreen('MY_SUBSCRIPTIONS')} activeOpacity={0.7}>
          <View style={cs.menuRowIconBox}>
            <Repeat size={17} color={C.primary} />
          </View>
          <View style={cs.menuRowContent}>
            <Text style={cs.menuRowTitle}>Morning Subscriptions</Text>
            <Text style={cs.menuRowSub}>Pause, skip, or change milk & veggie plans</Text>
          </View>
          <View style={cs.activePill}><Text style={cs.activePillText}>Active</Text></View>
          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>

        <View style={cs.menuDivider} />

        <TouchableOpacity style={cs.menuRow} onPress={() => setCustomerScreen('CART')} activeOpacity={0.7}>
          <View style={cs.menuRowIconBox}>
            <ShoppingCart size={17} color={C.primary} />
          </View>
          <View style={cs.menuRowContent}>
            <Text style={cs.menuRowTitle}>My Cart</Text>
            <Text style={cs.menuRowSub}>{cartCount > 0 ? `${cartCount} items ready` : 'View items in basket'}</Text>
          </View>
          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>

        <View style={cs.menuDivider} />

        <TouchableOpacity style={cs.menuRow} onPress={() => setShowEditProfileModal(true)} activeOpacity={0.7}>
          <View style={cs.menuRowIconBox}>
            <MapPin size={17} color={C.primary} />
          </View>
          <View style={cs.menuRowContent}>
            <Text style={cs.menuRowTitle}>Delivery Addresses</Text>
            <Text style={cs.menuRowSub} numberOfLines={1}>{profileLocation}</Text>
          </View>
          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Group 2: AI & Smart Services */}
      <View style={cs.menuGroup}>
        <Text style={cs.menuGroupHeading}>SMART FARM SERVICES</Text>
        <TouchableOpacity style={cs.menuRow} onPress={() => setCustomerScreen('WHATSAPP_AI')} activeOpacity={0.7}>
          <View style={cs.menuRowIconBox}>
            <MessageSquare size={17} color={C.primary} />
          </View>
          <View style={cs.menuRowContent}>
            <Text style={cs.menuRowTitle}>WhatsApp AI Assistant</Text>
            <Text style={cs.menuRowSub}>Instant order booking & harvest queries</Text>
          </View>
          <View style={[cs.activePill, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Text style={[cs.activePillText, { color: '#047857' }]}>BOT</Text>
          </View>
          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>

        <View style={cs.menuDivider} />

        <TouchableOpacity style={cs.menuRow} onPress={() => setCustomerScreen('AI_VOICE_CALL')} activeOpacity={0.7}>
          <View style={cs.menuRowIconBox}>
            <Phone size={17} color={C.primary} />
          </View>
          <View style={cs.menuRowContent}>
            <Text style={cs.menuRowTitle}>Voice AI Hotline</Text>
            <Text style={cs.menuRowSub}>Speak naturally in your native language</Text>
          </View>
          <View style={[cs.activePill, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Text style={[cs.activePillText, { color: '#2563EB' }]}>LIVE</Text>
          </View>
          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Group 3: Trust & Preferences */}
      <View style={cs.menuGroup}>
        <Text style={cs.menuGroupHeading}>TRUST & PREFERENCES</Text>
        <View style={cs.menuRow}>
          <View style={cs.menuRowIconBox}>
            <ShieldCheck size={17} color={C.primary} />
          </View>
          <View style={cs.menuRowContent}>
            <Text style={cs.menuRowTitle}>100% Certified Organic</Text>
            <Text style={cs.menuRowSub}>NPOP & Jaivik Bharat Accredited</Text>
          </View>
          <Text style={{ fontSize: 11, color: '#059669', fontWeight: 'bold' }}>VERIFIED</Text>
        </View>

        <View style={cs.menuDivider} />

        <View style={cs.menuRow}>
          <View style={cs.menuRowIconBox}>
            <Clock size={17} color={C.primary} />
          </View>
          <View style={cs.menuRowContent}>
            <Text style={cs.menuRowTitle}>Morning Delivery Window</Text>
            <Text style={cs.menuRowSub}>Daily 06:00 AM – 07:00 AM</Text>
          </View>
          <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>Active</Text>
        </View>
      </View>

      {/* Sign Out Card */}
      <TouchableOpacity style={[cs.profileSignOutBtn, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]} onPress={handleLogout} activeOpacity={0.8}>
        <LogOut size={16} color="#ef4444" />
        <Text style={cs.profileSignOutBtnText}>Sign Out of Account</Text>
      </TouchableOpacity>

      {/* Footer Branding */}
      <View style={cs.profileFooter}>
        <Text style={cs.profileFooterBrand}>Mathira Organic Farming Pvt Ltd</Text>
        <Text style={cs.profileFooterSub}>Bangalore · Salem · Coimbatore | Version 2.4.0</Text>
      </View>
      <View style={{ height: 40 }} />

      {/* ── Edit Profile Modal ── */}
      <Modal visible={showEditProfileModal} transparent animationType="slide">
        <View style={cs.vendorModalBackdrop}>
          <View style={cs.vendorModalCard}>
            <View style={cs.vendorModalHeader}>
              <View>
                <Text style={cs.vendorModalTitle}>Edit Profile Details</Text>
                <Text style={cs.vendorModalSub}>Update your personal & delivery address</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditProfileModal(false)} style={cs.modalCloseBtn}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {saveSuccessMsg ? (
                <View style={[cs.modalErrorBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                  <CircleCheck size={14} color="#047857" />
                  <Text style={[cs.modalErrorText, { color: '#047857' }]}>{saveSuccessMsg}</Text>
                </View>
              ) : null}

              <Text style={cs.formLabel}>Full Name</Text>
              <TextInput
                style={cs.formInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter full name"
                placeholderTextColor="#94A3B8"
              />

              <Text style={cs.formLabel}>Registered Mobile Number</Text>
              <TextInput
                style={[cs.formInput, { backgroundColor: '#F1F5F9', color: '#64748B' }]}
                value={'+91 ' + (userPhone || '9876543210')}
                editable={false}
              />

              <Text style={cs.formLabel}>Email Address</Text>
              <TextInput
                style={cs.formInput}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="you@domain.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={cs.formLabel}>Delivery Address & Landmark</Text>
              <TextInput
                style={[cs.formInput, { height: 70, textAlignVertical: 'top', paddingTop: 8 }]}
                value={editLocation}
                onChangeText={setEditLocation}
                placeholder="Flat / House no, Apartment, Street, City, Pincode"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={cs.submitVendorBtn}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
                activeOpacity={0.85}
              >
                {isSavingProfile ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={cs.submitVendorBtnText}>Save Profile Changes</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Vendor Registration Modal ── */}
      <Modal visible={showVendorModal} transparent animationType="slide">
        <View style={cs.vendorModalBackdrop}>
          <View style={cs.vendorModalCard}>
            <View style={cs.vendorModalHeader}>
              <View>
                <Text style={cs.vendorModalTitle}>Farmer / Vendor Registration</Text>
                <Text style={cs.vendorModalSub}>Sends verification request to Admin</Text>
              </View>
              <TouchableOpacity onPress={() => setShowVendorModal(false)} style={cs.modalCloseBtn}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {vApplyError ? (
                <View style={cs.modalErrorBox}>
                  <Text style={cs.modalErrorText}>{vApplyError}</Text>
                </View>
              ) : null}

              <Text style={cs.formLabel}>Applicant Mobile</Text>
              <TextInput
                style={[cs.formInput, { backgroundColor: '#F1F5F9', color: '#64748B' }]}
                value={userPhone || '9876543210'}
                editable={false}
              />

              <Text style={cs.formLabel}>Farm / Producer Name *</Text>
              <TextInput
                style={cs.formInput}
                placeholder="e.g. Salem Green Valley Orchards"
                placeholderTextColor="#94A3B8"
                value={vFarmName}
                onChangeText={setVFarmName}
              />

              <Text style={cs.formLabel}>Farm Location & District *</Text>
              <TextInput
                style={cs.formInput}
                placeholder="e.g. Salem, Tamil Nadu"
                placeholderTextColor="#94A3B8"
                value={vFarmLocation}
                onChangeText={setVFarmLocation}
              />

              <Text style={cs.formLabel}>Crop Types / Harvest Categories</Text>
              <TextInput
                style={cs.formInput}
                placeholder="e.g. Organic Tomatoes, A2 Cow Milk, Wild Honey"
                placeholderTextColor="#94A3B8"
                value={vCropCategories}
                onChangeText={setVCropCategories}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={cs.formLabel}>Experience (Yrs)</Text>
                  <TextInput
                    style={cs.formInput}
                    placeholder="4"
                    keyboardType="numeric"
                    placeholderTextColor="#94A3B8"
                    value={vExperience}
                    onChangeText={setVExperience}
                  />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={cs.formLabel}>Cert No / Accreditation</Text>
                  <TextInput
                    style={cs.formInput}
                    placeholder="NPOP-ORG-2026"
                    placeholderTextColor="#94A3B8"
                    value={vCertNo}
                    onChangeText={setVCertNo}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={cs.submitVendorBtn}
                onPress={handleApplyVendor}
                disabled={isSubmittingVendor}
                activeOpacity={0.85}
              >
                {isSubmittingVendor ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={cs.submitVendorBtnText}>Submit Registration to Admin →</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  return null;
};

// ── Styles ────────────────────────────────────────────────
const cs = StyleSheet.create({
  scroll: { padding: 16, backgroundColor: C.bg },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backBtnText: { fontSize: 13, fontWeight: '600', color: C.light },

  // Hero
  heroBanner: { backgroundColor: C.primary, borderRadius: 18, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  heroBadge: { backgroundColor: C.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 8 },
  heroBadgeText: { fontSize: 9, fontWeight: '800', color: C.primary },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', lineHeight: 26 },
  heroSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  heroBtn: { backgroundColor: C.accent, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, marginTop: 12, alignSelf: 'flex-start' },
  heroBtnText: { fontSize: 12, fontWeight: '700', color: C.primary },

  // Search
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: C.border, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 13, color: C.textPrimary },

  // Section
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  seeAll: { fontSize: 12, fontWeight: '600', color: C.light },

  // Categories
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.surface, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, borderWidth: 1, borderColor: C.border },
  catChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  catChipText: { fontSize: 11, fontWeight: '600', color: C.textSec },
  catChipTextActive: { color: '#fff' },

  // Product cards
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: { width: '48%', backgroundColor: C.surface, borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  productImg: { width: '100%', height: 125, borderTopLeftRadius: 14, borderTopRightRadius: 14, backgroundColor: C.border },
  certBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#86EFAC' },
  certBadgeText: { color: '#15803D', fontSize: 8, fontWeight: '700' },
  certBadgeInline: { backgroundColor: '#DCFCE7', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 8 },
  lowBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(239,68,68,0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  lowBadgeText: { color: '#fff', fontSize: 8, fontWeight: '700' },
  productCardBody: { padding: 10 },
  productName: { fontSize: 12, fontWeight: '700', color: C.textPrimary },
  productCat: { fontSize: 9, color: C.textMuted, marginTop: 2 },
  deliveryBadge: { fontSize: 8.5, fontWeight: '700', color: '#15803D', backgroundColor: '#F0FDF4', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  productPrice: { fontSize: 13, fontWeight: '800', color: C.primary },
  productUnit: { fontSize: 10, color: C.textSec, fontWeight: '400' },
  productRating: { fontSize: 10, color: C.warning, fontWeight: '600' },

  cardActionRow: { gap: 6, marginTop: 8 },
  addCartBtn: { backgroundColor: '#15803D', borderRadius: 8, paddingVertical: 6, alignItems: 'center', shadowColor: '#15803D', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 1 },
  addCartBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  qtySelectorBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0FDF4', borderRadius: 8, borderWidth: 1, borderColor: '#86EFAC', paddingHorizontal: 4, paddingVertical: 2 },
  qtySelectorBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#15803D', alignItems: 'center', justifyContent: 'center' },
  qtySelectorBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800', lineHeight: 16 },
  qtySelectorVal: { fontSize: 12, fontWeight: '800', color: '#15803D' },

  quickSubBtn: { backgroundColor: '#FEF3C7', borderRadius: 8, paddingVertical: 4, alignItems: 'center', borderWidth: 1, borderColor: '#F59E0B' },
  quickSubBtnText: { color: '#B45309', fontSize: 9.5, fontWeight: '800' },

  // Floating Cart Bar
  floatingCartBar: { position: 'absolute', bottom: 12, left: 16, right: 16, backgroundColor: '#0D2B1D', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8, borderWidth: 1, borderColor: '#22c55e' },
  floatingCartTitle: { color: '#86EFAC', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  floatingCartPrice: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  floatingCartBtn: { backgroundColor: '#22c55e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  floatingCartBtnText: { color: '#0D2B1D', fontSize: 12, fontWeight: '900' },

  // Offers
  offerBanner: { backgroundColor: C.accent + '22', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.accent + '44', marginBottom: 16 },
  offerTitle: { fontSize: 14, fontWeight: '800', color: C.primary },
  offerSub: { fontSize: 12, color: C.textSec, marginTop: 4, lineHeight: 17 },
  offerBtn: { backgroundColor: C.primary, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-start', marginTop: 10 },
  offerBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Quick links
  quickLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickLinkCard: { width: '47%', backgroundColor: C.surface, borderRadius: 12, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.border },
  quickLinkLabel: { fontSize: 11, fontWeight: '600', color: C.textSec },

  // Detail
  detailHeroImg: { width: '100%', height: 200, backgroundColor: C.border },
  detailCard: { padding: 16, backgroundColor: C.surface },
  detailName: { fontSize: 20, fontWeight: '800', color: C.textPrimary, marginTop: 4 },
  detailCat: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  detailPrice: { fontSize: 22, fontWeight: '800', color: C.primary, marginTop: 8 },
  detailUnit: { fontSize: 14, color: C.textSec, fontWeight: '400' },
  detailRating: { fontSize: 12, color: C.textSec, marginTop: 4 },
  detailSection: { fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 6 },
  detailDesc: { fontSize: 13, color: C.textSec, lineHeight: 19 },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  benefitText: { fontSize: 13, color: C.textSec, flex: 1 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 18, fontWeight: '600', color: C.textPrimary },
  qtyVal: { fontSize: 14, fontWeight: '700', color: C.textPrimary, minWidth: 60, textAlign: 'center' },

  // Bottom bar
  bottomBar: { backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  bottomBarLabel: { fontSize: 9, fontWeight: '700', color: C.textSec, textTransform: 'uppercase' },
  bottomBarTotal: { fontSize: 20, fontWeight: '800', color: C.primary },
  buyOnceBtn: { backgroundColor: C.surface2, borderWidth: 1.5, borderColor: C.primary, borderRadius: 22, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center' },
  buyOnceBtnText: { fontSize: 12, fontWeight: '700', color: C.primary },
  subscribeBtn: { backgroundColor: C.primary, borderRadius: 22, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center' },
  subscribeBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // Cart
  cartItem: { backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  cartThumb: { width: 60, height: 60, borderRadius: 8, backgroundColor: C.border },
  cartItemName: { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  cartItemCat: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  cartItemPrice: { fontSize: 12, color: C.textSec, marginTop: 4 },
  removeBtn: { padding: 8 },
  cartSummary: { backgroundColor: C.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border, marginTop: 8 },
  checkoutBtn: { backgroundColor: C.primary, borderRadius: 22, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  checkoutBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // Config
  configCard: { backgroundColor: C.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 12 },
  configCardTitle: { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  freqPill: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, alignItems: 'center' },
  freqPillActive: { backgroundColor: C.primary, borderColor: C.primary },
  freqPillText: { fontSize: 11, fontWeight: '600', color: C.textSec },
  freqPillTextActive: { color: '#fff', fontWeight: '700' },

  // Summary
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.border },
  summaryLabel: { fontSize: 12, color: C.textMuted },
  summaryVal: { fontSize: 12, fontWeight: '700', color: C.textPrimary, flex: 1, textAlign: 'right' },

  // Payment
  payBanner: { backgroundColor: C.primary, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  payBannerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 1 },
  payBannerAmt: { fontSize: 32, fontWeight: '800', color: '#fff', marginVertical: 4 },
  payBannerSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  payRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: C.border },
  payRowActive: { borderColor: C.primary, backgroundColor: '#F0F9F4' },
  payRowName: { fontSize: 13, fontWeight: '600', color: C.textPrimary },
  payRowDesc: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  radioBtn: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radioBtnActive: { borderColor: C.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary },

  // Subscriptions
  tabStrip: { flexDirection: 'row', backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  tabStripBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabStripBtnActive: { borderBottomColor: C.primary },
  tabStripText: { fontSize: 13, fontWeight: '600', color: C.textMuted },
  tabStripTextActive: { color: C.primary, fontWeight: '700' },
  subCard: { backgroundColor: C.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 12 },
  subCardName: { fontSize: 14, fontWeight: '700', color: C.textPrimary },
  subCardInfo: { fontSize: 11, color: C.textSec, marginTop: 3 },
  subActionBtn: { flex: 1, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, alignItems: 'center' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },

  // Orders
  orderCard: { backgroundColor: C.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  orderIdText: { fontSize: 12, fontWeight: '700', color: C.primary },
  orderProductText: { fontSize: 12, color: C.textSec, marginTop: 3 },
  orderMetaText: { fontSize: 11, color: C.textMuted, marginTop: 4 },
  orderAmount: { fontSize: 15, fontWeight: '800', color: C.textPrimary },

  // Screen titles
  screenTitle: { fontSize: 20, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
  screenSub: { fontSize: 12, color: C.textMuted, marginBottom: 16 },

  // ── Neat Modern Profile Styles ───────────────────────────
  profileTopNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  profileBackBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  profileBackBtnText: { fontSize: 12, fontWeight: '700', color: '#047857' },
  profileTopNavTitle: { fontSize: 16, fontWeight: '800', color: C.textPrimary },
  profileEditTopBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#ECFDF5', borderRadius: 20, borderWidth: 1, borderColor: '#A7F3D0' },
  profileEditTopBtnText: { fontSize: 12, fontWeight: '700', color: '#047857' },

  profileHeroCard: { backgroundColor: '#0D2B1D', borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 5, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.25)' },
  profileHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  avatarWrapper: { position: 'relative' },
  avatarCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#22c55e' },
  avatarVerifiedBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#22c55e', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0D2B1D' },
  heroName: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  heroPhone: { fontSize: 12, color: '#A7F3D0', marginTop: 3, fontWeight: '600' },
  heroEmail: { fontSize: 11, color: '#CBD5E1', marginTop: 2 },
  heroMemberBadge: { backgroundColor: 'rgba(212, 172, 13, 0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginTop: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(212, 172, 13, 0.4)' },
  heroMemberBadgeText: { fontSize: 10, color: '#FDE047', fontWeight: '800' },
  heroAddressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginTop: 14 },
  heroAddressText: { fontSize: 11, color: '#E2E8F0', flex: 1, marginRight: 8 },
  heroEditBtn: { backgroundColor: '#22c55e', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  heroEditBtnText: { fontSize: 11, color: '#0D2B1D', fontWeight: '800' },

  profileStatsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statTile: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  statTileVal: { fontSize: 18, fontWeight: '800', color: '#0D2B1D' },
  statTileLabel: { fontSize: 11, fontWeight: '700', color: '#1E293B', marginTop: 2 },
  statTileSub: { fontSize: 9, color: '#94A3B8', marginTop: 1 },

  producerCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#D1FAE5', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  producerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  producerIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#A7F3D0' },
  producerTitle: { fontSize: 15, fontWeight: '800', color: '#0D2B1D' },
  producerSubtitle: { fontSize: 11, color: '#64748B', marginTop: 1 },
  producerApprovedBox: { backgroundColor: '#ECFDF5', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#A7F3D0' },
  producerApprovedBadge: { fontSize: 10, fontWeight: '800', color: '#047857', letterSpacing: 0.5 },
  producerApprovedDesc: { fontSize: 11, color: '#065F46', lineHeight: 16, marginVertical: 6 },
  launchVendorBtn: { backgroundColor: '#047857', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  launchVendorBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  producerPendingBox: { backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FDE68A' },
  producerPendingBadge: { fontSize: 10, fontWeight: '800', color: '#B45309', letterSpacing: 0.5 },
  producerPendingDesc: { fontSize: 11, color: '#92400E', lineHeight: 16, marginVertical: 6 },
  refreshStatusBtn: { backgroundColor: '#FFFFFF', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#FDE68A', marginTop: 4 },
  refreshStatusBtnText: { color: '#B45309', fontSize: 11, fontWeight: '700' },
  producerRejectedBox: { backgroundColor: '#FEE2E2', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FECACA' },
  producerRejectedBadge: { fontSize: 10, fontWeight: '800', color: '#DC2626', letterSpacing: 0.5 },
  producerRejectedDesc: { fontSize: 11, color: '#991B1B', lineHeight: 16, marginVertical: 6 },
  reapplyBtn: { backgroundColor: '#DC2626', borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginTop: 4 },
  reapplyBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  producerApplyBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  producerApplyDesc: { fontSize: 11, color: '#64748B', lineHeight: 17, marginBottom: 8 },
  applyFarmerBtn: { backgroundColor: '#047857', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  applyFarmerBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  menuGroup: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
  menuGroupHeading: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase', paddingVertical: 6, paddingHorizontal: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  menuRowIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F0F9F4', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  menuRowIcon: { fontSize: 18, width: 30 },
  menuRowContent: { flex: 1, paddingRight: 6 },
  menuRowTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  menuRowSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  menuRowChevron: { fontSize: 18, color: '#CBD5E1', fontWeight: '300', marginLeft: 4 },
  menuDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 2 },
  activePill: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#A7F3D0' },
  activePillText: { fontSize: 9, fontWeight: '800', color: '#047857' },

  profileSignOutBtn: { backgroundColor: '#FEF2F2', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 6, marginBottom: 14, borderWidth: 1, borderColor: '#FECACA' },
  profileSignOutBtnText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
  profileFooter: { alignItems: 'center', paddingVertical: 10 },
  profileFooterBrand: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  profileFooterSub: { fontSize: 10, color: '#94A3B8', marginTop: 2 },

  // Vendor Modal
  vendorModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  vendorModalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' },
  vendorModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  vendorModalTitle: { fontSize: 16, fontWeight: '800', color: C.primary },
  vendorModalSub: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  modalCloseBtn: { padding: 6 },
  formLabel: { fontSize: 11, fontWeight: '700', color: C.textSec, textTransform: 'uppercase', marginBottom: 4, marginTop: 8 },
  formInput: { borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, height: 42, fontSize: 13, color: C.textPrimary, backgroundColor: '#FFFFFF' },
  modalErrorBox: { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#FECACA' },
  modalErrorText: { color: '#DC2626', fontSize: 12, fontWeight: '600' },
  submitVendorBtn: { backgroundColor: '#047857', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 18 },
  submitVendorBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
});
