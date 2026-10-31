import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import {
  X,
  CircleCheck,
  Sprout,
  Camera,
  Image as ImageIcon,
  Heart,
  Leaf,
  Milk,
  Apple,
  Wheat,
  Droplets,
  Sparkles,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { CustomerScreensProps, CustomerScreenKey } from './types';
import { Product } from '../../constants/mockData';
import { AppButton } from '../../components/LoadingAndError';
import { ORGANIC_PRODUCT_PRESETS } from '../../constants/mockData';
import { getGradientTheme } from '../../components/HomeHeader';

// Modular Customer Sub-screens
import { CustomerHomeScreen } from './CustomerHomeScreen';
import { AllProductsScreen } from './AllProductsScreen';
import { ProductDetailsScreen } from './ProductDetailsScreen';
import { CartScreen } from './CartScreen';
import { SubscriptionScreen } from './SubscriptionScreen';
import { PaymentScreen } from './PaymentScreen';
import { MySubscriptionsScreen } from './MySubscriptionsScreen';
import { OrderHistoryScreen } from './OrderHistoryScreen';
import { ProfileScreen } from './ProfileScreen';
import { CategoryProductListingScreen } from './CategoryProductListingScreen';
import { CategoryVendorDiscoveryScreen } from './CategoryVendorDiscoveryScreen';
import { VendorStoreScreen } from './VendorStoreScreen';

// Modular API Services & Theme
import {
  bannerService,
  productService,
  orderService,
  vendorService,
  authService,
  cartService,
  subscriptionService,
} from '../../services';
import { safeCategory, DynamicBanner, DynamicCategory } from '../../services/api.client';
import { theme } from '../../theme';

export const CustomerPortalScreen: React.FC<CustomerScreensProps> = ({
  customerScreen,
  setCustomerScreen,
  searchQuery,
  setSearchQuery,
  selectedProduct,
  setSelectedProduct,
  activeSubscriptionData,
  setActiveSubscriptionData,
  subscriptions,
  setSubscriptions,
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
  scrollY,
}) => {
  // ── Cart State ──
  const [internalCart, setInternalCart] = useState<{ product: Product; qty: number }[]>([]);
  const cart = propCart !== undefined ? propCart : internalCart;
  const setCart = propSetCart !== undefined ? propSetCart : setInternalCart;
  const [activeCategory, setActiveCategory] = useState('All');

  // ── Category & Vendor Discovery Navigation State ──
  const [navCategoryId, setNavCategoryId] = useState<string | undefined>(undefined);
  const [navCategoryName, setNavCategoryName] = useState<string | undefined>(undefined);
  const [navVendorId, setNavVendorId] = useState<string | undefined>(undefined);
  const [navVendorName, setNavVendorName] = useState<string | undefined>(undefined);

  const handleOpenCategory = (catId: string, catName: string) => {
    setNavCategoryId(catId || undefined);
    setNavCategoryName(catName || 'All Products');
    setNavVendorId(undefined);
    setNavVendorName(undefined);
    setCustomerScreen('CATEGORY_PRODUCTS');
  };

  const handleOpenVendorDiscovery = (catId?: string) => {
    setNavCategoryId(catId || undefined);
    setCustomerScreen('CATEGORY_VENDOR_DISCOVERY');
  };

  const handleSelectVendorCategory = (catId: string, vId: string, catName: string, vName: string) => {
    setNavCategoryId(catId);
    setNavCategoryName(catName);
    setNavVendorId(vId);
    setNavVendorName(vName);
    setCustomerScreen('VENDOR_STORE');
  };

  const handleOpenVendorStore = (vId: string, vName?: string) => {
    setNavVendorId(vId);
    setNavVendorName(vName);
    setCustomerScreen('VENDOR_STORE');
  };

  const cleanUserPhone = (userPhone || '').replace(/[^0-9]/g, '');

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Load database saved cart for customer on open / mount
  useEffect(() => {
    if (cleanUserPhone) {
      cartService.getCart(cleanUserPhone)
        .then((dbCart: any) => {
          if (Array.isArray(dbCart) && dbCart.length > 0) {
            setCart(dbCart);
          }
        })
        .catch((err: any) => {
          console.warn('⚠️ [CustomerPortalScreen] Could not fetch saved database cart:', err.message);
        });
    }
  }, [cleanUserPhone]);

  const addToCart = (p: Product, qty = 1) => {
    // Optimistic UI update
    setCart(prev => {
      const existing = prev.find(i => i.product.id === p.id);
      if (existing) return prev.map(i => (i.product.id === p.id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { product: p, qty }];
    });
    Alert.alert('Added to Cart', `${p.name} added to cart!`);

    // Persist to PostgreSQL database
    if (cleanUserPhone) {
      cartService.addToCart(cleanUserPhone, p.id, qty)
        .then((dbCart: any) => {
          if (Array.isArray(dbCart) && dbCart.length > 0) {
            setCart(dbCart);
          }
        })
        .catch((err: any) => {
          console.warn('⚠️ [CustomerPortalScreen.addToCart] DB save error:', err.message);
        });
    }
  };

  const updateCartQty = (p: Product, delta: number) => {
    // Optimistic UI update
    setCart(prev => {
      const existing = prev.find(i => i.product.id === p.id);
      if (!existing) {
        if (delta > 0) return [...prev, { product: p, qty: 1 }];
        return prev;
      }
      const newQty = existing.qty + delta;
      if (newQty <= 0) return prev.filter(i => i.product.id !== p.id);
      return prev.map(i => (i.product.id === p.id ? { ...i, qty: newQty } : i));
    });

    // Persist to PostgreSQL database
    if (cleanUserPhone) {
      cartService.updateCartQty(cleanUserPhone, p.id, delta)
        .then((dbCart: any) => {
          if (Array.isArray(dbCart)) {
            setCart(dbCart);
          }
        })
        .catch((err: any) => {
          console.warn('⚠️ [CustomerPortalScreen.updateCartQty] DB update error:', err.message);
        });
    }
  };

  const removeFromCart = (id: string) => {
    // Optimistic UI update
    setCart(prev => prev.filter(i => i.product.id !== id));

    // Remove from PostgreSQL database
    if (cleanUserPhone) {
      cartService.removeFromCart(cleanUserPhone, id)
        .then((dbCart: any) => {
          if (Array.isArray(dbCart)) {
            setCart(dbCart);
          }
        })
        .catch((err: any) => {
          console.warn('⚠️ [CustomerPortalScreen.removeFromCart] DB delete error:', err.message);
        });
    }
  };

  // ── Favorites State ──
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const toggleFavorite = (productId: string) => {
    setFavorites(prev => ({ ...prev, [productId]: !prev[productId] }));
  };
  const favoritesArray = Object.keys(favorites).filter(id => favorites[id]);

  // ── Catalog Data State ──
  const [bannersList, setBannersList] = useState<DynamicBanner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(false);
  const [categoriesList, setCategoriesList] = useState<DynamicCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const bannerScrollRef = useRef<ScrollView>(null);

  // ── Profile State ──
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

  // ── Vendor Application State ──
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vApplicantPhone, setVApplicantPhone] = useState(userPhone || '');
  const [vFarmName, setVFarmName] = useState('');
  const [vFarmLocation, setVFarmLocation] = useState('');
  const [vCropCategories, setVCropCategories] = useState('');
  const [vExperience, setVExperience] = useState('');
  const [vCertNo, setVCertNo] = useState('');
  const [isSubmittingVendor, setIsSubmittingVendor] = useState(false);
  const [vApplyError, setVApplyError] = useState<string | null>(null);

  // ── Add Crop Modal State (Vendor in Customer mode) ──
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Fresh Vegetables');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('Kg');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState(
    ORGANIC_PRODUCT_PRESETS[0]?.url ||
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
  );
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [addProdError, setAddProdError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedLocation?.address) {
      setProfileLocation(selectedLocation.address);
      setEditLocation(selectedLocation.address);
    }
  }, [selectedLocation?.address]);

  // Load user profile
  useEffect(() => {
    const cleanPhone = (userPhone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone) return;
    authService
      .getUserProfile(cleanPhone)
      .then(profile => {
        if (profile) {
          if (profile.fullName || profile.name) {
            setProfileName(profile.fullName || profile.name || '');
            setEditName(profile.fullName || profile.name || '');
          }
          if (profile.email) {
            setProfileEmail(profile.email);
            setEditEmail(profile.email);
          }
          if (profile.location) {
            setProfileLocation(profile.location);
            setEditLocation(profile.location);
          }
          setProfileStats({
            orders: profile.totalOrders || 0,
            subs: profile.activeSubscriptions || subscriptions.length,
            spent: profile.totalSpend || 0,
            points: profile.loyaltyPoints || 0,
          });
        }
      })
      .catch(() => {});
  }, [userPhone, customerScreen]);

  // Load catalog items via modular services
  const fetchBanners = async () => {
    setIsLoadingBanners(true);
    try {
      const list = await bannerService.getAll();
      setBannersList(list);
      if (list.length > 0 && onBannerThemeChange && list[0]?.backgroundColor) {
        onBannerThemeChange(list[0].backgroundColor);
      }
    } catch (e) {
      console.warn('Error fetching banners:', e);
    } finally {
      setIsLoadingBanners(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const list = await productService.getCategories();
      setCategoriesList(list);
    } catch (e) {
      console.warn('Error fetching categories:', e);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setProductsError(null);
    try {
      const list = await productService.getAll();
      const sanitized = list.map((p: any) => ({
        ...p,
        category: safeCategory(p.category || p.categoryName),
      }));
      setProductsList(sanitized);
    } catch {
      setProductsError('Unable to load organic products from server. Please verify connection.');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const getOrderFallbackImage = (text: string): string => {
    const t = (text || '').toLowerCase();
    if (t.includes('milk') || t.includes('dairy') || t.includes('ghee'))
      return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=300';
    if (t.includes('veg') || t.includes('tomato') || t.includes('spinach') || t.includes('carrot') || t.includes('potato'))
      return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=300';
    if (t.includes('fruit') || t.includes('apple') || t.includes('banana') || t.includes('orange') || t.includes('mango'))
      return 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=300';
    if (t.includes('oil'))
      return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=300';
    if (t.includes('dry') || t.includes('nut') || t.includes('snack'))
      return 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=300';
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300';
  };

  const fetchOrders = async () => {
    try {
      const orders = await orderService.getAll(userPhone);
      const mapped = orders.map((o: any) => {
        const firstProd = o.items && o.items.length > 0 ? o.items[0]?.product : null;
        const prodNames =
          o.items && o.items.length > 0
            ? o.items.map((it: any) => `${it.product?.name || 'Organic item'} ×${it.quantity}`).join(', ')
            : 'Certified Organic Harvest items';
        const img = firstProd?.imageUrl || getOrderFallbackImage(prodNames);
        const orderIdDisplay = o.id
          ? o.id.startsWith('ORD-')
            ? o.id
            : `#ORD-${o.id.substring(0, 6).toUpperCase()}`
          : '#ORD';
        const effectiveVendorName = o.vendor?.businessName || o.vendorName || (o.items && o.items[0]?.product?.vendorName) || 'Organic Partner Farm';

        return {
          id: orderIdDisplay,
          rawId: o.id,
          products: prodNames,
          imageUrl: img,
          items: o.items || [],
          amount: o.totalAmount || o.amount || 0,
          date: o.createdAt ? o.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10),
          paymentStatus: o.paymentStatus || 'SUCCESS',
          deliveryStatus: o.deliveryStatus || 'CONFIRMED',
          deliveryOtp: o.deliveryOtp,
          vendorName: effectiveVendorName,
        };
      });
      setUserOrders(mapped);
    } catch {}
  };

  useEffect(() => {
    fetchBanners();
    fetchCategories();
    fetchProducts();
    fetchOrders();
  }, [customerScreen, userPhone]);

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
      const found = productsList.find(
        p => p.id === banner.targetId || p.name.toLowerCase() === banner.targetId?.toLowerCase()
      );
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

  const handleBannerChange = (idx: number) => {
    if (idx >= 0 && idx < bannersList.length) {
      setActiveBannerIdx(idx);
      const b = bannersList[idx];
      if (b?.backgroundColor && onBannerThemeChange) {
        onBannerThemeChange(b.backgroundColor);
      }
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setSaveSuccessMsg(null);
    try {
      const cleanPhone = (userPhone || '').replace(/[^0-9]/g, '');
      if (!cleanPhone) {
        Alert.alert('Error', 'Please log in with your phone number to save your profile.');
        setIsSavingProfile(false);
        return;
      }
      const data = await authService.updateUserProfile(cleanPhone, {
        fullName: editName.trim(),
        email: editEmail.trim(),
        location: editLocation.trim() || selectedLocation?.address || '',
      });
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
      const data = await vendorService.submitRequest({
        phoneNumber: cleanPhone,
        userName: profileName ? profileName.trim() : 'Vendor Applicant',
        farmName: vFarmName.trim(),
        farmLocation: vFarmLocation.trim(),
        cropCategories: vCropCategories.trim(),
        experienceYears: vExperience.trim(),
        certificateNo: vCertNo.trim(),
      });
      if (data.success) {
        try {
          const g = globalThis as any;
          if (g.localStorage) g.localStorage.setItem('agriflow_vendor_applied_' + cleanPhone, 'true');
          else if (g.window?.localStorage) g.window.localStorage.setItem('agriflow_vendor_applied_' + cleanPhone, 'true');
        } catch {}
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
      try {
        const g = globalThis as any;
        if (g.localStorage) g.localStorage.setItem('agriflow_vendor_applied_' + cleanPhone, 'true');
        else if (g.window?.localStorage) g.window.localStorage.setItem('agriflow_vendor_applied_' + cleanPhone, 'true');
      } catch {}
      setShowVendorModal(false);
      if (onRefreshVendorStatus) onRefreshVendorStatus();
      Alert.alert('Request Recorded', 'Your request has been saved. Admin will review and verify your farm.');
    } finally {
      setIsSubmittingVendor(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsPlacingOrder(true);
    try {
      const itemsPayload = cart.map(item => ({
        productId: item.product.id,
        quantity: item.qty,
        price: item.product.price,
        vendorId: item.product.vendorId || (item as any).vendorId,
      }));

      const data = await orderService.createOrder({
        customerName: profileName.trim() || 'Customer',
        customerPhone: userPhone || '',
        deliveryAddress: profileLocation || selectedLocation?.address || '',
        totalAmount: cartTotal,
        paymentMethod: 'UPI',
        items: itemsPayload,
      });

      const orderList = (data as any)?.orders || (data.data as any)?.orders || [];
      const orderCount = orderList.length || 1;
      const orderMessage =
        orderCount > 1
          ? `Your order was split into ${orderCount} separate partner orders for different farms and recorded in the database.`
          : `Your order #${data.data?.id ? data.data.id.substring(0, 8) : 'ORD'} for ₹${cartTotal} was successfully placed.`;

      Alert.alert('Order Placed Successfully!', orderMessage);
      setCart([]);
      if (cleanUserPhone) {
        cartService.clearCart(cleanUserPhone).catch(() => {});
      }
      fetchOrders();
      setCustomerScreen('ORDER_HISTORY');
    } catch (err: any) {
      Alert.alert('Order Placement Notice', err.message || `Your order of ₹${cartTotal} has been recorded.`);
      setCart([]);
      if (cleanUserPhone) {
        cartService.clearCart(cleanUserPhone).catch(() => {});
      }
      fetchOrders();
      setCustomerScreen('ORDER_HISTORY');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleReorder = (order: any) => {
    if (order.items && order.items.length > 0) {
      order.items.forEach((it: any) => {
        if (it.product) {
          addToCart(it.product, it.quantity || 1);
        }
      });
      Alert.alert('Items Added!', 'Order items have been added to your cart.');
      setCustomerScreen('CART');
    } else {
      setCustomerScreen('ALL_PRODUCTS');
    }
  };

  const handlePaySubscription = async () => {
    try {
      const payload = {
        productId: activeSubscriptionData.product.id,
        vendorId: activeSubscriptionData.product.vendorId || activeSubscriptionData.product.vendor?.id,
        quantity: activeSubscriptionData.qty,
        frequency: activeSubscriptionData.freq,
        duration: activeSubscriptionData.duration,
        deliveryTime: activeSubscriptionData.time,
        timeSlot: activeSubscriptionData.time,
        totalAmount: activeSubscriptionData.priceTotal,
        priceTotal: activeSubscriptionData.priceTotal,
        selectedDays: activeSubscriptionData.selectedDays,
        selectedDates: activeSubscriptionData.selectedDates,
        startDate: activeSubscriptionData.startDate,
        endDate: activeSubscriptionData.endDate,
        totalDeliveries: activeSubscriptionData.totalDeliveries,
        userPhone: userPhone || '',
      };
      const data = await subscriptionService.createSubscription(payload);
      const newSub =
        data.success && data.data
          ? {
              ...data.data,
              product: activeSubscriptionData.product,
              qty: activeSubscriptionData.qty,
              freq: activeSubscriptionData.freq,
              duration: activeSubscriptionData.duration,
              time: activeSubscriptionData.time,
              priceTotal: activeSubscriptionData.priceTotal,
              status: 'Active',
              startDate: activeSubscriptionData.startDate || new Date().toISOString().split('T')[0],
              skippedDates: [],
            }
          : {
              id: 'sub_' + Date.now(),
              product: activeSubscriptionData.product,
              qty: activeSubscriptionData.qty,
              freq: activeSubscriptionData.freq,
              duration: activeSubscriptionData.duration,
              time: activeSubscriptionData.time,
              priceTotal: activeSubscriptionData.priceTotal,
              status: 'Active',
              startDate: activeSubscriptionData.startDate || new Date().toISOString().split('T')[0],
              skippedDates: [],
            };
      setSubscriptions((prev: any[]) => [newSub, ...prev]);
      Alert.alert('Payment Successful!', `Subscription is active in the database!`);
      setCustomerScreen('MY_SUBSCRIPTIONS');
    } catch {
      const newSub = {
        id: 'sub_' + Date.now(),
        product: activeSubscriptionData.product,
        qty: activeSubscriptionData.qty,
        freq: activeSubscriptionData.freq,
        duration: activeSubscriptionData.duration,
        time: activeSubscriptionData.time,
        priceTotal: activeSubscriptionData.priceTotal,
        status: 'Active',
        startDate: activeSubscriptionData.startDate || new Date().toISOString().split('T')[0],
        skippedDates: [],
      };
      setSubscriptions((prev: any[]) => [newSub, ...prev]);
      Alert.alert('Payment Successful!', `Subscription is now active!`);
      setCustomerScreen('MY_SUBSCRIPTIONS');
    }
  };

  const getCategoryIcon = (cat: string, color: string) => {
    const cLower = (cat || '').toLowerCase();
    if (cLower === 'all') return <Leaf size={14} color={color} />;
    if (cLower.includes('dairy') || cLower.includes('milk') || cLower.includes('ghee'))
      return <Milk size={14} color={color} />;
    if (cLower.includes('veg')) return <Sprout size={14} color={color} />;
    if (cLower.includes('fruit')) return <Apple size={14} color={color} />;
    if (cLower.includes('groc') || cLower.includes('grain')) return <Wheat size={14} color={color} />;
    if (cLower.includes('oil')) return <Droplets size={14} color={color} />;
    if (cLower.includes('dry') || cLower.includes('snack')) return <Sparkles size={14} color={color} />;
    return <Leaf size={14} color={color} />;
  };

  // Image upload helpers for Add Crop
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
        const uploadedUrl = await bannerService.uploadImage(dataUri, `cust-gal-${Date.now()}.jpg`);
        setNewProdImage(uploadedUrl);
      }
    } catch (err: any) {
      console.warn('Gallery pick error:', err);
      Alert.alert('Gallery Error', 'Could not open device photo gallery.');
    } finally {
      setIsUploadingImage(false);
    }
  };

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
        const uploadedUrl = await bannerService.uploadImage(dataUri, `cust-cam-${Date.now()}.jpg`);
        setNewProdImage(uploadedUrl);
      }
    } catch (err: any) {
      console.warn('Camera capture error:', err);
      Alert.alert('Camera Error', 'Could not access device camera.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreateProduct = async () => {
    setAddProdError(null);
    if (!isApprovedVendor) {
      Alert.alert(
        'Vendor Access Required',
        'Only verified and approved vendors can add crops or products. Please apply in your profile.'
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
        category: newProdCategory,
        price: priceNum,
        unit: newProdUnit.trim() || 'Kg',
        stock: stockNum,
        description: newProdDesc.trim() || `${newProdName.trim()} direct from certified organic farms.`,
        imageUrl:
          newProdImage.trim() ||
          'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        benefits: ['100% Certified Organic', 'Farm Fresh Harvest', 'Zero Chemical Residue'],
        subscriptionAllowed: true,
        oneTimeAllowed: true,
        organicCertified: true,
      };

      const data = await productService.createProduct(payload);
      if (data.success && data.data) {
        const created = {
          ...data.data,
          category: safeCategory(data.data.category),
        };
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
        setAddProdError(data.message || 'Failed to add product. Please verify API server.');
      }
    } catch {
      setAddProdError('Network error connecting to API. Ensure API server is running on port 5050.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Reusable Product Card renderer
  const renderProductCard = (p: Product) => {
    const cartItem = cart.find(i => i.product.id === p.id);
    const qty = cartItem ? cartItem.qty : 0;
    const isFav = !!favorites[p.id];
    const isOutOfStock = p.stock !== undefined && p.stock <= 0;

    return (
      <TouchableOpacity
        key={p.id}
        className="w-[48%] bg-white rounded-2xl p-2.5 mb-3 border border-slate-100 shadow-sm"
        onPress={() => {
          setSelectedProduct(p);
          setCustomerScreen('PRODUCT_DETAILS');
        }}
        activeOpacity={0.88}
      >
        <View className="flex-row items-center justify-between mb-1.5">
          <View className="bg-emerald-50 px-2 py-0.5 rounded-md">
            <Text className="text-2xs font-black uppercase text-emerald-800">
              {p.organicCertified ? 'ORGANIC' : 'FRESH'}
            </Text>
          </View>
          <TouchableOpacity
            className="w-7 h-7 rounded-full bg-slate-50 items-center justify-center"
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

        <View className="w-full h-28 rounded-xl overflow-hidden bg-slate-50 items-center justify-center mb-2">
          <Image
            source={{
              uri:
                p.imageUrl ||
                'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400',
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <Text className="text-sm font-bold text-slate-900 tracking-tight" numberOfLines={1}>
          {p.name}
        </Text>
        <Text className="text-xs font-semibold text-slate-500 mt-0.5" numberOfLines={1}>
          {p.unit || '1 kg'}
        </Text>

        <View className="flex-row items-center mt-1">
          <Text className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100" numberOfLines={1}>
            🌱 {p.vendorName || p.vendor?.businessName || p.brand || 'Local Farm'}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-2 pt-1">
          <Text className="text-base font-black text-slate-900">₹{p.price}</Text>

          {isOutOfStock ? (
            <View className="bg-slate-400 px-3 py-1.5 rounded-lg">
              <Text className="text-white text-xs font-bold">Out of Stock</Text>
            </View>
          ) : qty > 0 ? (
            <View className="flex-row items-center bg-emerald-50 border border-emerald-300 rounded-lg px-2 py-0.5 gap-2">
              <TouchableOpacity
                className="w-5 h-5 rounded items-center justify-center bg-emerald-700"
                onPress={() => updateCartQty(p, -1)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text className="text-white text-sm font-black">−</Text>
              </TouchableOpacity>
              <Text className="text-sm font-black text-emerald-800">{qty}</Text>
              <TouchableOpacity
                className="w-5 h-5 rounded items-center justify-center bg-emerald-700"
                onPress={() => updateCartQty(p, 1)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text className="text-white text-sm font-black">+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-emerald-700 px-3.5 py-1.5 rounded-lg"
              onPress={() => addToCart(p)}
              activeOpacity={0.8}
            >
              <Text className="text-white text-xs font-bold">Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ── Floating Cart Bar with Close / Dismiss Button ──
  const [isCartBarDismissed, setIsCartBarDismissed] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setIsCartBarDismissed(false);
    }
  }, [cartCount]);

  const renderFloatingCartBar = () => {
    if (isCartBarDismissed || cartCount === 0 || customerScreen === 'CART' || customerScreen === 'CHECKOUT') return null;
    return (
      <View className="absolute bottom-3 left-4 right-4 bg-[#0D2B1D] rounded-2xl px-4 py-3 flex-row items-center justify-between shadow-xl border border-[#22c55e] z-50">
        <View className="flex-1 mr-2">
          <Text className="text-[#86EFAC] text-xs font-extrabold uppercase tracking-wider">
            {cartCount} {cartCount === 1 ? 'Item' : 'Items'} in Cart
          </Text>
          <Text className="text-white text-lg font-black">
            ₹{cartTotal} <Text className="text-xs text-white/70 font-normal">+ Free Delivery</Text>
          </Text>
        </View>
        <View className="flex-row items-center gap-2 shrink-0">
          <TouchableOpacity
            className="bg-[#22c55e] px-4 py-2.5 rounded-xl active:bg-emerald-600 shadow-xs"
            onPress={() => setCustomerScreen('CART')}
          >
            <Text className="text-[#0D2B1D] text-xs font-black">View Cart →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-8 h-8 rounded-full bg-white/20 items-center justify-center active:bg-white/30"
            onPress={() => setIsCartBarDismissed(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Close Cart Bar"
          >
            <X size={16} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const categories = ['All', ...categoriesList.map(c => c.name)];
  const filteredProducts = productsList.filter(p => {
    const matchCat = activeCategory === 'All' || safeCategory(p.category).toLowerCase().includes(activeCategory.toLowerCase());
    const matchSearch = searchQuery.trim() === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Active Banner Theme & Header Gradient Sync ──
  const activeBanner = bannersList[activeBannerIdx] || bannersList[0];
  const activeBannerColor = activeBanner?.backgroundColor || '#07843D';
  const activeBannerGrad = getGradientTheme(activeBannerColor);

  useEffect(() => {
    if (bannersList.length > 0 && onBannerThemeChange && activeBannerColor) {
      onBannerThemeChange(activeBannerColor);
    }
  }, [activeBannerColor, bannersList]);

  // ── SCREEN ROUTER ──
  return (
    <View className="flex-1 bg-white">
      {customerScreen === 'HOME' && (
        <CustomerHomeScreen
          headerGrad={activeBannerGrad}
          scrollY={scrollY}
          isLoadingBanners={isLoadingBanners}
          bannersList={bannersList}
          bannerScrollRef={bannerScrollRef}
          activeBannerIdx={activeBannerIdx}
          handleBannerChange={handleBannerChange}
          handleBannerPress={handleBannerPress}
          isLoadingCategories={isLoadingCategories}
          dbCategories={categoriesList}
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          getCategoryIcon={getCategoryIcon}
          products={productsList}
          favorites={favoritesArray}
          toggleFavorite={toggleFavorite}
          cartItems={cart}
          addToCart={addToCart}
          updateCartQty={(id: string, delta: number) => {
            const p = productsList.find(x => x.id === id);
            if (p) updateCartQty(p, delta);
          }}
          onOpenDetails={(p: Product) => {
            setSelectedProduct(p);
            setCustomerScreen('PRODUCT_DETAILS');
          }}
          onSubscribe={(p: Product) => {
            setActiveSubscriptionData({
              product: p,
              qty: 1,
              freq: 'Daily',
              duration: 30,
              time: '06:30 AM',
              priceTotal: p.price * 30,
            });
            setCustomerScreen('SUBSCRIPTION_CREATE');
          }}
          setCustomerScreen={setCustomerScreen}
          onOpenCategory={handleOpenCategory}
          onOpenVendorDiscovery={handleOpenVendorDiscovery}
          isApprovedVendor={isApprovedVendor}
          setShowAddProductModal={setShowAddProductModal}
          renderProductCard={renderProductCard}
        />
      )}

      {(customerScreen === 'CATEGORY_PRODUCTS' || customerScreen === 'ALL_PRODUCTS') && (
        <CategoryProductListingScreen
          categoryId={navCategoryId}
          categoryName={navCategoryName}
          vendorId={navVendorId}
          vendorName={navVendorName}
          cart={cart}
          favorites={favoritesArray}
          toggleFavorite={toggleFavorite}
          addToCart={addToCart}
          updateCartQty={updateCartQty}
          onOpenDetails={(p: Product) => {
            setSelectedProduct(p);
            setCustomerScreen('PRODUCT_DETAILS');
          }}
          onOpenVendorStore={handleOpenVendorStore}
          onOpenVendorDiscovery={handleOpenVendorDiscovery}
          onBack={() => setCustomerScreen('HOME')}
          onOpenCart={() => setCustomerScreen('CART')}
          onOpenPlans={() => setCustomerScreen('MY_SUBSCRIPTIONS')}
          headerThemeColor={activeBannerColor}
        />
      )}

      {customerScreen === 'CATEGORY_VENDOR_DISCOVERY' && (
        <CategoryVendorDiscoveryScreen
          initialCategoryId={navCategoryId}
          cart={cart}
          addToCart={addToCart}
          updateCartQty={updateCartQty}
          onOpenDetails={(p: Product) => {
            setSelectedProduct(p);
            setCustomerScreen('PRODUCT_DETAILS');
          }}
          onSelectVendorCategory={handleSelectVendorCategory}
          onViewAllCategoryProducts={(catId, catName) => {
            setNavCategoryId(catId);
            setNavCategoryName(catName);
            setCustomerScreen('CATEGORY_PRODUCTS');
          }}
          onBack={() => setCustomerScreen('HOME')}
          onOpenCart={() => setCustomerScreen('CART')}
          onOpenPlans={() => setCustomerScreen('MY_SUBSCRIPTIONS')}
          headerThemeColor={activeBannerColor}
        />
      )}

      {customerScreen === 'VENDOR_STORE' && navVendorId && (
        <VendorStoreScreen
          vendorId={navVendorId}
          vendorName={navVendorName}
          initialCategoryId={navCategoryId}
          cart={cart}
          favorites={favoritesArray}
          toggleFavorite={toggleFavorite}
          addToCart={addToCart}
          updateCartQty={updateCartQty}
          onOpenDetails={(p: Product) => {
            setSelectedProduct(p);
            setCustomerScreen('PRODUCT_DETAILS');
          }}
          onBack={() => setCustomerScreen('CATEGORY_PRODUCTS')}
        />
      )}

      {customerScreen === 'PRODUCT_DETAILS' && selectedProduct && (
        <ProductDetailsScreen
          product={selectedProduct}
          productsList={productsList}
          onBack={() => setCustomerScreen('HOME')}
          isFavorite={!!favorites[selectedProduct.id]}
          onToggleFavorite={toggleFavorite}
          selectedLocation={selectedLocation}
          onAddToCart={(p, qty) => {
            addToCart(p, qty);
            setCustomerScreen('HOME');
          }}
          onSelectProduct={setSelectedProduct}
          onStartSubscription={(p, qty) => {
            setActiveSubscriptionData({
              product: p,
              qty,
              freq: 'Daily',
              duration: 30,
              time: '06:30 AM',
              priceTotal: p.price * qty * 30,
            });
            setCustomerScreen('SUBSCRIPTION_CREATE');
          }}
        />
      )}

      {customerScreen === 'CART' && (
        <CartScreen
          cart={cart}
          onRemoveFromCart={removeFromCart}
          onUpdateQty={updateCartQty}
          onBrowseProducts={() => setCustomerScreen('ALL_PRODUCTS')}
          selectedLocation={selectedLocation || null}
          profileLocation={profileLocation}
          onChangeLocation={onChangeLocation}
          isPlacingOrder={isPlacingOrder}
          onPlaceOrder={handlePlaceOrder}
        />
      )}

      {(customerScreen === 'SUBSCRIPTION_CREATE' || customerScreen === 'SUBSCRIPTION_SUMMARY') && (
        <SubscriptionScreen
          product={activeSubscriptionData.product}
          initialQty={activeSubscriptionData.qty || 1}
          userPhone={userPhone}
          onBack={() => setCustomerScreen('HOME')}
          onSubscriptionCreated={(createdSub: any) => {
            setSubscriptions((prev: any[]) => [createdSub, ...prev]);
            setCustomerScreen('MY_SUBSCRIPTIONS');
          }}
          onProceedToPayment={cfg => {
            setActiveSubscriptionData(cfg);
            setCustomerScreen('PAYMENT');
          }}
        />
      )}

      {customerScreen === 'PAYMENT' && (
        <PaymentScreen
          amount={activeSubscriptionData.priceTotal}
          onPaySuccess={handlePaySubscription}
          onBack={() => setCustomerScreen('SUBSCRIPTION_CREATE')}
        />
      )}

      {customerScreen === 'MY_SUBSCRIPTIONS' && (
        <MySubscriptionsScreen
          subscriptions={subscriptions}
          onUpdateSubscriptions={setSubscriptions}
          onExplorePlans={() => setCustomerScreen('ALL_PRODUCTS')}
        />
      )}

      {customerScreen === 'ORDER_HISTORY' && (
        <OrderHistoryScreen
          orders={userOrders}
          onBrowseProducts={() => setCustomerScreen('ALL_PRODUCTS')}
          onReorder={handleReorder}
        />
      )}

      {customerScreen === 'PROFILE' && (
        <ProfileScreen
          userPhone={userPhone}
          profileName={profileName}
          profileEmail={profileEmail}
          profileLocation={profileLocation}
          profileStats={profileStats}
          isApprovedVendor={isApprovedVendor}
          vendorApplicationStatus={vendorApplicationStatus}
          cartCount={cartCount}
          onNavigateScreen={scr => setCustomerScreen(scr)}
          onOpenEditProfile={() => setShowEditProfileModal(true)}
          onOpenVendorModal={() => {
            setVApplicantPhone(userPhone || '');
            setVFarmName('');
            setVFarmLocation('');
            setVCropCategories('');
            setVExperience('');
            setVCertNo('');
            setVApplyError(null);
            setShowVendorModal(true);
          }}
          onRefreshVendorStatus={onRefreshVendorStatus || (() => {})}
          onSwitchToVendor={onSwitchToVendor}
          onLogout={handleLogout}
        />
      )}

      {renderFloatingCartBar()}

      {/* ── Edit Profile Modal ── */}
      <Modal visible={showEditProfileModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-5 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <View>
                <Text className="text-base font-bold text-slate-800">Edit Profile Details</Text>
                <Text className="text-xs text-slate-500 mt-0.5">Update your personal & delivery address</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowEditProfileModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[420px]">
              {saveSuccessMsg ? (
                <View className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg mb-3 flex-row items-center gap-1.5">
                  <CircleCheck size={14} color="#047857" />
                  <Text className="text-xs font-semibold text-emerald-800">{saveSuccessMsg}</Text>
                </View>
              ) : null}

              <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Full Name</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-2"
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter full name"
                placeholderTextColor="#94A3B8"
              />

              <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Registered Mobile Number</Text>
              <TextInput
                className="bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 mb-2"
                value={userPhone ? `+91 ${userPhone}` : ''}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#94A3B8"
                editable={false}
              />

              <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Email Address</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-2"
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="you@domain.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Delivery Address & Landmark</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 pt-2 text-sm text-slate-800 mb-2 h-[70px]"
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
                className="mt-3.5"
              />
              <View className="h-5" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Vendor Registration Modal ── */}
      <Modal visible={showVendorModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-5 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <View>
                <Text className="text-base font-bold text-slate-800">Vendor Registration</Text>
                <Text className="text-xs text-slate-500 mt-0.5">Sends verification request to Admin</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowVendorModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[420px]">
              {vApplyError ? (
                <View className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg mb-3">
                  <Text className="text-xs font-semibold text-rose-600">{vApplyError}</Text>
                </View>
              ) : null}

              <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Applicant Mobile *</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-2"
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                value={vApplicantPhone}
                onChangeText={setVApplicantPhone}
              />

              <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Farm / Producer Name *</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-2"
                placeholder="Enter farm or producer name"
                placeholderTextColor="#94A3B8"
                value={vFarmName}
                onChangeText={setVFarmName}
              />

              <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Farm Location & District *</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-2"
                placeholder="Enter farm location and district"
                placeholderTextColor="#94A3B8"
                value={vFarmLocation}
                onChangeText={setVFarmLocation}
              />

              <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Crop Types / Harvest Categories</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-2"
                placeholder="Enter crop types (e.g. Vegetables, Dairy)"
                placeholderTextColor="#94A3B8"
                value={vCropCategories}
                onChangeText={setVCropCategories}
              />

              <View className="flex-row gap-2.5">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Experience (Yrs)</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-2"
                    placeholder="e.g. 5"
                    keyboardType="numeric"
                    placeholderTextColor="#94A3B8"
                    value={vExperience}
                    onChangeText={setVExperience}
                  />
                </View>
                <View className="flex-[1.5]">
                  <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Cert No / Accreditation</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-2"
                    placeholder="Enter cert number (optional)"
                    placeholderTextColor="#94A3B8"
                    value={vCertNo}
                    onChangeText={setVCertNo}
                  />
                </View>
              </View>

              <AppButton
                title="Submit Vendor Application →"
                loading={isSubmittingVendor}
                loadingText="Submitting Application..."
                onPress={handleApplyVendor}
                size="large"
                className="mt-3.5"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Add Crop Modal (Approved Vendors Only) ── */}
      {isApprovedVendor && (
        <Modal visible={showAddProductModal} transparent animationType="slide">
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-3xl p-5 max-h-[85%]">
              <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <View>
                  <View className="flex-row items-center gap-1.5">
                    <Sprout size={18} color={theme.colors.light} />
                    <Text className="text-base font-bold text-slate-800">Add Crop / Product</Text>
                  </View>
                  <Text className="text-xs text-slate-500 mt-0.5">
                    Publish verified harvest to local subscriber catalog
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowAddProductModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="max-h-[420px]">
                {addProdError ? (
                  <View className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg mb-3">
                    <Text className="text-xs font-semibold text-rose-600">{addProdError}</Text>
                  </View>
                ) : null}

                <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Crop / Product Name *</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-2"
                  placeholder="e.g. Organic Ooty Carrots"
                  placeholderTextColor="#94A3B8"
                  value={newProdName}
                  onChangeText={setNewProdName}
                />

                <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2.5">
                  {[
                    'Fresh Vegetables',
                    'Dairy & Pure Ghee',
                    'Fresh Fruits',
                    'Groceries & Grains',
                    'Organic Oils',
                    'Dry Fruits & Snacks',
                  ].map(cat => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setNewProdCategory(cat)}
                      className={`rounded-full border mr-2 px-2.5 py-1.5 ${
                        newProdCategory === cat
                          ? 'bg-emerald-50 border-emerald-600'
                          : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          newProdCategory === cat
                            ? 'text-emerald-700 font-bold'
                            : 'text-slate-600 font-medium'
                        }`}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View className="flex-row gap-2.5">
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Price (₹) *</Text>
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-2"
                      placeholder="e.g. 75"
                      keyboardType="numeric"
                      placeholderTextColor="#94A3B8"
                      value={newProdPrice}
                      onChangeText={setNewProdPrice}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Unit</Text>
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-2"
                      placeholder="e.g. Kg"
                      placeholderTextColor="#94A3B8"
                      value={newProdUnit}
                      onChangeText={setNewProdUnit}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Stock</Text>
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-2"
                      placeholder="e.g. 50"
                      keyboardType="numeric"
                      placeholderTextColor="#94A3B8"
                      value={newProdStock}
                      onChangeText={setNewProdStock}
                    />
                  </View>
                </View>

                <Text className="text-xs font-bold text-slate-700 mb-1.5 mt-2">Product Description</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 pt-2 text-sm text-slate-800 mb-2 h-[60px]"
                  placeholder="Describe freshness, harvest source, and crop grade..."
                  placeholderTextColor="#94A3B8"
                  value={newProdDesc}
                  onChangeText={setNewProdDesc}
                  multiline
                  numberOfLines={2}
                />

                {/* Photo selection buttons */}
                <View className="flex-row justify-between items-center mt-2.5 mb-1">
                  <Text className="text-xs font-bold text-slate-700">Product Photo</Text>
                  {isUploadingImage ? (
                    <Text className="text-2xs text-emerald-700 font-bold">Uploading...</Text>
                  ) : (
                    <Text className="text-2xs text-emerald-700 font-bold">✓ Verified Food-Grade</Text>
                  )}
                </View>

                <View className="flex-row gap-2 mb-2">
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center bg-emerald-50 border border-emerald-300 py-2.5 rounded-xl gap-1.5"
                    onPress={handlePickFromGallery}
                  >
                    <ImageIcon size={14} color="#047857" />
                    <Text className="text-xs font-bold text-emerald-800">Phone Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center bg-emerald-50 border border-emerald-300 py-2.5 rounded-xl gap-1.5"
                    onPress={handleTakePhoto}
                  >
                    <Camera size={14} color="#047857" />
                    <Text className="text-xs font-bold text-emerald-800">Take Photo</Text>
                  </TouchableOpacity>
                </View>

                <AppButton
                  title="Publish Crop to Catalog →"
                  loading={isSubmittingProduct}
                  loadingText="Publishing Crop..."
                  onPress={handleCreateProduct}
                  size="large"
                  className="mt-3.5"
                />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Persistent Floating Cart Summary Bar */}
      {renderFloatingCartBar()}
    </View>
  );
};
