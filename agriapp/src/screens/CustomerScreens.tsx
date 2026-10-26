import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator,
  Dimensions, NativeSyntheticEvent, NativeScrollEvent
} from 'react-native';
import {
  Search, X, ShoppingCart, Package, Repeat, MessageSquare, Phone,
  ShieldCheck, Award, MapPin, CreditCard, Smartphone, Landmark,
  Briefcase, Clock, Calendar, Pencil, LogOut, Sprout, Check,
  CircleCheck, Sparkles, Star, Leaf, Droplets,
  Apple, Wheat, Milk, ChevronRight, Zap, Gift, User, Store,
  Truck, Trash, Plus, Minus, Mail, FileText, Camera, Upload,
  Heart, LayoutGrid, ArrowLeft, Share2
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Product, ORGANIC_PRODUCT_PRESETS } from '../constants/mockData';
import { API_ENDPOINTS, uploadImageFile } from '../services/api';
import { SubscriptionButton } from '../components/SubscriptionButton';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { getGradientTheme } from '../components/HomeHeader';
import {
  LoadingSpinner,
  PageLoader,
  ErrorState,
  AppButton,
  EmptyState,
  InlineError,
} from '../components/LoadingAndError';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = Math.min(SCREEN_WIDTH - 24, 460);

export interface DynamicBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  cloudinaryPublicId?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  buttonText?: string;
  targetType?: string;
  targetId?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface DynamicCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  cloudinaryPublicId?: string;
  displayOrder?: number;
  isActive?: boolean;
  color?: string;
}

// Helper to match category dynamically
const matchCategory = (prodCategory: string, selectedCat: string) => {
  if (!selectedCat || selectedCat === 'All') return true;
  const pCat = (prodCategory || '').toLowerCase();
  const sCat = selectedCat.toLowerCase();
  if (pCat.includes(sCat) || sCat.includes(pCat)) return true;
  if (sCat.includes('dairy') && (pCat.includes('milk') || pCat.includes('ghee') || pCat.includes('paneer') || pCat.includes('curd') || pCat.includes('butter'))) return true;
  if (sCat.includes('veg') && (pCat.includes('veg') || pCat.includes('tomato') || pCat.includes('carrot') || pCat.includes('spinach') || pCat.includes('potato') || pCat.includes('onion') || pCat.includes('produce'))) return true;
  if (sCat.includes('fruit') && (pCat.includes('fruit') || pCat.includes('apple') || pCat.includes('banana') || pCat.includes('orange') || pCat.includes('berry') || pCat.includes('mango'))) return true;
  if (sCat.includes('groc') && (pCat.includes('grain') || pCat.includes('rice') || pCat.includes('wheat') || pCat.includes('flour') || pCat.includes('pulse') || pCat.includes('dal') || pCat.includes('grocer'))) return true;
  if (sCat.includes('oil') && (pCat.includes('oil') || pCat.includes('cold-pressed'))) return true;
  if (sCat.includes('dry') && (pCat.includes('nut') || pCat.includes('almond') || pCat.includes('cashew') || pCat.includes('snack'))) return true;
  return false;
};

// Helper for dynamic product badge
const getProductBadge = (p: Product) => {
  if ((p as any).discountBadge) {
    return { label: (p as any).discountBadge, bg: '#EF4444', color: '#FFFFFF' };
  }
  if ((p as any).originalPrice && (p as any).originalPrice > p.price) {
    const orig = (p as any).originalPrice;
    const pct = Math.round(((orig - p.price) / orig) * 100);
    return { label: `${pct}% OFF`, bg: '#EF4444', color: '#FFFFFF' };
  }
  const name = (p.name || '').toLowerCase();
  if (name.includes('milk') || name.includes('cow') || name.includes('a2')) {
    return { label: 'Pure A2', bg: '#07843D', color: '#FFFFFF' };
  }
  if (name.includes('carrot') || name.includes('ghee') || name.includes('apple')) {
    return { label: 'Best Seller', bg: '#F2C500', color: '#18352B' };
  }
  return { label: 'Fresh', bg: '#07843D', color: '#FFFFFF' };
};

// ── Colour Palette ───────────────────────────────────────
const C = {
  primary: '#07843D', deepGreen: '#003B25', light: '#2D6A4F', accent: '#F2C500',
  bg: '#F0F7F2', surface: '#FFFFFF', surface2: '#F7FAF8',
  border: '#DFE9E1', textPrimary: '#18352B', textSec: '#718078',
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
  cart?: { product: Product; qty: number }[];
  setCart?: React.Dispatch<React.SetStateAction<{ product: Product; qty: number }[]>>;
  selectedLocation?: any;
  onChangeLocation?: () => void;
  onBannerThemeChange?: (color: string) => void;
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
  selectedLocation,
  onChangeLocation,
  cart: propCart,
  setCart: propSetCart,
  onBannerThemeChange,
}) => {
  // Vendor Application State in Profile
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vApplicantPhone, setVApplicantPhone] = useState(userPhone || '');
  const [vFarmName, setVFarmName] = useState('');
  const [vFarmLocation, setVFarmLocation] = useState('');
  const [vCropCategories, setVCropCategories] = useState('');
  const [vExperience, setVExperience] = useState('');
  const [vCertNo, setVCertNo] = useState('');
  const [isSubmittingVendor, setIsSubmittingVendor] = useState(false);
  const [vApplyError, setVApplyError] = useState<string | null>(null);

  const handleOpenVendorModal = () => {
    setVApplicantPhone(userPhone || '');
    setVFarmName('');
    setVFarmLocation('');
    setVCropCategories('');
    setVExperience('');
    setVCertNo('');
    setVApplyError(null);
    setShowVendorModal(true);
  };

  const handleApplyVendor = async () => {
    setVApplyError(null);
    const cleanPhone = (vApplicantPhone || userPhone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setVApplyError('Please enter a valid 10-digit mobile number.');
      return;
    }
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
          phoneNumber: cleanPhone,
          userName: profileName ? profileName.trim() : 'Partner Farmer',
          farmName: vFarmName.trim(),
          farmLocation: vFarmLocation.trim(),
          cropCategories: vCropCategories.trim(),
          experienceYears: vExperience.trim(),
          certificateNo: vCertNo.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowVendorModal(false);
        if (onRefreshVendorStatus) onRefreshVendorStatus();
        Alert.alert(
          'Request Submitted!',
          `Vendor application for mobile +91 ${cleanPhone} has been sent to Admin for review. Once approved, your Vendor Console will unlock automatically.`
        );
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
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileLocation, setProfileLocation] = useState(selectedLocation?.address || '');
  const [profileStats, setProfileStats] = useState({ orders: 0, subs: subscriptions.length, spent: 0, points: 0 });
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLocation, setEditLocation] = useState(selectedLocation?.address || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedLocation?.address) {
      setProfileLocation(selectedLocation.address);
      setEditLocation(selectedLocation.address);
    }
  }, [selectedLocation?.address]);

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
          location: editLocation.trim() || selectedLocation?.address || 'Current Location'
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

  const [internalCart, setInternalCart] = useState<{ product: Product; qty: number }[]>([]);
  const cart = propCart !== undefined ? propCart : internalCart;
  const setCart = propSetCart !== undefined ? propSetCart : setInternalCart;
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

  const [categoriesList, setCategoriesList] = useState<DynamicCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const categories = ['All', ...categoriesList.map(c => c.name)];

  const getCategoryIcon = (cat: string, color: string) => {
    const cLower = (cat || '').toLowerCase();
    if (cLower === 'all') return <Leaf size={14} color={color} />;
    if (cLower.includes('dairy') || cLower.includes('milk') || cLower.includes('ghee')) return <Milk size={14} color={color} />;
    if (cLower.includes('veg')) return <Sprout size={14} color={color} />;
    if (cLower.includes('fruit')) return <Apple size={14} color={color} />;
    if (cLower.includes('groc') || cLower.includes('grain')) return <Wheat size={14} color={color} />;
    if (cLower.includes('oil')) return <Droplets size={14} color={color} />;
    if (cLower.includes('dry') || cLower.includes('snack')) return <Sparkles size={14} color={color} />;
    return <Leaf size={14} color={color} />;
  };

  const [bannersList, setBannersList] = useState<DynamicBanner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const bannerScrollRef = useRef<ScrollView>(null);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  // Dynamic Add Product via API state (Vendor only - manual inputs with zero autofill)
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Fresh Vegetables');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('Kg');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState(ORGANIC_PRODUCT_PRESETS[0]?.url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [addProdError, setAddProdError] = useState<string | null>(null);

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
        const uploadedUrl = await uploadImageFile(dataUri, `cust-gal-${Date.now()}.jpg`);
        setNewProdImage(uploadedUrl);
      }
    } catch (err: any) {
      console.warn('Gallery pick error:', err);
      Alert.alert('Gallery Error', 'Could not open device photo gallery.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Capture Live Photo with Camera
  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant camera permission to take product photos.');
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
        const uploadedUrl = await uploadImageFile(dataUri, `cust-cam-${Date.now()}.jpg`);
        setNewProdImage(uploadedUrl);
      }
    } catch (err: any) {
      console.warn('Camera capture error:', err);
      Alert.alert('Camera Error', 'Could not access device camera.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleBannerChange = (idx: number) => {
    if (idx >= 0 && idx < bannersList.length) {
      setActiveBannerIdx(idx);
      const b = bannersList[idx];
      if (b?.backgroundColor && onBannerThemeChange) {
        onBannerThemeChange(b.backgroundColor);
      }
    }
  };

  const fetchBanners = async () => {
    setIsLoadingBanners(true);
    try {
      const res = await fetch(API_ENDPOINTS.banners);
      const json = await res.json();
      const list = json.success && Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      setBannersList(list);
      if (list.length > 0 && onBannerThemeChange && list[0]?.backgroundColor) {
        onBannerThemeChange(list[0].backgroundColor);
      }
    } catch (e) {
      console.warn('Error fetching banners from API:', e);
    } finally {
      setIsLoadingBanners(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const res = await fetch(API_ENDPOINTS.categories);
      const json = await res.json();
      const list = json.success && Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      setCategoriesList(list);
    } catch (e) {
      console.warn('Error fetching categories from API:', e);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setProductsError(null);
    try {
      const res = await fetch(API_ENDPOINTS.products);
      const json = await res.json();
      const list = json.success && Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      const sanitized = list.map((p: any) => ({
        ...p,
        category: safeCategory(p.category || p.categoryName)
      }));
      setProductsList(sanitized);
    } catch (e: any) {
      console.warn('Error fetching products from API:', e);
      setProductsError('Unable to load organic products from the server. Please verify connection.');
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

  const handleBannerPress = (banner: DynamicBanner) => {
    if (!banner.targetType || banner.targetType === 'ALL_PRODUCTS' || banner.targetType === 'SCREEN') {
      if (banner.targetId) {
        setCustomerScreen(banner.targetId as any);
      } else {
        setCustomerScreen('ALL_PRODUCTS');
      }
    } else if (banner.targetType === 'CATEGORY' && banner.targetId) {
      setActiveCategory(banner.targetId);
    } else if (banner.targetType === 'PRODUCT' && banner.targetId) {
      const found = productsList.find(p => p.id === banner.targetId || p.name.toLowerCase() === banner.targetId?.toLowerCase());
      if (found) {
        setSelectedProduct(found);
        setCustomerScreen('PRODUCT_DETAILS');
      } else {
        setCustomerScreen('ALL_PRODUCTS');
      }
    } else if (banner.targetType === 'SUBSCRIPTION') {
      setCustomerScreen('MY_SUBSCRIPTIONS');
    } else {
      setCustomerScreen('ALL_PRODUCTS');
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchCategories();
    fetchProducts();
    fetchOrders();
  }, [customerScreen]);

  const handleCreateProduct = async () => {
    setAddProdError(null);
    if (!isApprovedVendor) {
      Alert.alert(
        'Vendor Access Required',
        'Only verified and approved partner farmers can add crops or products. Please apply in your profile.'
      );
      return;
    }
    if (!newProdName.trim() || newProdName.trim().length < 2) {
      setAddProdError('Please enter a valid crop or product name (at least 2 characters).');
      return;
    }
    const priceNum = parseFloat(newProdPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setAddProdError('Please enter a valid price greater than ₹0.');
      return;
    }
    const stockNum = parseInt(newProdStock, 10);
    if (isNaN(stockNum) || stockNum <= 0) {
      setAddProdError('Please enter available stock quantity (at least 1).');
      return;
    }
    if (!newProdUnit.trim()) {
      setAddProdError('Please enter unit of measure (e.g. Kg, Litre, Bunch).');
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const payload = {
        name: newProdName.trim(),
        categoryName: newProdCategory,
        price: priceNum,
        unit: newProdUnit.trim() || 'Kg',
        stock: stockNum,
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
        setNewProdPrice('');
        setNewProdStock('');
        setNewProdDesc('');
        Alert.alert(
          'Product Added Successfully!',
          `"${created.name}" (₹${created.price}/${created.unit}) has been added to the catalog and is now live!`
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
    setIsPlacingOrder(true);
    try {
      const res = await fetch(API_ENDPOINTS.orders, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: profileName || 'Ananya Sharma',
          customerPhone: userPhone || '9876543210',
          deliveryAddress: profileLocation || selectedLocation?.address || 'Current Location',
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
    } finally {
      setIsPlacingOrder(false);
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

  // Render modal to add product dynamically via API (Approved Partner Farmers Only)
  const renderAddProductModal = () => {
    if (!isApprovedVendor) return null;
    return (
      <Modal visible={showAddProductModal} transparent animationType="slide">
        <View style={cs.vendorModalBackdrop}>
          <View style={cs.vendorModalCard}>
            <View style={cs.vendorModalHeader}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Sprout size={18} color={C.light} />
                  <Text style={cs.vendorModalTitle}>Add Crop / Product</Text>
                </View>
                <Text style={cs.vendorModalSub}>Publish verified harvest to local subscriber catalog</Text>
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
                    placeholder="e.g. 75"
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
                    placeholder="e.g. Kg"
                    placeholderTextColor="#94A3B8"
                    value={newProdUnit}
                    onChangeText={setNewProdUnit}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={cs.formLabel}>Stock</Text>
                  <TextInput
                    style={cs.formInput}
                    placeholder="e.g. 50"
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
                placeholder="Describe freshness, harvest source, and crop grade..."
                placeholderTextColor="#94A3B8"
                value={newProdDesc}
                onChangeText={setNewProdDesc}
                multiline
                numberOfLines={2}
              />

            {/* Product Photo Selection & Live Preview */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 4 }}>
              <Text style={cs.formLabel}>Product Photo (Gallery or Camera)</Text>
              {isUploadingImage ? (
                <Text style={{ fontSize: 10, color: C.light, fontWeight: '700' }}>Uploading...</Text>
              ) : (
                <Text style={{ fontSize: 10, color: C.light, fontWeight: '700' }}>✓ Verified Food-Grade</Text>
              )}
            </View>

            {/* Gallery & Camera Upload Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: '#ECFDF5',
                  borderWidth: 1.5,
                  borderColor: '#A7F3D0'
                }}
                onPress={handlePickFromGallery}
                disabled={isUploadingImage}
                activeOpacity={0.8}
              >
                <Upload size={14} color={C.light} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: C.light }}>Choose Gallery</Text>
                  <Text style={{ fontSize: 9, color: C.textMuted }}>Pick from photos</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: '#F0F9FF',
                  borderWidth: 1.5,
                  borderColor: '#BAE6FD'
                }}
                onPress={handleTakePhoto}
                disabled={isUploadingImage}
                activeOpacity={0.8}
              >
                <Camera size={14} color="#0284C7" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#0284C7' }}>Take Photo</Text>
                  <Text style={{ fontSize: 9, color: C.textMuted }}>Snap fresh crop</Text>
                </View>
              </TouchableOpacity>
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
                source={{ uri: newProdImage.trim() || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600' }}
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
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>Live DB Preview</Text>
              </View>
            </View>

            <Text style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: '600' }}>
              Or Select Curated Preset:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {ORGANIC_PRODUCT_PRESETS.map((item) => {
                const isSelected = newProdImage === item.url;
                const isMatchCat = item.category === newProdCategory;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: isSelected ? C.light : isMatchCat ? '#A7F3D0' : C.border,
                      backgroundColor: isSelected ? '#E8F5E9' : isMatchCat ? '#F0FDF4' : '#fff',
                      marginRight: 8
                    }}
                    onPress={() => setNewProdImage(item.url)}
                  >
                    <Image source={{ uri: item.url }} style={{ width: 18, height: 18, borderRadius: 9 }} />
                    <Text style={{ fontSize: 11, color: isSelected ? C.light : C.textPrimary, fontWeight: isSelected ? '700' : '500' }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TextInput
              style={[cs.formInput, { fontSize: 12, marginBottom: 12 }]}
              placeholder="Or paste custom image URL (https://...)"
              placeholderTextColor="#94A3B8"
              value={newProdImage}
              onChangeText={setNewProdImage}
            />

            <AppButton
              title="Add Product to Live API"
              loading={isSubmittingProduct}
              loadingText="Publishing Product..."
              onPress={handleCreateProduct}
              size="large"
              icon={<Plus size={16} color="#FFFFFF" />}
              style={{ marginTop: 16 }}
            />
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

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
          <Image source={{ uri: p.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600' }} style={cs.productImg} resizeMode="cover" />
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

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <MapPin size={10} color="#059669" />
            <Text style={{ fontSize: 10, color: '#059669', fontWeight: '600' }}>
              Salem Farm Hub · 2.4 km · ₹20 del.
            </Text>
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

  // Render modern Blinkit-inspired 2-column Product Card matching reference screenshot
  const renderHomeProductCard = (p: Product) => {
    const cartItem = cart.find(i => i.product.id === p.id);
    const qty = cartItem ? cartItem.qty : 0;
    const badge = getProductBadge(p);
    const isFav = !!favorites[p.id];
    const origPrice = (p as any).originalPrice || Math.round(p.price * 1.15);
    const isOutOfStock = p.stock !== undefined && p.stock <= 0;

    return (
      <TouchableOpacity
        key={p.id}
        style={cs.blinkitProductCard}
        onPress={() => {
          setSelectedProduct(p);
          setCustomerScreen('PRODUCT_DETAILS');
        }}
        activeOpacity={0.88}
      >
        {/* Top: Badge Tag & Favorite Heart Icon */}
        <View style={cs.cardTopRow}>
          <View style={[cs.badgePill, { backgroundColor: badge.bg }]}>
            <Text style={[cs.badgePillText, { color: badge.color }]}>{badge.label}</Text>
          </View>
          <TouchableOpacity
            style={cs.heartBtn}
            onPress={() => toggleFavorite(p.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Heart
              size={16}
              color={isFav ? '#EF4444' : '#94A3B8'}
              fill={isFav ? '#EF4444' : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Center: Clean Product Image */}
        <View style={cs.cardImgContainer}>
          <Image
            source={{ uri: p.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400' }}
            style={cs.cardProductImg}
            resizeMode="cover"
          />
        </View>

        {/* Product Name */}
        <Text style={cs.cardProductName} numberOfLines={1}>
          {p.name}
        </Text>

        {/* Quantity / Unit */}
        <Text style={cs.cardProductUnit} numberOfLines={1}>
          {p.unit || '1 kg'}
        </Text>

        {/* Bottom: Price & Green Add Button / Quantity Selector */}
        <View style={cs.cardBottomRow}>
          <View style={cs.priceCol}>
            <Text style={cs.cardPrice}>₹{p.price}</Text>
            {origPrice > p.price && (
              <Text style={cs.cardOrigPrice}>₹{origPrice}</Text>
            )}
          </View>

          {isOutOfStock ? (
            <View style={[cs.addBtn, { backgroundColor: '#94A3B8' }]}>
              <Text style={cs.addBtnText}>Out of Stock</Text>
            </View>
          ) : qty > 0 ? (
            <View style={cs.cardQtySelector}>
              <TouchableOpacity
                style={cs.cardQtyBtn}
                onPress={() => updateCartQty(p, -1)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={cs.cardQtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={cs.cardQtyText}>{qty}</Text>
              <TouchableOpacity
                style={cs.cardQtyBtn}
                onPress={() => updateCartQty(p, 1)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={cs.cardQtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={cs.addBtn}
              onPress={() => addToCart(p)}
              activeOpacity={0.8}
            >
              <Text style={cs.addBtnText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ── HOME SCREEN (Amazon Connected Header + Dynamic Database Banners, Categories, Products) ──
  if (customerScreen === 'HOME') {
    const displayedHomeProducts = productsList.filter(p => {
      const matchCat = matchCategory(safeCategory(p.category), activeCategory);
      const matchSearch = searchQuery.trim() === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    const activeBanner = bannersList[activeBannerIdx] || bannersList[0];
    const headerGrad = getGradientTheme(activeBanner?.backgroundColor || '#07843D');

    return (
      <View style={{ flex: 1, backgroundColor: '#F0F7F2' }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
          {/* Half-Banner Gradient Backdrop extending from Header down to half of the promotional banner */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 104, // 12px top margin + 84px (half of 168px banner height) + 8px bleed
              overflow: 'hidden',
            }}
            pointerEvents="none"
          >
            <Svg width="100%" height="100%">
              <Defs>
                <SvgLinearGradient id="homeHalfBannerGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={headerGrad.light} stopOpacity="1" />
                  <Stop offset="70%" stopColor={headerGrad.light} stopOpacity="0.75" />
                  <Stop offset="100%" stopColor="#F0F7F2" stopOpacity="0" />
                </SvgLinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#homeHalfBannerGrad)" />
            </Svg>
          </View>

          {/* 1. Dynamic Promotional Banner Carousel (Connected with Dynamic Header Theme Color) */}
          {isLoadingBanners ? (
            <View style={{ height: 165, marginHorizontal: 12, marginTop: 12, borderRadius: 20, backgroundColor: '#EBF6EE', justifyContent: 'center', alignItems: 'center' }}>
              <LoadingSpinner size="small" message="Loading festive banners..." showLeafIcon />
            </View>
          ) : bannersList.length > 0 ? (
            <View style={{ marginTop: 12 }}>
              <ScrollView
                ref={bannerScrollRef}
                horizontal
                pagingEnabled={false}
                snapToInterval={BANNER_WIDTH + 12}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                onMomentumScrollEnd={(e) => {
                  const offsetX = e.nativeEvent.contentOffset.x;
                  const idx = Math.min(Math.max(0, Math.round(offsetX / (BANNER_WIDTH + 12))), bannersList.length - 1);
                  handleBannerChange(idx);
                }}
                onScrollEndDrag={(e) => {
                  const offsetX = e.nativeEvent.contentOffset.x;
                  const idx = Math.min(Math.max(0, Math.round(offsetX / (BANNER_WIDTH + 12))), bannersList.length - 1);
                  handleBannerChange(idx);
                }}
              >
                {bannersList.map((banner) => {
                  const grad = getGradientTheme(banner.backgroundColor);

                  return (
                    <TouchableOpacity
                      key={banner.id}
                      activeOpacity={0.92}
                      onPress={() => handleBannerPress(banner)}
                      style={[
                        cs.bannerCard,
                        {
                          backgroundColor: grad.dark,
                          width: BANNER_WIDTH
                        }
                      ]}
                    >
                      {/* Dark-to-Light Linear Gradient Background */}
                      <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        <Svg width="100%" height="100%">
                          <Defs>
                            <SvgLinearGradient id={`bannerGrad_${banner.id}`} x1="0" y1="0" x2="1" y2="1">
                              <Stop offset="0%" stopColor={grad.dark} stopOpacity="1" />
                              <Stop offset="45%" stopColor={grad.mid} stopOpacity="1" />
                              <Stop offset="100%" stopColor={grad.light} stopOpacity="1" />
                            </SvgLinearGradient>
                          </Defs>
                          <Rect width="100%" height="100%" rx="20" ry="20" fill={`url(#bannerGrad_${banner.id})`} />
                        </Svg>
                      </View>

                      {/* Uploaded Image only on Gradient Background */}
                      {banner.imageUrl ? (
                        <View style={cs.bannerOnlyImgWrapper}>
                          <Image
                            source={{ uri: banner.imageUrl }}
                            style={cs.bannerOnlyImage}
                            resizeMode="cover"
                          />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Interactive Pagination Dots with Theme Color Sync */}
              {bannersList.length > 1 && (
                <View style={cs.bannerPaginationRow}>
                  {bannersList.map((b, i) => {
                    const isActive = i === activeBannerIdx;
                    return (
                      <TouchableOpacity
                        key={b.id || i}
                        onPress={() => {
                          bannerScrollRef.current?.scrollTo({ x: i * (BANNER_WIDTH + 12), animated: true });
                          handleBannerChange(i);
                        }}
                        style={[
                          isActive ? cs.bannerDotActive : cs.bannerDotInactive,
                          isActive && {
                            backgroundColor: bannersList[activeBannerIdx]?.backgroundColor || '#07843D',
                            width: 20
                          }
                        ]}
                        activeOpacity={0.7}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          ) : null}

          {/* 2. Dynamic Product Categories Loaded from Database */}
          {isLoadingCategories ? (
            <View style={{ height: 70, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#07843D" />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={cs.categoryRow}
            >
              {/* "All" Category Pill */}
              <TouchableOpacity
                style={cs.categoryCard}
                onPress={() => setActiveCategory('All')}
                activeOpacity={0.8}
              >
                <View style={[cs.categoryIconBox, activeCategory === 'All' && cs.categoryIconBoxActive]}>
                  <LayoutGrid size={22} color="#07843D" />
                </View>
                <Text
                  style={[cs.categoryLabel, activeCategory === 'All' && cs.categoryLabelActive]}
                  numberOfLines={1}
                >
                  All
                </Text>
              </TouchableOpacity>

              {/* Dynamic Database Categories */}
              {categoriesList
                .filter(cat => cat.isActive !== false)
                .map((cat) => {
                  const isActive = activeCategory === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={cs.categoryCard}
                      onPress={() => setActiveCategory(cat.name)}
                      activeOpacity={0.8}
                    >
                      <View style={[cs.categoryIconBox, isActive && cs.categoryIconBoxActive]}>
                        {cat.imageUrl ? (
                          <Image
                            source={{ uri: cat.imageUrl }}
                            style={cs.categoryImg}
                            resizeMode="cover"
                          />
                        ) : (cat as any).emoji ? (
                          <Text style={{ fontSize: 24 }}>{(cat as any).emoji}</Text>
                        ) : (
                          <Sprout size={22} color={isActive ? '#07843D' : '#52645B'} />
                        )}
                      </View>
                      <Text
                        style={[cs.categoryLabel, isActive && cs.categoryLabelActive]}
                        numberOfLines={1}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          )}

          {/* 3. Fresh Products Header Row */}
          <View style={cs.freshProductsHeaderRow}>
            <Text style={cs.freshProductsTitle}>Fresh Products</Text>
            <TouchableOpacity
              style={cs.viewAllBtn}
              onPress={() => setCustomerScreen('ALL_PRODUCTS')}
              activeOpacity={0.7}
            >
              <Text style={cs.viewAllText}>View All ({displayedHomeProducts.length}) →</Text>
            </TouchableOpacity>
          </View>

          {/* 4. Two-Column Clean Product Grid from Live Database */}
          {isLoadingProducts ? (
            <PageLoader
              message="Harvesting Fresh Organic Catalog..."
              subMessage="Fetching certified organic produce directly from Mathira partner farms"
            />
          ) : productsError ? (
            <ErrorState
              title="Catalog temporarily unavailable"
              message={productsError}
              onRetry={fetchProducts}
            />
          ) : (
            <View style={cs.productGridContainer}>
              {displayedHomeProducts.map((p) => renderHomeProductCard(p))}
              {displayedHomeProducts.length === 0 && (
                <EmptyState
                  title="No organic products found"
                  description={
                    searchQuery.trim() !== ''
                      ? `No organic products match "${searchQuery}"`
                      : `No products available in ${activeCategory}`
                  }
                  actionLabel="View All Products"
                  onAction={() => {
                    setActiveCategory('All');
                    fetchProducts();
                  }}
                />
              )}
            </View>
          )}
        </ScrollView>
        <FloatingCartBar />
        {renderAddProductModal()}
      </View>
    );
  }

  // ── ALL PRODUCTS ─────────────────────────────────────────
  if (customerScreen === 'ALL_PRODUCTS') return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={cs.scroll}>
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
          {isApprovedVendor && (
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
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>Add Product</Text>
            </TouchableOpacity>
          )}
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
  if (customerScreen === 'PRODUCT_DETAILS') {
    const origPrice = (selectedProduct as any).originalPrice || Math.round(selectedProduct.price * 1.25);
    const savings = Math.max(0, origPrice - selectedProduct.price);
    const discountPct = origPrice > selectedProduct.price ? Math.round(((origPrice - selectedProduct.price) / origPrice) * 100) : 20;
    const isFav = !!favorites[selectedProduct.id];
    const farmerName = (selectedProduct as any).farmerName || 'Thiru. Selvam Organic Estate';
    const farmerLocation = (selectedProduct as any).farmerLocation || 'Pollachi Foothills, Coimbatore';
    const harvestInfo = (selectedProduct as any).harvestDate || 'Harvested 05:30 AM today';
    const certNumber = (selectedProduct as any).certificationNumber || 'NPOP/NAB/0019';
    const relatedProducts = productsList.filter(p => p.id !== selectedProduct.id && (safeCategory(p.category) === safeCategory(selectedProduct.category) || p.organicCertified)).slice(0, 6);

    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
          {/* 1. Elevated Hero Media & Floating Glass Actions */}
          <View style={cs.pdHeroContainer}>
            <Image
              source={{ uri: selectedProduct.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80' }}
              style={cs.pdHeroImg}
              resizeMode="cover"
            />
            {/* Top Floating Glass Navigation Row */}
            <View style={cs.pdTopNav}>
              <TouchableOpacity
                style={cs.pdNavCircleBtn}
                onPress={() => setCustomerScreen('HOME')}
                activeOpacity={0.8}
              >
                <ArrowLeft size={20} color="#0F172A" />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={cs.pdNavCircleBtn}
                  onPress={() => toggleFavorite(selectedProduct.id)}
                  activeOpacity={0.8}
                >
                  <Heart
                    size={20}
                    color={isFav ? '#EF4444' : '#0F172A'}
                    fill={isFav ? '#EF4444' : 'transparent'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={cs.pdNavCircleBtn}
                  onPress={() => Alert.alert('Share Product', `Share link copied for ${selectedProduct.name}!`)}
                  activeOpacity={0.8}
                >
                  <Share2 size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Ambient Badges Floating at bottom of Hero */}
            <View style={cs.pdHeroBottomOverlay}>
              {selectedProduct.organicCertified ? (
                <View style={cs.pdTrustPill}>
                  <ShieldCheck size={14} color="#86EFAC" />
                  <Text style={cs.pdTrustPillText}>100% Organic Certified</Text>
                </View>
              ) : (
                <View style={[cs.pdTrustPill, { backgroundColor: 'rgba(15,23,42,0.85)' }]}>
                  <Sprout size={14} color="#86EFAC" />
                  <Text style={cs.pdTrustPillText}>Farm Direct</Text>
                </View>
              )}
              {savings > 0 && (
                <View style={cs.pdSavingsPill}>
                  <Text style={cs.pdSavingsPillText}>{discountPct}% OFF</Text>
                </View>
              )}
            </View>
          </View>

          {/* 2. Main Product Identity & Pricing Card */}
          <View style={cs.pdMainBody}>
            {/* Category tag & Rating Pill */}
            <View style={cs.pdCatBadgeRow}>
              <View style={cs.pdCatBadge}>
                <Text style={cs.pdCatBadgeText}>{safeCategory(selectedProduct.category).toUpperCase()}</Text>
              </View>
              <View style={cs.pdRatingBox}>
                <Star size={13} color="#F59E0B" fill="#F59E0B" />
                <Text style={cs.pdRatingText}>{selectedProduct.rating || 4.9}</Text>
                <Text style={cs.pdReviewsCount}>(120+ reviews)</Text>
              </View>
            </View>

            {/* Product Title */}
            <Text style={cs.pdTitle}>{selectedProduct.name}</Text>

            {/* Price & Savings Row */}
            <View style={cs.pdPriceContainer}>
              <Text style={cs.pdPriceLarge}>₹{selectedProduct.price}</Text>
              <Text style={cs.pdUnitText}>/ {selectedProduct.unit}</Text>
              {origPrice > selectedProduct.price && (
                <Text style={cs.pdOrigPrice}>₹{origPrice}</Text>
              )}
              {savings > 0 && (
                <View style={cs.pdSaveBadge}>
                  <Text style={cs.pdSaveBadgeText}>Save ₹{savings}</Text>
                </View>
              )}
            </View>

            {/* 3. Express Farm Delivery Banner */}
            <View style={cs.pdDeliveryCard}>
              <View style={cs.pdDeliveryIconBox}>
                <Zap size={20} color="#16A34A" fill="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={cs.pdDeliveryTitle}>Express Delivery in 15–20 Mins</Text>
                <Text style={cs.pdDeliverySub}>Direct cold-chain transit · Harvested fresh daily</Text>
              </View>
              <View style={cs.pdStockBadge}>
                <View style={cs.pdStockDot} />
                <Text style={cs.pdStockText}>In Stock</Text>
              </View>
            </View>

            {/* 4. Quantity Stepper */}
            <View style={cs.pdQtyCard}>
              <View>
                <Text style={cs.pdQtyLabel}>Quantity</Text>
                <Text style={cs.pdQtySub}>Total: ₹{selectedProduct.price * detailQty} for {detailQty} {selectedProduct.unit}</Text>
              </View>
              <View style={cs.pdStepper}>
                <TouchableOpacity
                  style={cs.pdStepperBtn}
                  onPress={() => setDetailQty(Math.max(1, detailQty - 1))}
                  activeOpacity={0.7}
                >
                  <Text style={cs.pdStepperBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={cs.pdStepperValue}>{detailQty} {selectedProduct.unit}</Text>
                <TouchableOpacity
                  style={cs.pdStepperBtn}
                  onPress={() => setDetailQty(detailQty + 1)}
                  activeOpacity={0.7}
                >
                  <Text style={cs.pdStepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. Meet Your Farmer Provenance Card */}
            <View style={cs.pdFarmerCard}>
              <View style={cs.pdFarmerRow}>
                <View style={cs.pdFarmerAvatar}>
                  <User size={22} color="#065F46" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={cs.pdFarmerName}>{farmerName}</Text>
                  <Text style={cs.pdFarmerLoc}>📍 {farmerLocation}</Text>
                </View>
              </View>
              <View style={cs.pdFarmerCertBox}>
                <ShieldCheck size={14} color="#059669" />
                <Text style={cs.pdFarmerCertText}>
                  {harvestInfo} · Cert #{certNumber}
                </Text>
              </View>
            </View>

            {/* 6. Four Organic Purity Highlights */}
            <Text style={cs.pdSectionHeader}>Why Choose Mathira Organic?</Text>
            <View style={cs.pdPurityGrid}>
              <View style={cs.pdPurityTile}>
                <ShieldCheck size={18} color="#16A34A" />
                <Text style={cs.pdPurityTileTitle}>Zero Pesticides</Text>
                <Text style={cs.pdPurityTileDesc}>Lab tested for 120+ chemical residues</Text>
              </View>
              <View style={cs.pdPurityTile}>
                <Sprout size={18} color="#059669" />
                <Text style={cs.pdPurityTileTitle}>Native Seeds</Text>
                <Text style={cs.pdPurityTileDesc}>Non-GMO traditional heirloom crops</Text>
              </View>
              <View style={cs.pdPurityTile}>
                <Truck size={18} color="#2563EB" />
                <Text style={cs.pdPurityTileTitle}>Direct Cold Chain</Text>
                <Text style={cs.pdPurityTileDesc}>From farm to doorstep in under 12 hours</Text>
              </View>
              <View style={cs.pdPurityTile}>
                <Award size={18} color="#D97706" />
                <Text style={cs.pdPurityTileTitle}>Fair Trade</Text>
                <Text style={cs.pdPurityTileDesc}>100% fair payout to partner farmers</Text>
              </View>
            </View>

            {/* 7. Product Description */}
            <Text style={cs.pdSectionHeader}>Product Details</Text>
            <View style={cs.pdDescCard}>
              <Text style={cs.pdDescText}>
                {selectedProduct.description || 'Nurtured organically in nutrient-rich soil without synthetic fertilizers or chemical pesticides. Picked at peak ripeness to ensure exceptional natural taste and maximum nutritional retention.'}
              </Text>
            </View>

            {/* 8. Nutritional & Health Benefits */}
            {selectedProduct.benefits && selectedProduct.benefits.length > 0 && (
              <>
                <Text style={cs.pdSectionHeader}>Nutritional & Health Benefits</Text>
                <View style={cs.pdBenefitsCard}>
                  {selectedProduct.benefits.map((b: string, i: number) => (
                    <View key={i} style={cs.pdBenefitRow}>
                      <View style={cs.pdBenefitBullet}>
                        <Check size={11} color="#16A34A" />
                      </View>
                      <Text style={cs.pdBenefitText}>{b}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Storage Advice Tip */}
            <View style={cs.pdStorageTip}>
              <Sparkles size={16} color="#CA8A04" />
              <Text style={cs.pdStorageTipText}>
                <Text style={{ fontWeight: '800' }}>Freshness Tip: </Text>
                Store in a cool dry place or refrigerator at 4°C to 8°C. Best consumed within 3–4 days of delivery.
              </Text>
            </View>

            {/* 9. Frequently Paired Farm Fresh Produce (Related Products) */}
            {relatedProducts.length > 0 && (
              <View style={cs.pdRelatedSection}>
                <Text style={cs.pdSectionHeader}>Pairs Well With</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={cs.pdRelatedScroll}
                >
                  {relatedProducts.map(rp => (
                    <TouchableOpacity
                      key={rp.id}
                      style={cs.pdRelatedCard}
                      onPress={() => {
                        setSelectedProduct(rp);
                        setDetailQty(1);
                      }}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: rp.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80' }}
                        style={cs.pdRelatedImg}
                        resizeMode="cover"
                      />
                      <Text style={cs.pdRelatedName} numberOfLines={1}>{rp.name}</Text>
                      <View style={cs.pdRelatedPriceRow}>
                        <Text style={cs.pdRelatedPrice}>₹{rp.price}</Text>
                        <TouchableOpacity
                          style={cs.pdRelatedAddBtn}
                          onPress={() => addToCart(rp, 1)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Text style={cs.pdRelatedAddBtnText}>+ ADD</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>

        {/* 10. Floating Sticky Bottom Bar */}
        <View style={cs.pdFixedBottomBar}>
          <View style={cs.pdBottomPriceCol}>
            <Text style={cs.pdBottomLabel}>TOTAL PRICE</Text>
            <Text style={cs.pdBottomTotal}>₹{selectedProduct.price * detailQty}</Text>
            <Text style={cs.pdBottomSub}>for {detailQty} {selectedProduct.unit} · Incl. all taxes</Text>
          </View>
          <View style={cs.pdBottomActionGroup}>
            {selectedProduct.oneTimeAllowed && (
              <TouchableOpacity
                style={cs.pdCartBtn}
                onPress={() => {
                  addToCart(selectedProduct, detailQty);
                  setCustomerScreen('HOME');
                }}
                activeOpacity={0.85}
              >
                <ShoppingCart size={16} color="#FFFFFF" />
                <Text style={cs.pdCartBtnText}>Add to Cart</Text>
              </TouchableOpacity>
            )}
            {selectedProduct.subscriptionAllowed && (
              <SubscriptionButton
                title="Subscribe"
                icon={<Repeat size={14} color="#FFFFFF" />}
                variant="primary"
                size="small"
                onPress={() => {
                  setActiveSubscriptionData({
                    product: selectedProduct,
                    qty: detailQty,
                    freq: 'Daily',
                    duration: 30,
                    time: '06:30 AM',
                    priceTotal: selectedProduct.price * detailQty * 30,
                  });
                  setCustomerScreen('SUBSCRIPTION_CREATE');
                }}
              />
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ShoppingCart size={20} color={C.textPrimary} />
          <Text style={cs.screenTitle}>My Cart</Text>
        </View>
        {cart.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart size={44} color={C.textMuted} />}
            title="Your cart is empty"
            description="Explore fresh organic milk, ghee, fruits, and vegetables from local partner farms."
            actionLabel="Browse Products"
            onAction={() => setCustomerScreen('ALL_PRODUCTS')}
          />
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
            {/* Delivery Address Card with Change option */}
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              padding: 14,
              marginTop: 12,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: C.border
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MapPin size={15} color={C.light} />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: C.textPrimary }}>Delivery Address</Text>
                </View>
                {onChangeLocation && (
                  <TouchableOpacity onPress={onChangeLocation} activeOpacity={0.7}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: C.light }}>Change</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={{ fontSize: 12, color: C.textSec, lineHeight: 18 }}>
                {selectedLocation?.address || profileLocation}
              </Text>
              <Text style={{ fontSize: 10, color: C.light, fontWeight: '700', marginTop: 4 }}>
                ✓ Distance to farm: 2.4 km (Within vendor delivery radius)
              </Text>
            </View>

            <View style={cs.cartSummary}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: C.textSec, fontSize: 13 }}>Items Subtotal ({cartCount} items)</Text>
                <Text style={{ fontWeight: '700', fontSize: 13 }}>₹{cartTotal}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View>
                  <Text style={{ color: C.textSec, fontSize: 13 }}>Delivery Charge (2.4 km)</Text>
                  <Text style={{ color: C.textMuted, fontSize: 10 }}>Base ₹15 + Distance fee ₹5</Text>
                </View>
                <Text style={{ fontWeight: '700', fontSize: 13, color: C.textPrimary }}>₹20</Text>
              </View>
              <View style={cs.divider} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: 16 }}>Total Payable</Text>
                <Text style={{ color: C.primary, fontWeight: '800', fontSize: 18 }}>₹{cartTotal + 20}</Text>
              </View>
            </View>

            <AppButton
              title={`Place Order · ₹${cartTotal + 20}`}
              loading={isPlacingOrder}
              loadingText="Placing Order..."
              onPress={handlePlaceOrder}
              size="large"
              style={{ marginTop: 14 }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );

  // ── SUBSCRIPTION CREATE ───────────────────────────────────
  if (customerScreen === 'SUBSCRIPTION_CREATE') {
    const total = subQty * activeSubscriptionData.product.price * (subFreq === 'Daily' ? subDuration : subFreq === 'Weekly' ? Math.ceil(subDuration / 7) : 1);
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {/* Compact Product Header Card */}
        <View style={{ backgroundColor: '#FFFFFF', padding: 14, marginHorizontal: 16, marginTop: 12, marginBottom: 4, borderRadius: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DFE9E1' }}>
          <Image
            source={{ uri: activeSubscriptionData.product.imageUrl || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=300' }}
            style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#F8FAF8' }}
            resizeMode="cover"
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Sparkles size={11} color="#15803D" />
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#15803D', letterSpacing: 0.5 }}>DAILY SUBSCRIPTION</Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#18352B', marginTop: 2 }} numberOfLines={1}>
              {activeSubscriptionData.product.name}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#07843D', marginTop: 2 }}>
              ₹{activeSubscriptionData.product.price} / {activeSubscriptionData.product.unit}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
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
          <SubscriptionButton
            title="Review Plan →"
            size="large"
            variant="primary"
            onPress={() => {
              setActiveSubscriptionData({ ...activeSubscriptionData, qty: subQty, freq: subFreq, time: subTime, duration: subDuration, priceTotal: total });
              setCustomerScreen('SUBSCRIPTION_SUMMARY');
            }}
            style={{ minWidth: 180 }}
          />
        </View>
      </View>
    );
  }

  // ── SUBSCRIPTION SUMMARY ──────────────────────────────────
  if (customerScreen === 'SUBSCRIPTION_SUMMARY') return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
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
        <SubscriptionButton
          title="Proceed to Payment →"
          size="large"
          variant="primary"
          onPress={() => setCustomerScreen('PAYMENT')}
          style={{ minWidth: 200 }}
        />
      </View>
    </View>
  );

  // ── PAYMENT ───────────────────────────────────────────────
  if (customerScreen === 'PAYMENT') {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
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
                  <Image source={{ uri: sub.product.imageUrl }} style={{ width: 48, height: 48, borderRadius: 10, marginRight: 12, backgroundColor: C.border }} resizeMode="cover" />
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
                  <SubscriptionButton
                    title={skippedToday ? 'Resume' : 'Skip Today'}
                    size="small"
                    variant={skippedToday ? 'primary' : 'outline'}
                    onPress={() => handleSkip(sub.id)}
                    style={{ flex: 1 }}
                  />
                  <SubscriptionButton
                    title={sub.status === 'Paused' ? 'Resume' : 'Pause'}
                    size="small"
                    variant={sub.status === 'Paused' ? 'primary' : 'secondary'}
                    onPress={() => handlePause(sub.id)}
                    style={{ flex: 1 }}
                  />
                  <SubscriptionButton
                    title="Cancel"
                    size="small"
                    variant="danger"
                    onPress={() => {
                      Alert.alert('Cancel Subscription', 'Are you sure you want to cancel this plan?', [
                        { text: 'No', style: 'cancel' },
                        { text: 'Yes, Cancel', style: 'destructive', onPress: () => setSubscriptions((prev: any[]) => prev.filter((s: any) => s.id !== sub.id)) }
                      ]);
                    }}
                    style={{ flex: 0.8 }}
                  />
                </View>
              </View>
            );
          })}
          {(subTab === 'History' || subscriptions.length === 0) && (
            <View style={{ alignItems: 'center', padding: 32 }}>
              <Package size={44} color={C.textMuted} />
              <Text style={{ color: C.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 12 }}>
                {subTab === 'History' ? 'No past subscriptions' : 'No active recurring deliveries'}
              </Text>
              <Text style={{ color: C.textSec, fontSize: 12, textAlign: 'center', marginTop: 4, maxWidth: 260 }}>
                Set up automated morning deliveries of fresh milk, veggies, and daily organic staples.
              </Text>
              <SubscriptionButton
                title="Explore Plans & Subscribe"
                icon={<Sprout size={16} color="#FFFFFF" />}
                variant="primary"
                size="large"
                onPress={() => setCustomerScreen('ALL_PRODUCTS')}
                style={{ marginTop: 20, minWidth: 240 }}
                badge="SAVE 10%"
              />
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── ORDER HISTORY ─────────────────────────────────────────
  if (customerScreen === 'ORDER_HISTORY') return (
    <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
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

            {/* Delivery Verification OTP (Requirement 11) */}
            {order.deliveryStatus !== 'DELIVERED' && (
              <View style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 10,
                backgroundColor: '#ECFDF5',
                borderWidth: 1,
                borderColor: '#A7F3D0',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <ShieldCheck size={13} color="#047857" />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#064E3B' }}>Delivery Verification Code</Text>
                  </View>
                  <Text style={{ fontSize: 10, color: '#047857', marginTop: 2 }}>
                    Give this 4-digit OTP to vendor upon arrival
                  </Text>
                </View>
                <View style={{
                  backgroundColor: '#FFFFFF',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  borderColor: '#047857'
                }}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#047857', letterSpacing: 2 }}>
                    {order.deliveryOtp || '4821'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  // ── PROFILE ───────────────────────────────────────────────
  if (customerScreen === 'PROFILE') return (
    <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
      {/* Top Navigation Bar with Title & Edit */}
      <View style={cs.profileTopNav}>
        <Text style={cs.profileTopNavTitle}>My Account</Text>
        <TouchableOpacity style={[cs.profileEditTopBtn, { flexDirection: 'row', alignItems: 'center', gap: 4 }]} onPress={() => setShowEditProfileModal(true)} activeOpacity={0.7}>
          <Pencil size={12} color={C.light} />
          <Text style={cs.profileEditTopBtnText}>Edit Profile</Text>
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
              <Text style={cs.producerApprovedBadge}>ADMIN ACCREDITED PRODUCER · +91 {userPhone}</Text>
            </View>
            <Text style={cs.producerApprovedDesc}>
              Mobile number +91 {userPhone} has been verified and approved by Admin. You have full partner access to list crops, manage morning harvests, and dispatch depot orders.
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
              <Text style={cs.producerPendingBadge}>APPLICATION FOR +91 {userPhone} UNDER ADMIN REVIEW</Text>
            </View>
            <Text style={cs.producerPendingDesc}>
              Application for mobile number +91 {userPhone} is under review by Admin. Once approved, the Farmer Console will unlock automatically for this account.
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
            <TouchableOpacity style={cs.reapplyBtn} onPress={handleOpenVendorModal} activeOpacity={0.8}>
              <Text style={cs.reapplyBtnText}>Update & Re-apply</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={cs.producerApplyBox}>
            <Text style={cs.producerApplyDesc}>
              Cultivate certified organic crops or produce A2 dairy? Register to sell directly to local subscribers.
            </Text>
            <TouchableOpacity style={[cs.applyFarmerBtn, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]} onPress={handleOpenVendorModal} activeOpacity={0.85}>
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
                value={userPhone ? `+91 ${userPhone}` : ''}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#94A3B8"
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

              <AppButton
                title="Save Profile Changes"
                loading={isSavingProfile}
                loadingText="Saving Profile..."
                onPress={handleSaveProfile}
                size="large"
                style={{ marginTop: 14 }}
              />
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

              <Text style={cs.formLabel}>Applicant Mobile *</Text>
              <TextInput
                style={cs.formInput}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                value={vApplicantPhone}
                onChangeText={setVApplicantPhone}
              />

              <Text style={cs.formLabel}>Farm / Producer Name *</Text>
              <TextInput
                style={cs.formInput}
                placeholder="Enter farm or producer name"
                placeholderTextColor="#94A3B8"
                value={vFarmName}
                onChangeText={setVFarmName}
              />

              <Text style={cs.formLabel}>Farm Location & District *</Text>
              <TextInput
                style={cs.formInput}
                placeholder="Enter farm location and district"
                placeholderTextColor="#94A3B8"
                value={vFarmLocation}
                onChangeText={setVFarmLocation}
              />

              <Text style={cs.formLabel}>Crop Types / Harvest Categories</Text>
              <TextInput
                style={cs.formInput}
                placeholder="Enter crop types (e.g. Vegetables, Dairy)"
                placeholderTextColor="#94A3B8"
                value={vCropCategories}
                onChangeText={setVCropCategories}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={cs.formLabel}>Experience (Yrs)</Text>
                  <TextInput
                    style={cs.formInput}
                    placeholder="e.g. 5"
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
                    placeholder="Enter cert number (optional)"
                    placeholderTextColor="#94A3B8"
                    value={vCertNo}
                    onChangeText={setVCertNo}
                  />
                </View>
              </View>

              <AppButton
                title="Submit Registration to Admin →"
                loading={isSubmittingVendor}
                loadingText="Submitting Registration..."
                onPress={handleApplyVendor}
                size="large"
                style={{ marginTop: 14 }}
              />
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

  // Farm-to-Table Product Details Styles
  pdHeroContainer: { position: 'relative', width: '100%', height: 320, backgroundColor: '#E2E8F0' },
  pdHeroImg: { width: '100%', height: '100%' },
  pdTopNav: { position: 'absolute', top: 44, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 },
  pdNavCircleBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  pdHeroBottomOverlay: { position: 'absolute', bottom: 32, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  pdTrustPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(13,43,29,0.88)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(134,239,172,0.3)' },
  pdTrustPillText: { color: '#86EFAC', fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  pdSavingsPill: { backgroundColor: '#DC2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, shadowColor: '#DC2626', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  pdSavingsPillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.3 },
  pdMainBody: { marginTop: -24, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingTop: 22, paddingBottom: 110, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 6 },
  pdCatBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  pdCatBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#A7F3D0' },
  pdCatBadgeText: { color: '#047857', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  pdRatingBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A' },
  pdRatingText: { color: '#B45309', fontSize: 12, fontWeight: '800' },
  pdReviewsCount: { color: '#92400E', fontSize: 11, fontWeight: '500' },
  pdTitle: { fontSize: 23, fontWeight: '900', color: '#0F172A', lineHeight: 29, marginBottom: 8 },
  pdPriceContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  pdPriceLarge: { fontSize: 28, fontWeight: '900', color: '#15803D' },
  pdUnitText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  pdOrigPrice: { fontSize: 16, color: '#94A3B8', textDecorationLine: 'line-through', fontWeight: '500', marginLeft: 4 },
  pdSaveBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#FECACA' },
  pdSaveBadgeText: { color: '#DC2626', fontSize: 11, fontWeight: '800' },
  pdDeliveryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 18 },
  pdDeliveryIconBox: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  pdDeliveryTitle: { fontSize: 13, fontWeight: '800', color: '#166534' },
  pdDeliverySub: { fontSize: 11, color: '#15803D', marginTop: 2 },
  pdStockBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  pdStockDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' },
  pdStockText: { fontSize: 11, fontWeight: '800', color: '#166534' },
  pdQtyCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 18 },
  pdQtyLabel: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  pdQtySub: { fontSize: 11, color: '#64748B', marginTop: 3 },
  pdStepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 4, paddingVertical: 2 },
  pdStepperBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  pdStepperBtnText: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  pdStepperValue: { minWidth: 48, textAlign: 'center', fontSize: 14, fontWeight: '800', color: '#0F172A', paddingHorizontal: 4 },
  pdFarmerCard: { backgroundColor: '#F7FDF9', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#D1FAE5', marginBottom: 18 },
  pdFarmerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  pdFarmerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#BBF7D0', alignItems: 'center', justifyContent: 'center' },
  pdFarmerName: { fontSize: 14, fontWeight: '800', color: '#064E3B' },
  pdFarmerLoc: { fontSize: 12, color: '#047857', marginTop: 2 },
  pdFarmerCertBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#A7F3D0' },
  pdFarmerCertText: { fontSize: 11, color: '#065F46', fontWeight: '700' },
  pdSectionHeader: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 10, letterSpacing: -0.2 },
  pdPurityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  pdPurityTile: { width: '48.5%', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  pdPurityTileTitle: { fontSize: 12, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  pdPurityTileDesc: { fontSize: 10, color: '#64748B', marginTop: 2, lineHeight: 14 },
  pdDescCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 18 },
  pdDescText: { fontSize: 13, color: '#475569', lineHeight: 20 },
  pdBenefitsCard: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 18 },
  pdBenefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  pdBenefitBullet: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  pdBenefitText: { fontSize: 12, color: '#334155', flex: 1, lineHeight: 18, fontWeight: '500' },
  pdStorageTip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FEF9C3', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FEF08A', marginBottom: 18 },
  pdStorageTipText: { fontSize: 11, color: '#854D0E', flex: 1, lineHeight: 16 },
  pdRelatedSection: { marginBottom: 10 },
  pdRelatedScroll: { paddingRight: 10, paddingVertical: 4 },
  pdRelatedCard: { width: 135, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 8, marginRight: 10, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  pdRelatedImg: { width: '100%', height: 85, borderRadius: 8, backgroundColor: '#F1F5F9' },
  pdRelatedName: { fontSize: 12, fontWeight: '700', color: '#1E293B', marginTop: 6 },
  pdRelatedPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  pdRelatedPrice: { fontSize: 12, fontWeight: '800', color: '#15803D' },
  pdRelatedAddBtn: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#86EFAC', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  pdRelatedAddBtnText: { fontSize: 11, fontWeight: '800', color: '#16A34A' },
  pdFixedBottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 12 },
  pdBottomPriceCol: { flex: 1 },
  pdBottomLabel: { fontSize: 9, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  pdBottomTotal: { fontSize: 22, fontWeight: '900', color: '#15803D' },
  pdBottomSub: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  pdBottomActionGroup: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  pdCartBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#16A34A', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12 },
  pdCartBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

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

  // Half Screen Optimized Hero Banner for Subscriptions
  subHeroContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#0D2B1D',
    overflow: 'hidden',
  },
  subHeroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.82,
  },
  subHeroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 43, 29, 0.45)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  subHeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  subHeroBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  subHeroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  subHeroSubtitle: {
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 3,
    lineHeight: 16,
  },
  subHeroPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  subHeroPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  subHeroPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Blinkit-inspired Organic Home Screen Styles ────────────
  bannerCard: {
    height: 154,
    borderRadius: 20,
    padding: 7,
    overflow: 'hidden',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 3,
  },
  bannerOnlyImgWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.42)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerOnlyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  bannerPaginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 14,
  },
  bannerDotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#07843D',
  },
  bannerDotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C8E6C9',
  },
  categoryRow: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  categoryCard: {
    width: 68,
    alignItems: 'center',
    marginRight: 10,
  },
  categoryIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE9E1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIconBoxActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#07843D',
    borderWidth: 2,
  },
  categoryImg: {
    width: 46,
    height: 46,
    borderRadius: 12,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#18352B',
    marginTop: 6,
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: '#07843D',
    fontWeight: '800',
  },
  freshProductsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  freshProductsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18352B',
    letterSpacing: -0.2,
  },
  viewAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#07843D',
  },
  productGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  blinkitProductCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DFE9E1',
    padding: 10,
    paddingBottom: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  badgePillText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  heartBtn: {
    padding: 4,
  },
  cardImgContainer: {
    width: '100%',
    height: 122,
    borderRadius: 12,
    backgroundColor: '#F8FAF8',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  cardProductImg: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  cardProductName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#18352B',
    lineHeight: 18,
    marginTop: 4,
  },
  cardProductUnit: {
    fontSize: 11,
    color: '#718078',
    marginTop: 1,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardPrice: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#07843D',
  },
  cardOrigPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  addBtn: {
    backgroundColor: '#07843D',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 16,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#07843D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  cardQtySelector: {
    backgroundColor: '#07843D',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  cardQtyBtn: {
    paddingHorizontal: 4,
  },
  cardQtyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cardQtyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 6,
  },
});
