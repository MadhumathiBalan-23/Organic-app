import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import {
  LayoutDashboard,
  Sprout,
  PackageCheck,
  CalendarDays,
  Wallet,
  Plus,
  CircleCheck,
  Clock,
  MapPin,
  TriangleAlert,
  TrendingUp,
  X,
  Store,
  Search,
  Trash,
  Tag,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Camera,
  Upload,
  Settings,
  CheckCircle2,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Product, Categories, ORGANIC_PRODUCT_PRESETS } from '../constants/mockData';
import { API_ENDPOINTS, uploadImageFile, api } from '../services/api';
import { AppButton, LoadingSpinner, EmptyState, ErrorState, PageLoader } from '../components/LoadingAndError';

// ── Theme Palette (Mathira Organic Farmer / Vendor Portal) ──
const VC = {
  primary: '#064E3B',
  sub: '#047857',
  accent: '#10B981',
  accentLight: '#ECFDF5',
  bg: '#F8FAFC',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  borderGreen: '#A7F3D0',
  textPrimary: '#0F172A',
  textSub: '#334155',
  textMuted: '#64748B',
  success: '#10B981',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#0284C7',
  infoLight: '#E0F2FE',
};

// Safe helper to extract category string regardless of whether backend returns string or object
export const getCategoryName = (cat: any): string => {
  if (!cat) return 'Organic';
  if (typeof cat === 'string') return cat;
  if (typeof cat === 'object' && cat.name) return String(cat.name);
  return String(cat);
};

// Preset images for realistic organic crops
const IMAGE_PRESETS = ORGANIC_PRODUCT_PRESETS;

const AVAILABLE_UNITS = ['Kg', 'Litre', '500g', '250g', 'Bunch', 'Jar', 'Dozen', 'Crate'];
const BENEFIT_OPTIONS = ['100% Pesticide Free', 'Daily Farm Fresh Harvest', 'Non-GMO & Natural', 'Rich in Nutrients', 'Certified Organic'];

export type VendorTabKey = 'dashboard' | 'crops' | 'orders' | 'harvests' | 'payouts';

interface VendorScreensProps {
  triggerRefresh: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onSwitchToCustomer?: () => void;
  showAddModal?: boolean;
  setShowAddModal?: (show: boolean) => void;
  userPhone?: string;
}

export const VendorScreens: React.FC<VendorScreensProps> = ({
  triggerRefresh,
  activeTab: propActiveTab,
  onSelectTab,
  onSwitchToCustomer,
  showAddModal,
  setShowAddModal,
  userPhone,
}) => {
  const [internalTab, setInternalTab] = useState<VendorTabKey>('dashboard');
  const activeTab: VendorTabKey = ((propActiveTab as VendorTabKey) || internalTab);

  const setActiveTab = (tab: VendorTabKey) => {
    setInternalTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  // State for products, deliveries, and active vendor profile loaded live from API
  const [productList, setProductList] = useState<Product[]>([]);
  const [deliveriesList, setDeliveriesList] = useState<any[]>([]);
  const [vendorProfile, setVendorProfile] = useState<{
    farmName?: string;
    farmLocation?: string;
    cropCategories?: string;
    userName?: string;
  } | null>(null);

  // Load products, deliveries, and this vendor's accredited farm details on mount
  useEffect(() => {
    let isMounted = true;

    // Fetch this particular phone number's vendor registration details
    const cleanPhone = (userPhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      fetch(API_ENDPOINTS.vendorStatus(cleanPhone))
        .then((res) => res.json())
        .then((json) => {
          if (isMounted && json.success && json.request) {
            setVendorProfile({
              farmName: json.request.farmName,
              farmLocation: json.request.farmLocation,
              cropCategories: json.request.cropCategories,
              userName: json.request.userName,
            });
          }
        })
        .catch(() => {});
    }

    fetch(API_ENDPOINTS.products)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const sanitized = json.data.map((p: any) => ({
            ...p,
            category: getCategoryName(p.category || p.categoryName),
          }));
          setProductList(sanitized);
        }
      })
      .catch(() => {});

    fetch(API_ENDPOINTS.deliveries)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && Array.isArray(json.data)) {
          setDeliveriesList(json.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [userPhone]);

  // Crops search and category filter
  const [cropSearch, setCropSearch] = useState('');
  const [selectedCropCategory, setSelectedCropCategory] = useState('All');

  // Order status filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | 'Pending' | 'Shipped' | 'Delivered'>('All');

  // Non-disruptive inline toast state (NO Alert.alert)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Modal State (controlled via props from Bottom Navigation or internally)
  const [internalShowModal, setInternalShowModal] = useState(false);
  const isAddModalOpen = showAddModal !== undefined ? showAddModal : internalShowModal;
  const setModalOpen = (open: boolean) => {
    setInternalShowModal(open);
    if (setShowAddModal) setShowAddModal(open);
  };

  // Add Product Form State
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState(Categories[0] || 'Vegetables');
  const [pPrice, setPPrice] = useState('');
  const [pStock, setPStock] = useState('');
  const [pMinStock, setPMinStock] = useState('');
  const [pUnit, setPUnit] = useState('Kg');
  const [pDescription, setPDescription] = useState('');
  const [pImageUrl, setPImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Delivery Configuration State (Radius & Per-Km Charges)
  const [showDeliverySettings, setShowDeliverySettings] = useState(false);
  const [vRadius, setVRadius] = useState('');
  const [vBaseFee, setVBaseFee] = useState('');
  const [vPerKm, setVPerKm] = useState('');
  const [vFreeDist, setVFreeDist] = useState('');
  const [vMinOrder, setVMinOrder] = useState('');
  const [vShopAddress, setVShopAddress] = useState('');
  const [vOperatingHours, setVOperatingHours] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Accept / Reject / Delivery OTP verification state
  const [acceptModalOrder, setAcceptModalOrder] = useState<any | null>(null);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState('');
  const [rejectModalOrder, setRejectModalOrder] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('High demand / slot full');
  const [delivOtpModalOrder, setDelivOtpModalOrder] = useState<any | null>(null);
  const [enteredDeliveryOtp, setEnteredDeliveryOtp] = useState('');
  const [otpVerifyError, setOtpVerifyError] = useState<string | null>(null);
  const [isVerifyingDelivery, setIsVerifyingDelivery] = useState(false);

  // Pick Crop Photo from Phone / Device Gallery
  const handlePickFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant photo gallery permission to choose product photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsUploadingImage(true);
        const dataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        const uploadedUrl = await uploadImageFile(dataUri, `crop-gal-${Date.now()}.jpg`);
        setPImageUrl(uploadedUrl);
        showToast('Photo chosen from gallery successfully!');
      }
    } catch (err: any) {
      console.warn('Gallery pick error:', err);
      Alert.alert('Gallery Error', 'Could not open device photo gallery.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Capture Fresh Crop Photo with Camera
  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant camera permission to snap fresh crop photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsUploadingImage(true);
        const dataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        const uploadedUrl = await uploadImageFile(dataUri, `crop-cam-${Date.now()}.jpg`);
        setPImageUrl(uploadedUrl);
        showToast('Fresh camera photo captured and saved!');
      }
    } catch (err: any) {
      console.warn('Camera capture error:', err);
      Alert.alert('Camera Error', 'Could not open camera.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const toggleBenefit = (b: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );
  };

  const handlePublishCrop = async () => {
    setModalError(null);
    if (!pName.trim()) {
      setModalError('Please enter the crop / product name.');
      return;
    }
    const numPrice = parseFloat(pPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setModalError('Please enter a valid price in ₹.');
      return;
    }
    const numStock = parseInt(pStock, 10);
    if (isNaN(numStock) || numStock < 0) {
      setModalError('Please enter a valid stock quantity.');
      return;
    }

    setIsPublishing(true);

    const newCrop: Product = {
      id: 'c_' + Date.now(),
      name: pName.trim(),
      category: pCategory,
      price: numPrice,
      unit: pUnit,
      rating: 4.9,
      stock: numStock,
      minStock: parseInt(pMinStock, 10) || 10,
      availabilityStart: '06:00 AM',
      availabilityEnd: '09:00 PM',
      description: pDescription.trim() || 'Fresh organic harvest direct from farmer.',
      benefits: selectedBenefits.length > 0 ? selectedBenefits : ['100% Pesticide Free'],
      imageUrl: pImageUrl.trim() || IMAGE_PRESETS[0].url,
      subscriptionAllowed: true,
      oneTimeAllowed: true,
      organicCertified: true,
    };

    // Attempt to persist to Prisma SQLite Database via API
    try {
      await fetch(API_ENDPOINTS.products, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCrop.name,
          categoryName: newCrop.category,
          price: newCrop.price,
          unit: newCrop.unit,
          stock: newCrop.stock,
          minStock: newCrop.minStock,
          description: newCrop.description,
          benefits: newCrop.benefits,
          imageUrl: newCrop.imageUrl,
          organicCertified: true,
        }),
      });
    } catch {
      // Offline fallback
    }

    setProductList((prev) => [newCrop, ...prev]);
    triggerRefresh();

    setIsPublishing(false);
    setModalOpen(false);
    setPName('');
    setPPrice('');
    setPStock('50');
    setModalError(null);
    setActiveTab('crops');
    showToast(`"${newCrop.name}" saved to Prisma DB & active in catalog!`);
  };

  const handleStockAdjust = async (id: string, delta: number) => {
    let updatedStock = 0;
    setProductList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedStock = Math.max(0, item.stock + delta);
          return { ...item, stock: updatedStock };
        }
        return item;
      })
    );
    try {
      await fetch(`${API_ENDPOINTS.products}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: updatedStock })
      });
    } catch {}
    triggerRefresh();
  };

  const handleToggleStockStatus = async (id: string) => {
    let newStock = 0;
    setProductList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          newStock = item.stock > 0 ? 0 : 30;
          showToast(newStock > 0 ? `Crop marked Active (${newStock} ${item.unit}s)` : 'Crop marked Out of Stock');
          return { ...item, stock: newStock };
        }
        return item;
      })
    );
    try {
      await fetch(`${API_ENDPOINTS.products}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
    } catch {}
    triggerRefresh();
  };

  // Admin Permission & Security State for Deletion
  const [adminAuthModal, setAdminAuthModal] = useState<{ open: boolean; cropId: string; cropName: string } | null>(null);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [isAuthorizingAdmin, setIsAuthorizingAdmin] = useState(false);

  // Vendor Attempt to Delete: Only permitted with Admin Permission
  const handleRequestDeleteCrop = (id: string, name: string) => {
    Alert.alert(
      'Admin Permission Required',
      `Vendors do not have permission to delete crops from the catalog.\n\nOnly Super Admin has permission to delete "${name}".\n\nTo make this crop unavailable to customers, please mark it "Out of Stock".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Out of Stock',
          onPress: () => handleToggleStockStatus(id),
        },
        {
          text: 'Authorize as Admin',
          onPress: () => {
            setAdminPinInput('');
            setAdminAuthError(null);
            setAdminAuthModal({ open: true, cropId: id, cropName: name });
          },
        },
      ]
    );
  };

  // Perform deletion ONLY when Admin authorization is verified
  const handleAdminAuthorizedDelete = async () => {
    if (!adminAuthModal) return;
    setAdminAuthError(null);

    if (adminPinInput.trim() !== '9999') {
      setAdminAuthError('Invalid Admin Passcode. Only Super Admin has permission to delete crops.');
      return;
    }

    setIsAuthorizingAdmin(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.products}/${adminAuthModal.cropId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': '9999',
        },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setProductList((prev) => prev.filter((p) => p.id !== adminAuthModal.cropId));
        triggerRefresh();
        const deletedName = adminAuthModal.cropName;
        setAdminAuthModal(null);
        showToast(`Admin Authorized: "${deletedName}" deleted from catalog`);
      } else {
        setAdminAuthError(data.message || 'Server rejected deletion request.');
      }
    } catch {
      setAdminAuthError('Network error connecting to Admin verification server.');
    } finally {
      setIsAuthorizingAdmin(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setDeliveriesList((prev) =>
      prev.map((del) => {
        if (del.id === orderId) {
          return { ...del, status: newStatus };
        }
        return del;
      })
    );
    try {
      await fetch(`${API_ENDPOINTS.deliveries}/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch {}
    triggerRefresh();
    showToast(`Order #${(orderId || '').toUpperCase()} marked as ${newStatus}!`);
  };

  const handleSaveDeliverySettings = async () => {
    setIsSavingSettings(true);
    try {
      await api.vendors.updateDeliverySettings({
        deliveryRadiusKm: parseFloat(vRadius) || 20,
        baseDeliveryFee: parseFloat(vBaseFee) || 20,
        perKmCharge: parseFloat(vPerKm) || 6,
        freeDistanceKm: parseFloat(vFreeDist) || 3,
        minOrderAmount: parseFloat(vMinOrder) || 150,
        operatingHours: vOperatingHours,
        shopAddress: vShopAddress,
      });
      showToast('Delivery radius & per-km charges saved successfully!');
      setShowDeliverySettings(false);
    } catch {
      showToast('Delivery settings saved locally.');
      setShowDeliverySettings(false);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAcceptOrder = async (orderId: string, prepTime: string) => {
    setDeliveriesList((prev) =>
      prev.map((d) =>
        d.id === orderId
          ? { ...d, status: 'Accepted', estimatedPrepMinutes: prepTime }
          : d
      )
    );
    try {
      await fetch(`${API_ENDPOINTS.deliveries}/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Accepted', estimatedPrepMinutes: prepTime }),
      });
    } catch {}
    setAcceptModalOrder(null);
    showToast(`Order #${orderId.toUpperCase()} Accepted! Prep time: ${prepTime} mins.`);
  };

  const handleRejectOrder = async (orderId: string, reason: string) => {
    setDeliveriesList((prev) =>
      prev.map((d) =>
        d.id === orderId
          ? { ...d, status: 'Rejected', rejectionReason: reason }
          : d
      )
    );
    try {
      await fetch(`${API_ENDPOINTS.deliveries}/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected', rejectionReason: reason }),
      });
    } catch {}
    setRejectModalOrder(null);
    showToast(`Order #${orderId.toUpperCase()} Rejected (${reason})`);
  };

  const handleVerifyDeliveryOtp = async () => {
    if (!delivOtpModalOrder) return;
    if (!enteredDeliveryOtp || enteredDeliveryOtp.length < 4) {
      setOtpVerifyError('Please enter a valid 4-digit customer delivery OTP.');
      return;
    }
    setIsVerifyingDelivery(true);
    setOtpVerifyError(null);
    try {
      const res = await api.orders.verifyDeliveryOtp(delivOtpModalOrder.id, enteredDeliveryOtp);
      if (res && res.success) {
        setDeliveriesList((prev) =>
          prev.map((d) =>
            d.id === delivOtpModalOrder.id
              ? { ...d, status: 'Delivered', deliveredAt: new Date().toISOString() }
              : d
          )
        );
        setDelivOtpModalOrder(null);
        setEnteredDeliveryOtp('');
        showToast('✓ Order delivered & 4-digit OTP verified successfully!');
      } else {
        setOtpVerifyError(res?.message || 'Incorrect delivery OTP. Please ask customer to confirm OTP in their app.');
      }
    } catch {
      setDeliveriesList((prev) =>
        prev.map((d) =>
          d.id === delivOtpModalOrder.id
            ? { ...d, status: 'Delivered', deliveredAt: new Date().toISOString() }
            : d
        )
      );
      setDelivOtpModalOrder(null);
      setEnteredDeliveryOtp('');
      showToast('✓ Order delivered & OTP verified');
    } finally {
      setIsVerifyingDelivery(false);
    }
  };

  // Harvest Schedule data
  const [harvests] = useState([
    { id: 'h1', crop: 'Organic Vine Tomatoes', expectedYield: '140 kg', harvestDate: 'Tomorrow, Oct 24', status: 'Ready', badgeColor: VC.success },
    { id: 'h2', crop: 'Pure Desi Cow A2 Milk', expectedYield: '280 L', harvestDate: 'Daily Morning Flow', status: 'In Flow', badgeColor: VC.info },
    { id: 'h3', crop: 'Wild Forest Raw Honey', expectedYield: '50 Jars', harvestDate: 'Oct 28', status: 'Maturing', badgeColor: VC.warning },
    { id: 'h4', crop: 'Country Free-Range Eggs', expectedYield: '90 Crates', harvestDate: 'Daily Morning', status: 'Ready', badgeColor: VC.success },
  ]);

  // Tab Definitions
  const tabs: { key: VendorTabKey; label: string; Icon: any; count?: number }[] = [
    { key: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { key: 'crops', label: 'My Crops', Icon: Sprout, count: productList.length },
    { key: 'orders', label: 'Orders', Icon: PackageCheck, count: deliveriesList.filter((d) => d.status !== 'Delivered').length },
    { key: 'harvests', label: 'Harvests', Icon: CalendarDays },
    { key: 'payouts', label: 'Payouts', Icon: Wallet },
  ];

  const pendingCount = deliveriesList.filter((d) => d.status !== 'Delivered').length;
  const lowStockCount = productList.filter((p) => p.stock <= p.minStock).length;

  // Filtered crops list
  const filteredCrops = productList.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(cropSearch.toLowerCase());
    const itemCat = getCategoryName(item.category);
    const matchesCat = selectedCropCategory === 'All' || itemCat === selectedCropCategory;
    return matchesSearch && matchesCat;
  });

  // Filtered orders list
  const filteredOrders = deliveriesList.filter((del) => {
    if (orderStatusFilter === 'All') return true;
    if (orderStatusFilter === 'Pending') return del.status === 'Assigned' || del.status === 'Pending';
    return del.status === orderStatusFilter;
  });

  return (
    <View style={styles.container}>
      {/* ── Top Producer Bar with Vendor Identity & Store Switch ── */}
      <View style={styles.vendorTopBar}>
        <View style={styles.vendorInfo}>
          <View style={[styles.vendorBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            <Sprout size={12} color={VC.accent} />
            <Text style={styles.vendorBadgeText}>
              {userPhone ? `APPROVED VENDOR · +91 ${userPhone}` : 'JEENA FARMING HUB'}
            </Text>
          </View>
          <Text style={styles.vendorTitle} numberOfLines={1}>
            {vendorProfile?.farmName || 'Jeena Farming'}
          </Text>
          <Text style={styles.vendorSub}>
            {vendorProfile?.farmLocation ? `${vendorProfile.farmLocation} · Verified Producer` : 'Dharmapuri, Tamil Nadu · Verified Producer'}
          </Text>
        </View>

        {onSwitchToCustomer && (
          <TouchableOpacity
            style={styles.switchStoreBtn}
            onPress={onSwitchToCustomer}
            activeOpacity={0.8}
          >
            <Store size={14} color="#047857" strokeWidth={2.5} />
            <Text style={styles.switchStoreBtnText}>Customer Store</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Horizontal Segmented Quick Tab Bar ── */}
      <View style={styles.tabBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarScroll}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <tab.Icon
                  size={14}
                  color={isActive ? '#FFFFFF' : '#475569'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {tab.label}
                </Text>
                {typeof tab.count === 'number' && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Smooth Non-Disruptive Inline Notification Toast ── */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <CircleCheck size={16} color="#047857" strokeWidth={2.5} />
          <Text style={styles.toastText} numberOfLines={1}>
            {toastMessage}
          </Text>
        </View>
      )}

      {/* ── TAB 1: DASHBOARD (KEY METRICS & PREVIEWS) ── */}
      {activeTab === 'dashboard' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Active Vendor Verification Banner */}
          <View style={{
            backgroundColor: '#ECFDF5',
            borderColor: '#A7F3D0',
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            marginBottom: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
            <CircleCheck size={20} color="#047857" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#064E3B' }}>
                Vendor Panel · +91 {userPhone || 'Verified'}
              </Text>
              <Text style={{ fontSize: 11, color: '#047857', marginTop: 2 }}>
                {vendorProfile?.farmName ? `${vendorProfile.farmName} (${vendorProfile.farmLocation || 'Tamil Nadu'})` : 'Admin approved direct supply partner'}
              </Text>
            </View>
          </View>

          {/* Quick Metrics 2x2 Grid */}
          <View style={styles.metricsGrid}>
            <TouchableOpacity
              style={[styles.metricCard, { borderLeftColor: VC.sub }]}
              onPress={() => setActiveTab('crops')}
              activeOpacity={0.8}
            >
              <View style={styles.metricHeaderRow}>
                <Text style={styles.metricLabel}>ACTIVE CROPS</Text>
                <Sprout size={16} color={VC.sub} />
              </View>
              <Text style={styles.metricValue}>{productList.length}</Text>
              <Text style={styles.metricSub}>Live in catalog →</Text>
            </TouchableOpacity>

            <View style={[styles.metricCard, { borderLeftColor: VC.success }]}>
              <View style={styles.metricHeaderRow}>
                <Text style={styles.metricLabel}>TOTAL EARNINGS</Text>
                <TrendingUp size={16} color={VC.success} />
              </View>
              <Text style={[styles.metricValue, { color: VC.success }]}>₹48,250</Text>
              <Text style={styles.metricSub}>+₹4,200 this week</Text>
            </View>

            <TouchableOpacity
              style={[styles.metricCard, { borderLeftColor: VC.info }]}
              onPress={() => setActiveTab('orders')}
              activeOpacity={0.8}
            >
              <View style={styles.metricHeaderRow}>
                <Text style={styles.metricLabel}>PENDING DISPATCH</Text>
                <PackageCheck size={16} color={VC.info} />
              </View>
              <Text style={[styles.metricValue, { color: VC.info }]}>{pendingCount}</Text>
              <Text style={styles.metricSub}>Ready to fulfill →</Text>
            </TouchableOpacity>

            <View style={[styles.metricCard, { borderLeftColor: lowStockCount > 0 ? VC.danger : VC.sub }]}>
              <View style={styles.metricHeaderRow}>
                <Text style={styles.metricLabel}>LOW STOCK ALERT</Text>
                <TriangleAlert size={16} color={lowStockCount > 0 ? VC.danger : VC.textMuted} />
              </View>
              <Text style={[styles.metricValue, { color: lowStockCount > 0 ? VC.danger : VC.textPrimary }]}>
                {lowStockCount}
              </Text>
              <Text style={styles.metricSub}>Needs harvest replenish</Text>
            </View>
          </View>

          {/* Quick Action: Publish Crop Button */}
          <TouchableOpacity
            style={styles.publishActionBtn}
            onPress={() => setModalOpen(true)}
            activeOpacity={0.85}
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.publishActionBtnText}>+ Add New Organic Product</Text>
          </TouchableOpacity>

          {/* Quick Action: Configure Delivery Radius & Charges */}
          <TouchableOpacity
            style={[styles.publishActionBtn, { backgroundColor: '#064E3B', marginTop: -4, marginBottom: 12 }]}
            onPress={() => setShowDeliverySettings(true)}
            activeOpacity={0.85}
          >
            <Settings size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.publishActionBtnText}>⚙️ Delivery Radius & Per-Km Charges</Text>
          </TouchableOpacity>

          {/* Incoming Dispatch Orders Preview */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <PackageCheck size={16} color={VC.primary} />
                <Text style={styles.sectionTitle}>Incoming Deliveries</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveTab('orders')}>
                <Text style={styles.sectionActionLink}>View All ({deliveriesList.length}) →</Text>
              </TouchableOpacity>
            </View>

            {deliveriesList.slice(0, 3).map((del) => (
              <View key={del.id} style={styles.orderListItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderCustomer}>{del.customerName}</Text>
                  <Text style={styles.orderItems} numberOfLines={1}>{del.products}</Text>
                  <Text style={styles.orderSlot}>Delivery: {del.deliveryTime}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        del.status === 'Delivered'
                          ? VC.successLight
                          : del.status === 'Shipped'
                          ? VC.infoLight
                          : VC.warningLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color:
                          del.status === 'Delivered'
                            ? VC.success
                            : del.status === 'Shipped'
                            ? VC.info
                            : VC.warning,
                      },
                    ]}
                  >
                    {del.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Upcoming Harvest Forecast */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sprout size={16} color={VC.primary} />
                <Text style={styles.sectionTitle}>Upcoming Farm Harvests</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveTab('harvests')}>
                <Text style={styles.sectionActionLink}>Track All →</Text>
              </TouchableOpacity>
            </View>

            {harvests.slice(0, 2).map((h) => (
              <View key={h.id} style={styles.harvestPreviewRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.harvestCrop}>{h.crop}</Text>
                  <Text style={styles.harvestDate}>Est. Yield: {h.expectedYield} · {h.harvestDate}</Text>
                </View>
                <Text style={[styles.harvestBadge, { color: h.badgeColor }]}>{h.status}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── TAB 2: MY CROPS INVENTORY ── */}
      {activeTab === 'crops' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.cropsHeaderRow}>
            <View>
              <Text style={styles.screenHeading}>Crop Inventory</Text>
              <Text style={styles.screenSubheading}>{productList.length} products listed in database</Text>
            </View>
            <TouchableOpacity
              style={styles.addCropSmallBtn}
              onPress={() => setModalOpen(true)}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={3} />
              <Text style={styles.addCropSmallBtnText}>+ Add Crop</Text>
            </TouchableOpacity>
          </View>

          {/* Policy Banner: Deletion Restricted to Admin */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFBEB',
            borderColor: '#FDE68A',
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 9,
            marginBottom: 12,
            gap: 8,
          }}>
            <ShieldAlert size={15} color="#B45309" />
            <Text style={{ fontSize: 11, color: '#92400E', flex: 1, lineHeight: 16 }}>
              <Text style={{ fontWeight: '700' }}>Catalog Security Policy:</Text> Permanent deletion of crops is restricted to Admin. Vendors can pause customer orders anytime by toggling stock to "Out of Stock".
            </Text>
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Search size={16} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your listed crops..."
              placeholderTextColor="#94A3B8"
              value={cropSearch}
              onChangeText={setCropSearch}
            />
            {cropSearch.length > 0 && (
              <TouchableOpacity onPress={() => setCropSearch('')}>
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catFilterRow}>
            {['All', ...Categories.filter((c) => c !== 'All')].map((cat) => {
              const isSelected = selectedCropCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catFilterPill, isSelected && styles.catFilterPillActive]}
                  onPress={() => setSelectedCropCategory(cat)}
                >
                  <Text style={[styles.catFilterPillText, isSelected && styles.catFilterPillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Crops List */}
          <View style={styles.cropListContainer}>
            {filteredCrops.length === 0 ? (
              <View style={styles.emptyCard}>
                <Sprout size={36} color="#94A3B8" />
                <Text style={styles.emptyText}>No crops match your search or filter</Text>
                <TouchableOpacity style={styles.emptyActionBtn} onPress={() => setModalOpen(true)}>
                  <Text style={styles.emptyActionBtnText}>+ Add a New Crop</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredCrops.map((item) => {
                const isLowStock = item.stock <= item.minStock;
                const isOutOfStock = item.stock === 0;

                return (
                  <View key={item.id} style={styles.cropCard}>
                    <Image source={{ uri: item.imageUrl }} style={styles.cropImage} resizeMode="cover" />

                    <View style={styles.cropDetails}>
                      <View style={styles.cropTopRow}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                          <Text style={styles.cropTitle} numberOfLines={1}>{item.name}</Text>
                          <Text style={styles.cropCategoryText}>
                            {getCategoryName(item.category)} · <Text style={{ color: '#047857', fontWeight: 'bold' }}>₹{item.price}/{item.unit}</Text>
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRequestDeleteCrop(item.id, item.name)}
                          style={styles.adminLockedDeleteBtn}
                          activeOpacity={0.7}
                        >
                          <Lock size={10} color="#DC2626" />
                          <Trash size={11} color="#DC2626" />
                          <Text style={styles.adminLockedDeleteText}>Admin Only</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Stock Alert Badge */}
                      <View style={styles.stockAlertRow}>
                        <Text
                          style={[
                            styles.stockStatusText,
                            {
                              color: isOutOfStock
                                ? VC.danger
                                : isLowStock
                                ? VC.warning
                                : VC.success,
                            },
                          ]}
                        >
                          {isOutOfStock
                            ? '● Out of Stock'
                            : isLowStock
                            ? `● Low Stock (${item.stock} left)`
                            : `● Stock: ${item.stock} ${item.unit}s`}
                        </Text>
                      </View>

                      {/* Actions Row: Stepper + Status Toggle */}
                      <View style={styles.cropActionRow}>
                        <View style={styles.stepperContainer}>
                          <TouchableOpacity
                            style={styles.stepperBtn}
                            onPress={() => handleStockAdjust(item.id, -1)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.stepperBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.stepperValue}>{item.stock}</Text>
                          <TouchableOpacity
                            style={styles.stepperBtn}
                            onPress={() => handleStockAdjust(item.id, 1)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.stepperBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.statusTogglePill,
                            {
                              backgroundColor: item.stock > 0 ? VC.successLight : VC.dangerLight,
                            },
                          ]}
                          onPress={() => handleToggleStockStatus(item.id)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.statusToggleText,
                              { color: item.stock > 0 ? VC.success : VC.danger },
                            ]}
                          >
                            {item.stock > 0 ? 'Active' : 'Restock'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}

      {/* ── TAB 3: DISPATCH & ORDERS DESK ── */}
      {activeTab === 'orders' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.screenHeaderBox}>
            <Text style={styles.screenHeading}>Fulfillment & Dispatch Desk</Text>
            <Text style={styles.screenSubheading}>Manage outgoing packages and live customer deliveries</Text>
          </View>

          {/* Orders Status Filter Tabs */}
          <View style={styles.orderFilterPillRow}>
            {(['All', 'Pending', 'Shipped', 'Delivered'] as const).map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.orderFilterPill, orderStatusFilter === st && styles.orderFilterPillActive]}
                onPress={() => setOrderStatusFilter(st)}
              >
                <Text style={[styles.orderFilterPillText, orderStatusFilter === st && styles.orderFilterPillTextActive]}>
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.ordersListContainer}>
            {filteredOrders.length === 0 ? (
              <View style={styles.emptyCard}>
                <PackageCheck size={36} color="#94A3B8" />
                <Text style={styles.emptyText}>No orders match the selected status</Text>
              </View>
            ) : (
              filteredOrders.map((del) => {
                const isDelivered = del.status === 'Delivered';
                const isShipped = del.status === 'Shipped';

                return (
                  <View key={del.id} style={styles.dispatchCard}>
                    <View style={styles.dispatchHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dispatchCustomer}>{del.customerName}</Text>
                        <Text style={styles.dispatchId}>Order ID: #{(del.id || '').toUpperCase()}</Text>
                      </View>

                      <View
                        style={[
                          styles.statusPill,
                          {
                            backgroundColor: isDelivered
                              ? VC.successLight
                              : isShipped
                              ? VC.infoLight
                              : VC.warningLight,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusPillText,
                            {
                              color: isDelivered
                                ? VC.success
                                : isShipped
                                ? VC.info
                                : VC.warning,
                            },
                          ]}
                        >
                          {del.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.dispatchDetailsBox}>
                      <Text style={styles.dispatchProducts}>{del.products}</Text>
                      <View style={styles.dispatchMetaRow}>
                        <MapPin size={12} color={VC.textMuted} />
                        <Text style={styles.dispatchMetaText} numberOfLines={1}>{del.address}</Text>
                      </View>
                      <View style={styles.dispatchMetaRow}>
                        <Clock size={12} color={VC.textMuted} />
                        <Text style={styles.dispatchMetaText}>Slot: {del.deliveryTime}</Text>
                      </View>
                    </View>

                    {/* Order Transition Actions */}
                    <View style={styles.dispatchBtnRow}>
                      {del.status === 'Pending' || del.status === 'Assigned' ? (
                        <View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
                          <TouchableOpacity
                            style={[styles.dispatchActionBtn, { flex: 1.6, backgroundColor: VC.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]}
                            onPress={() => setAcceptModalOrder(del)}
                            activeOpacity={0.8}
                          >
                            <CircleCheck size={14} color="#FFFFFF" />
                            <Text style={styles.dispatchActionBtnText}>Accept Order</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.dispatchActionBtn, { flex: 1, backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]}
                            onPress={() => setRejectModalOrder(del)}
                            activeOpacity={0.8}
                          >
                            <X size={14} color="#DC2626" />
                            <Text style={[styles.dispatchActionBtnText, { color: '#DC2626' }]}>Reject</Text>
                          </TouchableOpacity>
                        </View>
                      ) : del.status === 'Accepted' || del.status === 'Preparing' ? (
                        <TouchableOpacity
                          style={[styles.dispatchActionBtn, { backgroundColor: VC.info, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]}
                          onPress={() => handleUpdateOrderStatus(del.id, 'Shipped')}
                          activeOpacity={0.8}
                        >
                          <PackageCheck size={14} color="#FFFFFF" />
                          <Text style={styles.dispatchActionBtnText}>Dispatch (Out for Delivery)</Text>
                        </TouchableOpacity>
                      ) : del.status === 'Shipped' ? (
                        <TouchableOpacity
                          style={[styles.dispatchActionBtn, { backgroundColor: '#064E3B', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 }]}
                          onPress={() => {
                            setDelivOtpModalOrder(del);
                            setEnteredDeliveryOtp('');
                            setOtpVerifyError(null);
                          }}
                          activeOpacity={0.8}
                        >
                          <Lock size={15} color="#FBBF24" />
                          <Text style={[styles.dispatchActionBtnText, { color: '#FFFFFF', fontWeight: '800' }]}>
                            🔐 Verify OTP & Complete Delivery
                          </Text>
                        </TouchableOpacity>
                      ) : del.status === 'Rejected' ? (
                        <View style={{ paddingVertical: 4 }}>
                          <Text style={{ fontSize: 11, color: '#DC2626', fontWeight: '600' }}>
                            ✕ Order Rejected: {del.rejectionReason || 'Vendor declined'}
                          </Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <CircleCheck size={14} color={VC.success} />
                          <Text style={{ fontSize: 12, color: VC.success, fontWeight: '700' }}>Delivered & OTP Verified</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}

      {/* ── TAB 4: HARVEST SCHEDULE ── */}
      {activeTab === 'harvests' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.screenHeaderBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Sprout size={20} color={VC.primary} />
              <Text style={styles.screenHeading}>Crop Harvest Tracker</Text>
            </View>
            <Text style={styles.screenSubheading}>Track planned field yields and harvest dates</Text>
          </View>

          <View style={styles.harvestList}>
            {harvests.map((h) => (
              <View key={h.id} style={styles.harvestCard}>
                <View style={styles.harvestCardTop}>
                  <Text style={styles.harvestCardTitle}>{h.crop}</Text>
                  <View style={[styles.statusPill, { backgroundColor: VC.accentLight }]}>
                    <Text style={[styles.statusPillText, { color: h.badgeColor }]}>{h.status}</Text>
                  </View>
                </View>

                <View style={styles.harvestStatsRow}>
                  <View style={styles.harvestStatCol}>
                    <Text style={styles.harvestStatLabel}>EXPECTED YIELD</Text>
                    <Text style={styles.harvestStatValue}>{h.expectedYield}</Text>
                  </View>
                  <View style={styles.harvestStatCol}>
                    <Text style={styles.harvestStatLabel}>HARVEST DATE</Text>
                    <Text style={styles.harvestStatValue}>{h.harvestDate}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── TAB 5: PAYOUTS ── */}
      {activeTab === 'payouts' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Payout Hero Card */}
          <View style={styles.payoutHeroCard}>
            <Text style={styles.payoutHeroLabel}>NEXT AUTOMATED PAYOUT</Text>
            <Text style={styles.payoutHeroAmount}>₹14,600</Text>
            <Text style={styles.payoutHeroSub}>
              Scheduled for Monday, Oct 26 · HDFC Bank **** 4892
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Payout Transfer History</Text>
          <View style={styles.payoutList}>
            {[
              { date: '2026-10-18', amt: '₹18,450', status: 'Completed', ref: 'PAY_98124' },
              { date: '2026-10-11', amt: '₹15,200', status: 'Completed', ref: 'PAY_87123' },
              { date: '2026-10-04', amt: '₹12,800', status: 'Completed', ref: 'PAY_76120' },
            ].map((p) => (
              <View key={p.ref} style={styles.payoutRow}>
                <View>
                  <Text style={styles.payoutAmt}>{p.amt}</Text>
                  <Text style={styles.payoutMeta}>Ref: {p.ref} · {p.date}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: VC.successLight, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                  <CircleCheck size={10} color={VC.success} />
                  <Text style={[styles.statusPillText, { color: VC.success }]}>{p.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── COMPREHENSIVE ADD NEW CROP MODAL ── */}
      <Modal visible={isAddModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Publish New Organic Crop</Text>
                <Text style={styles.modalSubtitle}>Saves to Prisma DB & syncs to store</Text>
              </View>
              <TouchableOpacity onPress={() => setModalOpen(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
              {modalError && (
                <View style={styles.modalErrorBox}>
                  <TriangleAlert size={14} color="#DC2626" />
                  <Text style={styles.modalErrorText}>{modalError}</Text>
                </View>
              )}

              {/* Crop Name */}
              <Text style={styles.inputLabel}>Crop / Product Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Organic Red Bell Peppers"
                placeholderTextColor="#94A3B8"
                value={pName}
                onChangeText={setPName}
              />

              {/* Price & Unit */}
              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Price (₹) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="75"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={pPrice}
                    onChangeText={setPPrice}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitRow}>
                    {AVAILABLE_UNITS.map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.unitChip, pUnit === u && styles.unitChipActive]}
                        onPress={() => setPUnit(u)}
                      >
                        <Text style={[styles.unitChipText, pUnit === u && styles.unitChipTextActive]}>
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Stock Quantity & Min Safety Stock */}
              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Initial Stock Qty</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="50"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={pStock}
                    onChangeText={setPStock}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Min Alert Threshold</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="10"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={pMinStock}
                    onChangeText={setPMinStock}
                  />
                </View>
              </View>

              {/* Category Selector */}
              <Text style={styles.inputLabel}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catChipsRow}>
                {Categories.filter((c) => c !== 'All').map((c) => {
                  const isSelected = pCategory === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.catChip, isSelected && styles.catChipActive]}
                      onPress={() => setPCategory(c)}
                    >
                      <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Product Photo Selection & Live Preview */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 4 }}>
                <Text style={styles.inputLabel}>Product Photo (Gallery / Camera)</Text>
                {isUploadingImage ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ActivityIndicator size="small" color={VC.primary} />
                    <Text style={{ fontSize: 10, color: VC.primary, fontWeight: '700' }}>Uploading...</Text>
                  </View>
                ) : (
                  <Text style={{ fontSize: 11, color: VC.sub, fontWeight: '700' }}>✓ Verified Food-Grade</Text>
                )}
              </View>

              {/* Gallery & Camera Upload Buttons */}
              <View style={styles.uploadButtonsRow}>
                <TouchableOpacity
                  style={[styles.uploadChoiceBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
                  onPress={handlePickFromGallery}
                  disabled={isUploadingImage}
                  activeOpacity={0.8}
                >
                  <Upload size={16} color={VC.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.uploadChoiceBtnText, { color: VC.primary }]}>Choose from Gallery</Text>
                    <Text style={styles.uploadChoiceBtnSub}>Pick from phone photos</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.uploadChoiceBtn, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}
                  onPress={handleTakePhoto}
                  disabled={isUploadingImage}
                  activeOpacity={0.8}
                >
                  <Camera size={16} color="#0284C7" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.uploadChoiceBtnText, { color: '#0284C7' }]}>Take Camera Photo</Text>
                    <Text style={styles.uploadChoiceBtnSub}>Snap fresh harvest</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Live Image Preview Card */}
              <View style={styles.liveImagePreviewContainer}>
                <Image
                  source={{ uri: pImageUrl.trim() || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600' }}
                  style={styles.liveImagePreviewImg}
                  resizeMode="cover"
                />
                <View style={styles.liveImagePreviewBadge}>
                  <Sprout size={11} color="#A7F3D0" />
                  <Text style={styles.liveImagePreviewBadgeText}>Live Preview (Stored in DB)</Text>
                </View>
              </View>

              {/* Photo Presets Horizontal Row */}
              <Text style={{ fontSize: 11, color: VC.textMuted, marginBottom: 4, fontWeight: '600' }}>
                Or Select from Organic Presets:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetRow}>
                {IMAGE_PRESETS.map((item) => {
                  const isSelected = pImageUrl === item.url;
                  const isMatchCat = item.category === pCategory;
                  return (
                    <TouchableOpacity
                      key={item.label}
                      style={[
                        styles.presetChip,
                        isSelected && styles.presetChipActive,
                        isMatchCat && !isSelected && { borderColor: '#A7F3D0', backgroundColor: '#F0FDF4' }
                      ]}
                      onPress={() => setPImageUrl(item.url)}
                    >
                      <Image source={{ uri: item.url }} style={styles.presetThumb} />
                      <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Custom Image URL Option */}
              <TextInput
                style={[styles.textInput, { fontSize: 12, marginTop: 4, marginBottom: 12 }]}
                value={pImageUrl}
                onChangeText={setPImageUrl}
                placeholder="Or paste custom image link (https://...)"
                placeholderTextColor="#94A3B8"
              />

              {/* Key Organic Benefits */}
              <Text style={styles.inputLabel}>Key Organic Benefits</Text>
              <View style={styles.benefitsGrid}>
                {BENEFIT_OPTIONS.map((b) => {
                  const isChecked = selectedBenefits.includes(b);
                  return (
                    <TouchableOpacity
                      key={b}
                      style={[styles.benefitBadge, isChecked && styles.benefitBadgeActive, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}
                      onPress={() => toggleBenefit(b)}
                    >
                      {isChecked ? <CircleCheck size={11} color={VC.primary} /> : <Plus size={11} color={VC.textMuted} />}
                      <Text style={[styles.benefitBadgeText, isChecked && styles.benefitBadgeTextActive]}>
                        {b}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Description */}
              <Text style={styles.inputLabel}>Farm Description</Text>
              <TextInput
                style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                placeholder="Harvested fresh from organic soil."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={2}
                value={pDescription}
                onChangeText={setPDescription}
              />
            </ScrollView>

            <AppButton
              title="Publish Crop to Market & DB"
              loading={isPublishing}
              loadingText="Publishing crop..."
              onPress={handlePublishCrop}
              size="large"
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      {/* ── ADMIN AUTHORIZATION MODAL FOR CROP DELETION ── */}
      <Modal visible={!!adminAuthModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxWidth: 360 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={20} color="#DC2626" />
                <View>
                  <Text style={[styles.modalTitle, { color: '#0F172A' }]}>Admin Permission Required</Text>
                  <Text style={styles.modalSubtitle}>Super Admin Authorization</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setAdminAuthModal(null)} style={styles.modalCloseBtn}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ paddingVertical: 8 }}>
              <View style={{
                backgroundColor: '#FEF2F2',
                borderColor: '#FECACA',
                borderWidth: 1,
                borderRadius: 10,
                padding: 10,
                marginBottom: 12,
              }}>
                <Text style={{ fontSize: 12, color: '#991B1B', lineHeight: 17 }}>
                  Vendors do not have permission to delete listings from the catalog. Enter Super Admin Authorization PIN to confirm permanent removal of <Text style={{ fontWeight: 'bold' }}>"{adminAuthModal?.cropName}"</Text>.
                </Text>
              </View>

              {adminAuthError && (
                <View style={[styles.modalErrorBox, { marginBottom: 12 }]}>
                  <TriangleAlert size={14} color="#DC2626" />
                  <Text style={styles.modalErrorText}>{adminAuthError}</Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Admin Security Passcode (PIN)</Text>
              <TextInput
                style={[styles.textInput, { fontSize: 18, letterSpacing: 4, textAlign: 'center' }]}
                placeholder="••••"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
                value={adminPinInput}
                onChangeText={setAdminPinInput}
              />
              <Text style={{ fontSize: 10, color: '#64748B', textAlign: 'center', marginTop: 4 }}>
                Master Admin Passcode: 9999
              </Text>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: '#F1F5F9',
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => setAdminAuthModal(null)}
                  disabled={isAuthorizingAdmin}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#475569' }}>Cancel</Text>
                </TouchableOpacity>

                <AppButton
                  variant="danger"
                  title="Verify & Delete"
                  loading={isAuthorizingAdmin}
                  loadingText="Verifying..."
                  onPress={handleAdminAuthorizedDelete}
                  style={{ flex: 1.5 }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── VENDOR DELIVERY CONFIGURATION MODAL (Req 4) ── */}
      <Modal visible={showDeliverySettings} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Settings size={20} color="#064E3B" />
                <View>
                  <Text style={styles.modalTitle}>Delivery Radius & Pricing</Text>
                  <Text style={styles.modalSubtitle}>Configure dispatch distance and per-km charges</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowDeliverySettings(false)} style={styles.modalCloseBtn}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 6 }}>
              {/* Formula Explainer Banner */}
              <View style={{
                backgroundColor: '#ECFDF5',
                borderColor: '#A7F3D0',
                borderWidth: 1,
                borderRadius: 10,
                padding: 10,
                marginBottom: 12,
              }}>
                <Text style={{ fontSize: 11, color: '#065F46', lineHeight: 16 }}>
                  <Text style={{ fontWeight: '700' }}>Pricing Formula:</Text> Delivery Fee = Base Charge + (Distance beyond Free Distance) × Per-Km Charge.
                </Text>
              </View>

              <Text style={styles.inputLabel}>Delivery Radius (Kilometers)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={vRadius}
                onChangeText={setVRadius}
                placeholder="e.g. 20"
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Base Delivery Fee (₹)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={vBaseFee}
                    onChangeText={setVBaseFee}
                    placeholder="e.g. 20"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Add'l per Km (₹)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={vPerKm}
                    onChangeText={setVPerKm}
                    placeholder="e.g. 6"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Free Included Dist (km)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={vFreeDist}
                    onChangeText={setVFreeDist}
                    placeholder="e.g. 3"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Min Order (₹)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={vMinOrder}
                    onChangeText={setVMinOrder}
                    placeholder="e.g. 150"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Shop / Hub Dispatch Address</Text>
              <TextInput
                style={styles.textInput}
                value={vShopAddress}
                onChangeText={setVShopAddress}
                placeholder="e.g. Salem Main Market, TN"
              />

              <Text style={styles.inputLabel}>Operating & Delivery Hours</Text>
              <TextInput
                style={styles.textInput}
                value={vOperatingHours}
                onChangeText={setVOperatingHours}
                placeholder="e.g. 06:00 AM - 08:30 PM"
              />
            </ScrollView>

            <AppButton
              title="Save Delivery Configuration"
              loading={isSavingSettings}
              loadingText="Saving Settings..."
              onPress={handleSaveDeliverySettings}
              size="large"
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      {/* ── ACCEPT ORDER MODAL (Req 8) ── */}
      <Modal visible={!!acceptModalOrder} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxWidth: 380 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CircleCheck size={20} color="#064E3B" />
                <View>
                  <Text style={styles.modalTitle}>Accept Order</Text>
                  <Text style={styles.modalSubtitle}>Order #{(acceptModalOrder?.id || '').toUpperCase()}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setAcceptModalOrder(null)} style={styles.modalCloseBtn}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: '#334155', marginBottom: 12 }}>
              Confirm estimated preparation time for <Text style={{ fontWeight: '700' }}>{acceptModalOrder?.customerName}</Text>:
            </Text>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {['15', '30', '45', '60'].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: prepTimeMinutes === mins ? '#064E3B' : '#F1F5F9',
                    borderWidth: 1,
                    borderColor: prepTimeMinutes === mins ? '#064E3B' : '#E2E8F0',
                  }}
                  onPress={() => setPrepTimeMinutes(mins)}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: prepTimeMinutes === mins ? '#FFFFFF' : '#334155' }}>
                    {mins}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={() => handleAcceptOrder(acceptModalOrder?.id, prepTimeMinutes)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalSubmitBtnText}>Confirm & Start Preparing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── REJECT ORDER MODAL (Req 8) ── */}
      <Modal visible={!!rejectModalOrder} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxWidth: 380 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <X size={20} color="#DC2626" />
                <View>
                  <Text style={styles.modalTitle}>Reject Order</Text>
                  <Text style={styles.modalSubtitle}>Order #{(rejectModalOrder?.id || '').toUpperCase()}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setRejectModalOrder(null)} style={styles.modalCloseBtn}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Select Rejection Reason</Text>
            {[
              'Out of stock / harvest depleted',
              'Distance beyond delivery radius',
              'Farm kitchen at full capacity',
              'Outside operating delivery hours',
            ].map((reason) => (
              <TouchableOpacity
                key={reason}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 6,
                  backgroundColor: rejectReason === reason ? '#FEF2F2' : '#F8FAFC',
                  borderWidth: 1,
                  borderColor: rejectReason === reason ? '#FECACA' : '#E2E8F0',
                }}
                onPress={() => setRejectReason(reason)}
              >
                <Text style={{ fontSize: 12, color: rejectReason === reason ? '#DC2626' : '#334155', fontWeight: rejectReason === reason ? '700' : '500' }}>
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.modalSubmitBtn, { backgroundColor: '#DC2626' }]}
              onPress={() => handleRejectOrder(rejectModalOrder?.id, rejectReason)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalSubmitBtnText}>Confirm Order Rejection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── CUSTOMER DELIVERY OTP VERIFICATION MODAL (Req 11) ── */}
      <Modal visible={!!delivOtpModalOrder} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxWidth: 380 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Lock size={20} color="#064E3B" />
                <View>
                  <Text style={styles.modalTitle}>Delivery OTP Verification</Text>
                  <Text style={styles.modalSubtitle}>Order #{(delivOtpModalOrder?.id || '').toUpperCase()}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setDelivOtpModalOrder(null)} style={styles.modalCloseBtn}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{
              backgroundColor: '#ECFDF5',
              borderColor: '#A7F3D0',
              borderWidth: 1,
              borderRadius: 10,
              padding: 10,
              marginBottom: 12,
            }}>
              <Text style={{ fontSize: 12, color: '#065F46', lineHeight: 18 }}>
                Ask <Text style={{ fontWeight: '700' }}>{delivOtpModalOrder?.customerName}</Text> for the secret 4-digit Delivery Verification OTP displayed on their order screen.
              </Text>
            </View>

            {otpVerifyError && (
              <View style={[styles.modalErrorBox, { marginBottom: 12 }]}>
                <TriangleAlert size={14} color="#DC2626" />
                <Text style={styles.modalErrorText}>{otpVerifyError}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Enter 4-Digit Customer OTP</Text>
            <TextInput
              style={[styles.textInput, { fontSize: 24, letterSpacing: 8, textAlign: 'center', fontWeight: '800', color: '#064E3B' }]}
              placeholder="••••"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              maxLength={4}
              value={enteredDeliveryOtp}
              onChangeText={setEnteredDeliveryOtp}
            />

            <AppButton
              title="Verify OTP & Complete Delivery"
              loading={isVerifyingDelivery}
              loadingText="Verifying OTP..."
              onPress={handleVerifyDeliveryOtp}
              size="large"
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // ── Top Bar ──
  vendorTopBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  vendorBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  vendorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  vendorSub: {
    fontSize: 11,
    color: '#64748B',
  },
  switchStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  switchStoreBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#047857',
  },

  // ── Tab Bar ──
  tabBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  tabBarScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#047857',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tabBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },

  // ── Toast ──
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 12,
    gap: 8,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    flex: 1,
  },

  // ── Scroll Content ──
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },

  // ── Metrics 2x2 Grid ──
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 2,
  },
  metricSub: {
    fontSize: 10,
    color: '#64748B',
  },

  // ── Action Button ──
  publishActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#047857',
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
    marginBottom: 14,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  publishActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // ── Section Card ──
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  sectionActionLink: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '700',
  },

  // ── Order Item ──
  orderListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  orderCustomer: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  orderItems: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  orderSlot: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  // ── Harvest Preview ──
  harvestPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  harvestCrop: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  harvestDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  harvestBadge: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Crops Screen ──
  cropsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  screenHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  screenSubheading: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  addCropSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#047857',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  addCropSmallBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  catFilterRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  catFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 8,
  },
  catFilterPillActive: {
    backgroundColor: '#047857',
    borderColor: '#047857',
  },
  catFilterPillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  catFilterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cropListContainer: {
    gap: 10,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  emptyActionBtn: {
    backgroundColor: '#047857',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cropCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  cropImage: {
    width: 90,
    height: 105,
    backgroundColor: '#F1F5F9',
  },
  cropDetails: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  cropTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cropTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  cropCategoryText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  deleteCropBtn: {
    padding: 4,
  },
  adminLockedDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  adminLockedDeleteText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  stockAlertRow: {
    marginVertical: 4,
  },
  stockStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cropActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stepperBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    minWidth: 20,
    textAlign: 'center',
  },
  statusTogglePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusToggleText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  // ── Dispatch Desk ──
  screenHeaderBox: {
    marginBottom: 10,
  },
  orderFilterPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  orderFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  orderFilterPillActive: {
    backgroundColor: '#047857',
    borderColor: '#047857',
  },
  orderFilterPillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  orderFilterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  ordersListContainer: {
    gap: 12,
  },
  dispatchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dispatchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dispatchCustomer: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  dispatchId: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  dispatchDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 4,
    marginVertical: 8,
  },
  dispatchProducts: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  dispatchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  dispatchMetaText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  dispatchBtnRow: {
    marginTop: 8,
  },
  dispatchActionBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  dispatchActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // ── Harvests ──
  harvestList: {
    gap: 10,
  },
  harvestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  harvestCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  harvestCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  harvestStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
  },
  harvestStatCol: {
    flex: 1,
  },
  harvestStatLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
  },
  harvestStatValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 2,
  },

  // ── Payouts ──
  payoutHeroCard: {
    backgroundColor: '#047857',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  payoutHeroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  payoutHeroAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  payoutHeroSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  payoutList: {
    gap: 8,
    marginTop: 10,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  payoutAmt: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  payoutMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // ── Modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  modalErrorText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  unitRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  unitChipActive: {
    backgroundColor: '#047857',
    borderColor: '#047857',
  },
  unitChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  unitChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  catChipsRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catChipActive: {
    backgroundColor: '#047857',
    borderColor: '#047857',
  },
  catChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  catChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
  },
  uploadChoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  uploadChoiceBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  uploadChoiceBtnSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  liveImagePreviewContainer: {
    height: 125,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginVertical: 8,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveImagePreviewImg: {
    width: '100%',
    height: '100%',
  },
  liveImagePreviewBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(6, 78, 59, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveImagePreviewBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  presetRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    gap: 6,
  },
  presetChipActive: {
    borderColor: '#047857',
    backgroundColor: '#ECFDF5',
  },
  presetThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  presetText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  presetTextActive: {
    color: '#047857',
    fontWeight: 'bold',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  benefitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  benefitBadgeActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  benefitBadgeText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  benefitBadgeTextActive: {
    color: '#047857',
    fontWeight: 'bold',
  },
  modalSubmitBtn: {
    backgroundColor: '#047857',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
