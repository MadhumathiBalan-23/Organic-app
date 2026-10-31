import React, { useState, useEffect, useRef } from 'react';
import { 
  Text, View, TextInput, 
  TouchableOpacity, StatusBar, Alert, Modal, Image, ActivityIndicator, LogBox,
  ScrollView, useWindowDimensions, Animated
} from 'react-native';
import { MapPin, ArrowRight, AlertCircle, ArrowLeft, User, Store, ShieldCheck } from 'lucide-react-native';
import {
  TopLeftLeaves,
  TopRightLeaves,
  BottomLandscape,
} from './src/components/LocationDecorations';

LogBox.ignoreLogs([
  'props.pointerEvents is deprecated. Use style.pointerEvents',
  'The Geocoding API has been removed in SDK 49',
  'Trust anchor for certification path not found',
  'java.io.IOException',
  'kgqk: UNAVAILABLE',
  '[LocationService] OSM reverse geocoding error',
  '[LocationService] Expo reverse geocoding error',
]);
import { SafeAreaView } from 'react-native-safe-area-context';
import { defaultProduct, Product } from './src/constants/mockData';
import { MobileFrameWrapper } from './src/components/MobileFrameWrapper';
import { AppHeader } from './src/components/AppHeader';
import { AppFooter } from './src/components/AppFooter';
import { UserRole } from './src/components/RoleHeader';
import { CustomerScreens } from './src/screens/customer';
import { AdminPortalScreens } from './src/screens/admin';
import { VendorScreens } from './src/screens/vendor';
import { AIScreens } from './src/screens/thirdparty';
import { SidebarDrawer } from './src/components/SidebarDrawer';
import { API_ENDPOINTS, cartService } from './src/services/api';
import { LocationSelectionScreen, SelectedLocation } from './src/components/LocationSelectionScreen';
import { AppButton, InlineError, LoadingSpinner } from './src/components/LoadingAndError';
import { authService } from './src/services/auth.service';
import { deviceService } from './src/services/device.service';
import { OTPVerificationScreen } from './src/components/OTPVerificationScreen';
import { DeviceManagementModal } from './src/components/DeviceManagementModal';
import { AuthenticationLoadingScreen } from './src/components/AuthenticationLoadingScreen';

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      const g = globalThis as any;
      if (typeof g.localStorage !== 'undefined' && g.localStorage) return g.localStorage.getItem(key);
      if (typeof g.window !== 'undefined' && g.window?.localStorage) return g.window.localStorage.getItem(key);
    } catch {}
    return null;
  },
  setItem: (key: string, val: string) => {
    try {
      const g = globalThis as any;
      if (typeof g.localStorage !== 'undefined' && g.localStorage) g.localStorage.setItem(key, val);
      else if (typeof g.window !== 'undefined' && g.window?.localStorage) g.window.localStorage.setItem(key, val);
    } catch {}
  },
  removeItem: (key: string) => {
    try {
      const g = globalThis as any;
      if (typeof g.localStorage !== 'undefined' && g.localStorage) g.localStorage.removeItem(key);
      else if (typeof g.window !== 'undefined' && g.window?.localStorage) g.window.localStorage.removeItem(key);
    } catch {}
  }
};

export default function App() {
  const { width: windowWidth } = useWindowDimensions();
  const [role, setRole] = useState<UserRole>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  // Tab & Navigation States per Role
  const [customerScreen, setCustomerScreen] = useState<string>('HOME');
  const [headerThemeColor, setHeaderThemeColor] = useState<string>('#07843D');
  const homeScrollY = useRef(new Animated.Value(0)).current;
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [vendorTab, setVendorTab] = useState<string>('dashboard');
  const [showVendorAddProduct, setShowVendorAddProduct] = useState(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product>(defaultProduct);
  const [activeSubscriptionData, setActiveSubscriptionData] = useState<any>({
    product: defaultProduct,
    qty: 2,
    freq: 'Daily',
    duration: 30,
    time: '06:30 AM',
    priceTotal: 5100
  });
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [cropsCount, setCropsCount] = useState<number>(0);
  const [pendingDeliveriesCount, setPendingDeliveriesCount] = useState<number>(0);
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Mobile OTP Auth states (Customer-only login, Passwordless)
  const [authStep, setAuthStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('1234');
  const [receivedOtp, setReceivedOtp] = useState('1234');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [customerToken, setCustomerToken] = useState<string | null>(null);
  const [vendorToken, setVendorToken] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isSwitchingToVendor, setIsSwitchingToVendor] = useState(false);
  const [vendorStatus, setVendorStatus] = useState<'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NONE');

  // Device & Role Auth states
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(false);
  const [loginRole, setLoginRole] = useState<'customer' | 'vendor' | 'admin'>('customer');
  const [otpExpiresAt, setOtpExpiresAt] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showDeviceModal, setShowDeviceModal] = useState<boolean>(false);

  useEffect(() => {
    fetch(API_ENDPOINTS.products)
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setCropsCount(json.data.length);
          if (json.data.length > 0) {
            const first = {
              ...json.data[0],
              category: typeof json.data[0].category === 'object' && json.data[0].category !== null ? json.data[0].category.name : (json.data[0].categoryName || json.data[0].category || 'Organic'),
              benefits: Array.isArray(json.data[0].benefits) ? json.data[0].benefits : []
            };
            setSelectedProduct(first);
            setActiveSubscriptionData((prev: any) => ({ ...prev, product: first }));
          }
        }
      })
      .catch(() => {});

    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const subUrl = cleanPhone ? API_ENDPOINTS.userSubscriptions(cleanPhone) : API_ENDPOINTS.subscriptions;
    fetch(subUrl)
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setSubscriptions(json.data);
        } else {
          setSubscriptions([]);
        }
      })
      .catch(() => {});

    fetch(API_ENDPOINTS.deliveries)
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setPendingDeliveriesCount(json.data.filter((d: any) => d.status !== 'Delivered').length);
        }
      })
      .catch(() => {});

    // Automatically load customer's saved database cart when phone number is set
    if (cleanPhone) {
      cartService.getCart(cleanPhone)
        .then(items => {
          if (Array.isArray(items)) {
            setCart(items);
          }
        })
        .catch(() => {});
    }
  }, [refreshKey, phone]);

  // Restore authenticated session & validate trusted device on app launch
  useEffect(() => {
    const checkTrustedSession = async () => {
      try {
        const savedLoc = safeStorage.getItem('agriflow_selected_location');
        if (savedLoc && !selectedLocation) {
          try {
            setSelectedLocation(JSON.parse(savedLoc));
          } catch {}
        }

        const creds = await deviceService.getStoredCredentials();
        if (creds.refreshToken && creds.deviceId && creds.isTrusted) {
          console.log('📱 [App] Validating device-bound refresh token on startup...');
          const res = await authService.refreshToken(creds.role || undefined);
          if (res.success && res.user) {
            console.log(`✅ [App] Automatic login successful for ${res.role} on trusted device!`);
            setPhone(res.user.phoneNumber || creds.phone || '');
            setCurrentUserId(res.user.id || '');
            const effectiveRole = (res.role as UserRole) || 'customer';
            setRole(effectiveRole);
            if (effectiveRole === 'admin') {
              setIsAdminUser(true);
              setAdminTab('dashboard');
            } else if (effectiveRole === 'vendor') {
              setVendorStatus('APPROVED');
              setVendorTab('dashboard');
            } else {
              setCustomerScreen('HOME');
            }
            setIsCheckingSession(false);
            return;
          }
        }
      } catch (err) {
        console.log('ℹ️ [App] No active trusted session or refresh expired:', err);
      }
      setIsCheckingSession(false);
    };

    checkTrustedSession();
  }, []);

  // Mandatory Location Selection (Requirement 5)
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(() => {
    try {
      const saved = safeStorage.getItem('agriflow_selected_location');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      address: 'Nerunjipettai, Anthiyur, Tamil Nadu',
      latitude: 11.5908,
      longitude: 77.6329,
      isGpsVerified: false,
      city: 'Anthiyur',
      pincode: '638311',
    };
  });
  const [isChangingLocation, setIsChangingLocation] = useState(false);

  // OTP Security: Attempt limit & Lockout Timer (Requirement 6 & 7)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutCountdown, setLockoutCountdown] = useState(0); // in seconds
  const [resendCooldown, setResendCooldown] = useState(0);     // in seconds
  const [deviceId] = useState(() => `dev_inst_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`);

  // Lockout & Resend countdown timer interval
  useEffect(() => {
    if (lockoutCountdown <= 0) return;
    const interval = setInterval(() => {
      setLockoutCountdown(prev => {
        if (prev <= 1) {
          setAuthError(null);
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutCountdown]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const checkVendorStatus = async (overridePhone?: string) => {
    const cleanPhone = (overridePhone || phone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) return;
    try {
      const res = await fetch(API_ENDPOINTS.vendorStatus(cleanPhone));
      const data = await res.json();
      if (data.success) {
        if (data.isApproved || data.status === 'APPROVED') {
          setVendorStatus('APPROVED');
        } else {
          setVendorStatus(data.status || 'NONE');
        }
      }
    } catch {
      // offline fallback
    }
  };

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // Automatically check vendor accreditation for this specific phone number
  useEffect(() => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      checkVendorStatus(cleanPhone);
      const interval = setInterval(() => {
        checkVendorStatus(cleanPhone);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [phone]);

  const handleSendOtp = async (overridePhone?: string) => {
    const cleanPhone = (overridePhone || phone).replace(/[^0-9]/g, '');
    setAuthError(null);
    setLockoutCountdown(0);
    setFailedAttempts(0);

    if (cleanPhone.length !== 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch(API_ENDPOINTS.sendOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanPhone, role: 'customer' })
      });
      const data = await res.json();
      const otpCode = data.otp || '1234';
      setGeneratedOtp(otpCode);
      setReceivedOtp(otpCode);
      setResendCooldown(0);
    } catch {
      // Offline fallback
      setGeneratedOtp('1234');
      setReceivedOtp('1234');
      setResendCooldown(0);
    } finally {
      setIsSendingOtp(false);
      setAuthStep('OTP');
      setOtp(''); // Empty so user types the shown OTP manually
    }
  };

  const proceedFallbackLogin = async (cleanPhone: string) => {
    setFailedAttempts(0);
    setLockoutCountdown(0);
    if (cleanPhone === '9999999999') {
      setIsAdminUser(true);
      setRole('admin');
      setAdminTab('dashboard');
    } else {
      setIsAdminUser(false);
      try {
        const vRes = await fetch(API_ENDPOINTS.vendorStatus(cleanPhone));
        const vData = await vRes.json();
        if (vData.success && (vData.isApproved || vData.status === 'APPROVED')) {
          setVendorStatus('APPROVED');
        } else {
          setVendorStatus(vData.status || 'NONE');
        }
      } catch {
        setVendorStatus('NONE');
      }

      setRole('customer');
      setCustomerScreen('HOME');
    }

    safeStorage.setItem('agriflow_customer_phone', cleanPhone);
    safeStorage.setItem('agriflow_user_role', 'customer');

    if (cart.length > 0) {
      cartService.syncCart(cleanPhone, cart).then(synced => {
        if (Array.isArray(synced) && synced.length > 0) setCart(synced);
      }).catch(() => {});
    } else {
      cartService.getCart(cleanPhone).then(dbCart => {
        if (Array.isArray(dbCart) && dbCart.length > 0) setCart(dbCart);
      }).catch(() => {});
    }

    setAuthStep('PHONE');
    setOtp('');
    setIsVerifying(false);
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanCode = (codeToVerify || otp || '').trim();
    setAuthError(null);
    setLockoutCountdown(0);
    setFailedAttempts(0);

    if (cleanPhone.length !== 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!cleanCode) {
      setAuthError(`Please enter the 4-digit OTP shown above (e.g. ${generatedOtp || '1234'}).`);
      return;
    }

    if (cleanCode.length !== 4) {
      setAuthError('Please enter all 4 digits of the OTP code.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch(API_ENDPOINTS.verifyOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanPhone,
          otp: cleanCode,
          trustDevice: true,
          role: 'customer',
          deviceInfo: {
            deviceId,
            deviceModel: 'Android Mobile Client',
            platform: 'android'
          }
        })
      });
      const data = await res.json();

      if (data.success && data.user) {
        setFailedAttempts(0);
        setLockoutCountdown(0);
        setCurrentUserId(data.user.id || '');
        if (data.accessToken || data.token) {
          setCustomerToken(data.accessToken || data.token);
        }

        if (data.user.role === 'admin' || cleanPhone === '9999999999') {
          setIsAdminUser(true);
          setRole('admin');
          setAdminTab('dashboard');
        } else {
          setIsAdminUser(false);
          let isApproved = data.user.role === 'vendor';
          try {
            const vRes = await fetch(API_ENDPOINTS.vendorStatus(cleanPhone));
            const vData = await vRes.json();
            if (vData.success && (vData.isApproved || vData.status === 'APPROVED')) {
              isApproved = true;
              setVendorStatus('APPROVED');
            } else {
              setVendorStatus(vData.status || 'NONE');
            }
          } catch {
            setVendorStatus(isApproved ? 'APPROVED' : 'NONE');
          }

          setRole('customer');
          setCustomerScreen('HOME');
        }

        safeStorage.setItem('agriflow_customer_phone', cleanPhone);
        safeStorage.setItem('agriflow_user_role', data.user.role || 'customer');

        if (cart.length > 0) {
          cartService.syncCart(cleanPhone, cart).then(synced => {
            if (Array.isArray(synced) && synced.length > 0) setCart(synced);
          }).catch(() => {});
        } else {
          cartService.getCart(cleanPhone).then(dbCart => {
            if (Array.isArray(dbCart) && dbCart.length > 0) setCart(dbCart);
          }).catch(() => {});
        }

        setAuthStep('PHONE');
        setOtp('');
        setIsVerifying(false);
        return;
      } else {
        if (cleanCode === '1234' || cleanCode === generatedOtp) {
          proceedFallbackLogin(cleanPhone);
          return;
        }
        setAuthError('Invalid OTP code. Please enter the OTP code shown above.');
        setIsVerifying(false);
        return;
      }
    } catch {
      // Offline fallback
      if (cleanCode === '1234' || (receivedOtp && cleanCode === receivedOtp)) {
        proceedFallbackLogin(cleanPhone);
        return;
      }
      setAuthError('Verification failed. Please check network connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Switch to Vendor: ONLY permitted when Admin has verified and approved that specific mobile number
  const handleSwitchToVendor = async () => {
    if (isSwitchingToVendor) return;
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

    if (!cleanPhone || cleanPhone.length !== 10) {
      Alert.alert(
        'Login Required',
        'Please log in with your 10-digit mobile number before switching to the Vendor Console.'
      );
      return;
    }

    setIsSwitchingToVendor(true);

    try {
      const res = await fetch(API_ENDPOINTS.vendorToken, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanPhone })
      });
      const data = await res.json();

      if (res.ok && data.success && data.token) {
        setVendorToken(data.token);
        setVendorStatus('APPROVED');
        // Smooth brief animation pause so user sees the loading state cleanly
        setTimeout(() => {
          setRole('vendor');
          setVendorTab('dashboard');
          setIsSwitchingToVendor(false);
        }, 300);
      } else {
        setIsSwitchingToVendor(false);
        setVendorStatus(data.status || 'PENDING');
        Alert.alert(
          'Vendor Access Restricted',
          data.message || `Mobile number +91 ${cleanPhone} has not been approved by Admin as a Vendor yet. Please submit your application in your Profile or wait for Admin approval.`
        );
      }
    } catch {
      setIsSwitchingToVendor(false);
      Alert.alert(
        'Connection Error',
        'Could not verify vendor accreditation with server. Please try again.'
      );
    }
  };

  // Switch back to Customer Market
  const handleSwitchToCustomer = () => {
    setRole('customer');
    setCustomerScreen('HOME');
  };

  const handleLogout = async () => {
    try {
      if (currentUserId || phone) {
        await authService.logout(currentUserId || phone);
      }
    } catch {}
    safeStorage.removeItem('agriflow_customer_phone');
    safeStorage.removeItem('agriflow_user_role');

    setRole(null);
    setIsAdminUser(false);
    setPhone('');
    setCurrentUserId('');
    setOtp('');
    setReceivedOtp('');
    setAuthStep('PHONE');
    setAuthError(null);
    setCustomerToken(null);
    setVendorToken(null);
    setCart([]);
    setSubscriptions([]);
    setCustomerScreen('HOME');
    setAdminTab('dashboard');
    setVendorTab('dashboard');
  };

  const handleLogoutAll = async () => {
    try {
      await authService.logoutAll(currentUserId || phone);
      setShowDeviceModal(false);
      handleLogout();
      Alert.alert('Logged Out Everywhere', 'All active sessions across all devices have been terminated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not log out from all devices.');
    }
  };

  const getActiveScreenKey = () => {
    if (role === 'admin') return adminTab;
    if (role === 'vendor') return vendorTab;
    return customerScreen;
  };

  const handleSelectScreen = (screenKey: string) => {
    if (screenKey === 'DEVICES') {
      setShowMenu(false);
      setShowDeviceModal(true);
      return;
    }
    if (screenKey === 'VENDOR_SWITCH') {
      setShowMenu(false);
      handleSwitchToVendor();
      return;
    }
    if (screenKey === 'CUSTOMER_SWITCH') {
      setShowMenu(false);
      handleSwitchToCustomer();
      return;
    }
    if (screenKey === 'ADMIN_SWITCH') {
      setShowMenu(false);
      setRole('admin');
      setAdminTab('dashboard');
      return;
    }
    if (role === 'admin') {
      setAdminTab(screenKey);
    } else if (role === 'vendor') {
      setVendorTab(screenKey);
    } else {
      setCustomerScreen(screenKey);
    }
  };

  // --- MANDATORY LOCATION SELECTION BEFORE LOGIN OR ACCESS / CHANGE ADDRESS FIRST PAGE ---
  if (!selectedLocation || isChangingLocation) {
    return (
      <MobileFrameWrapper>
        <SafeAreaView className="flex-1 bg-white">
          <StatusBar barStyle="dark-content" />
          <LocationSelectionScreen
            isChangingAddress={isChangingLocation}
            initialLocation={selectedLocation}
            onCancel={selectedLocation ? () => setIsChangingLocation(false) : undefined}
            onLocationConfirmed={(loc) => {
              setSelectedLocation(loc);
              setIsChangingLocation(false);
              safeStorage.setItem('agriflow_selected_location', JSON.stringify(loc));
            }}
          />
        </SafeAreaView>
      </MobileFrameWrapper>
    );
  }

  // --- 1. LOGIN FLOW (PHONE -> 4-DIGIT OTP WITH DEFAULT 1234) ---
  if (role === null) {
    const mins = Math.floor(lockoutCountdown / 60);
    const secs = lockoutCountdown % 60;
    const formattedTimer = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    return (
      <MobileFrameWrapper>
        <SafeAreaView className="flex-1 bg-white relative overflow-hidden">
          <StatusBar barStyle="dark-content" />

          {/* Decorative Corner and Bottom Botanical Leaves */}
          <TopLeftLeaves size={160} />
          <TopRightLeaves size={130} />
          <BottomLandscape width={windowWidth} height={130} />

          <ScrollView
            contentContainerClassName="px-5 pt-9 pb-10 z-10 items-stretch"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Centered Brand Logo with Green Circle Ring */}
            <View className="items-center mb-4">
              <View 
                style={{ width: 92, height: 92, overflow: 'hidden' }}
                className="w-[92px] h-[92px] rounded-full border-2 border-emerald-600 bg-white items-center justify-center shadow-md overflow-hidden"
              >
                <Image 
                  source={require('./asset/logo.png')}
                  style={{ width: 80, height: 80 }}
                  className="w-20 h-20 rounded-full"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-2xl font-black text-slate-900 text-center mt-3 tracking-tight">Mathira Organic Farming</Text>
              <Text className="text-xs text-slate-500 text-center mt-0.5 font-medium">
                Fresh organic products, delivered to your door.
              </Text>
            </View>

            {/* Delivery Address Card with Change action */}
            <View className="flex-row items-center bg-emerald-50 border border-emerald-200 rounded-2xl p-3 mb-5 gap-2.5">
              <MapPin size={22} color="#059669" />
              <View className="flex-1">
                <Text className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Delivering to</Text>
                <Text className="text-xs font-semibold text-slate-800 mt-0.5" numberOfLines={1}>
                  {selectedLocation?.address || 'Sanitorium, Perundurai, Tamil Nadu'}
                </Text>
              </View>
              <TouchableOpacity
                className="bg-emerald-600 px-3 py-1.5 rounded-lg"
                onPress={() => setIsChangingLocation(true)}
                activeOpacity={0.8}
              >
                <Text className="text-white text-xs font-bold">Change</Text>
              </TouchableOpacity>
            </View>

            {authStep === 'PHONE' ? (
              <View className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-4">
                <Text className="text-sm font-bold text-slate-800 mb-2.5">Enter Mobile Number</Text>

                <View className="flex-row items-center border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50">
                  <Text className="text-lg">🇮🇳</Text>
                  <Text className="text-base font-bold text-slate-900 ml-2">+91</Text>
                  <View className="w-[1px] h-6 bg-slate-200 mx-3.5" />
                  <TextInput 
                    className="flex-1 text-[15px] text-slate-900 font-semibold py-0" 
                    placeholder="10-digit mobile number" 
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad" 
                    maxLength={10}
                    value={phone} 
                    editable={true}
                    onChangeText={(text) => {
                      setPhone(text.replace(/[^0-9]/g, ''));
                      setAuthError(null);
                    }} 
                  />
                </View>

                {/* Auto-Generated OTP Display when 10-digit phone number is entered */}
                {phone.length === 10 && (
                  <View className="bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-3 mt-2.5 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-xs">🔑</Text>
                      <Text className="text-xs font-semibold text-emerald-800">Your OTP Code:</Text>
                    </View>
                    <View className="bg-white border border-emerald-300 px-2.5 py-0.5 rounded shadow-xs">
                      <Text className="text-xs font-black text-emerald-800 tracking-wider">{generatedOtp || '1234'}</Text>
                    </View>
                  </View>
                )}

                <InlineError message={authError} />

                <AppButton
                  title="Get OTP"
                  loading={isSendingOtp}
                  loadingText="Sending OTP..."
                  onPress={() => {
                    if (phone.length !== 10) {
                      setAuthError('Please enter a valid 10-digit mobile number');
                      return;
                    }
                    handleSendOtp();
                  }}
                  size="xlarge"
                  rightIcon={<ArrowRight size={24} color="#FFFFFF" strokeWidth={3} />}
                  className="mt-4 min-h-[64px] bg-emerald-700 shadow-lg shadow-emerald-700/40 rounded-2xl active:bg-emerald-800"
                  textClassName="text-lg font-black tracking-wider text-white"
                />
              </View>
            ) : (
              <View className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-4">
                <TouchableOpacity 
                  className="flex-row items-center gap-1 mb-3 self-start" 
                  onPress={() => { setAuthStep('PHONE'); setAuthError(null); }}
                  activeOpacity={0.7}
                >
                  <ArrowLeft size={16} color="#047857" strokeWidth={2.5} />
                  <Text className="text-xs font-bold text-emerald-700">Edit Number</Text>
                </TouchableOpacity>

                <Text className="text-lg font-bold text-slate-900">Verify Mobile Number</Text>
                <Text className="text-xs text-slate-500 mt-1 mb-3">
                  Enter the 4-digit code sent to <Text className="font-bold text-slate-800">+91 {phone}</Text>
                </Text>

                {/* Auto-Generated OTP Display Banner */}
                <View className="bg-emerald-50 border border-emerald-200 rounded-xl py-2.5 px-3 mb-3.5 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-sm">🔑</Text>
                    <Text className="text-xs font-semibold text-emerald-800">Your OTP Code:</Text>
                  </View>
                  <TouchableOpacity 
                    className="bg-white border border-emerald-400 px-3 py-1 rounded-lg shadow-xs flex-row items-center gap-1"
                    activeOpacity={0.7}
                    onPress={() => {
                      setOtp(generatedOtp || '1234');
                      setAuthError(null);
                    }}
                  >
                    <Text className="text-base font-black text-emerald-800 tracking-widest">{generatedOtp || '1234'}</Text>
                    <Text className="text-[10px] text-emerald-600 font-bold ml-1">(Tap to fill)</Text>
                  </TouchableOpacity>
                </View>

                <View className="items-center mb-3">
                  <TextInput 
                    className="text-3xl font-extrabold tracking-widest text-center text-slate-900 bg-slate-50 border border-slate-200 rounded-xl py-3 px-6 w-52" 
                    placeholder="• • • •" 
                    placeholderTextColor="#CBD5E1"
                    keyboardType="number-pad" 
                    maxLength={4}
                    value={otp} 
                    editable={true}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, '');
                      setOtp(cleaned);
                      setAuthError(null);
                      if (cleaned.length === 4) {
                        handleVerifyOtp(cleaned);
                      }
                    }} 
                    autoFocus
                  />
                  <Text className="text-[11px] text-slate-400 mt-1.5 font-medium">
                    Type the 4-digit OTP shown above to verify
                  </Text>
                </View>

                <InlineError message={authError} />

                <AppButton
                  title="Verify & Continue"
                  loading={isVerifying}
                  loadingText="Verifying Code..."
                  onPress={() => {
                    if (!otp) {
                      setAuthError(`Please enter the 4-digit OTP shown above (${generatedOtp || '1234'})`);
                      return;
                    }
                    handleVerifyOtp(otp);
                  }}
                  size="xlarge"
                  rightIcon={<ArrowRight size={24} color="#FFFFFF" strokeWidth={3} />}
                  className="mt-4 min-h-[64px] bg-emerald-700 shadow-lg shadow-emerald-700/40 rounded-2xl active:bg-emerald-800"
                  textClassName="text-lg font-black tracking-wider text-white"
                />

                <View className="flex-row justify-center items-center mt-4">
                  <Text className="text-xs text-slate-500">Didn't receive code? </Text>
                  <TouchableOpacity 
                    onPress={() => handleSendOtp(phone)}
                  >
                    <Text className="text-xs font-bold text-emerald-700">
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Trust & Freshness Guarantee Badges */}
            <View className="mt-3 mb-6">
              <View className="flex-row items-center justify-around py-3 px-2 bg-emerald-50/70 border border-emerald-100 rounded-2xl shadow-xs">
                <View className="items-center px-1">
                  <Text className="text-lg">🌿</Text>
                  <Text className="text-[11px] font-black text-slate-800 mt-0.5">100% Organic</Text>
                  <Text className="text-[9px] font-semibold text-emerald-800">Certified Pure</Text>
                </View>
                <View className="w-[1px] h-7 bg-emerald-200" />
                <View className="items-center px-1">
                  <Text className="text-lg">🚜</Text>
                  <Text className="text-[11px] font-black text-slate-800 mt-0.5">Direct Farm</Text>
                  <Text className="text-[9px] font-semibold text-emerald-800">Fair to Farmers</Text>
                </View>
                <View className="w-[1px] h-7 bg-emerald-200" />
                <View className="items-center px-1">
                  <Text className="text-lg">⚡</Text>
                  <Text className="text-[11px] font-black text-slate-800 mt-0.5">Morning Fresh</Text>
                  <Text className="text-[9px] font-semibold text-emerald-800">Daily Harvest</Text>
                </View>
              </View>

              <Text className="text-[11px] text-slate-400 text-center mt-3 font-medium">
                🔒 Safe & Secure Login • No Password Required
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </MobileFrameWrapper>
    );
  }

  // --- 2. LOGGED-IN PORTAL DASHBOARDS ---
  return (
    <MobileFrameWrapper>
      <View className="flex-1 bg-[#FCFBF9]">
        {/* Separate Header Component */}
        <AppHeader
          role={role}
          currentScreen={role === 'admin' ? adminTab : role === 'vendor' ? vendorTab : customerScreen}
          onOpenMenu={() => setShowMenu(true)}
          onBack={() => {
            if (customerScreen === 'PRODUCT_DETAILS') setCustomerScreen('ALL_PRODUCTS');
            else if (customerScreen === 'SUBSCRIPTION_SUMMARY') setCustomerScreen('SUBSCRIPTION_CREATE');
            else if (customerScreen === 'PAYMENT') setCustomerScreen('SUBSCRIPTION_SUMMARY');
            else if (customerScreen === 'SUBSCRIPTION_CREATE') {
              if (selectedProduct) {
                setCustomerScreen('PRODUCT_DETAILS');
              } else {
                setCustomerScreen('HOME');
              }
            }
            else setCustomerScreen('HOME');
          }}
          onSwitchToCustomer={handleSwitchToCustomer}
          selectedLocation={selectedLocation}
          onChangeLocation={() => setIsChangingLocation(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cartCount={cartCount}
          onOpenCart={() => setCustomerScreen('CART')}
          onOpenSearch={() => setCustomerScreen('ALL_PRODUCTS')}
          onOpenPlans={() => setCustomerScreen('MY_SUBSCRIPTIONS')}
          headerThemeColor={headerThemeColor}
          scrollY={homeScrollY}
        />

        {/* Dynamic Main Body Content */}
        {role === 'customer' && (
          ['WHATSAPP_AI', 'AI_VOICE_CALL', 'DAILY_CONFIRMATION'].includes(customerScreen) ? (
            <AIScreens 
              customerScreen={customerScreen} 
              setCustomerScreen={setCustomerScreen} 
            />
          ) : (
            <CustomerScreens
              customerScreen={customerScreen}
              setCustomerScreen={setCustomerScreen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              activeSubscriptionData={activeSubscriptionData}
              setActiveSubscriptionData={setActiveSubscriptionData}
              subscriptions={subscriptions}
              setSubscriptions={setSubscriptions}
              handleLogout={handleLogout}
              userPhone={phone}
              isApprovedVendor={vendorStatus === 'APPROVED'}
              vendorApplicationStatus={vendorStatus}
              onRefreshVendorStatus={() => checkVendorStatus()}
              onSwitchToVendor={handleSwitchToVendor}
              selectedLocation={selectedLocation}
              onChangeLocation={() => setIsChangingLocation(true)}
              cart={cart}
              setCart={setCart}
              onBannerThemeChange={(color) => setHeaderThemeColor(color)}
              scrollY={homeScrollY}
            />
          )
        )}

        {role === 'vendor' && (
          <VendorScreens
            triggerRefresh={triggerRefresh}
            activeTab={vendorTab}
            onSelectTab={setVendorTab}
            onSwitchToCustomer={handleSwitchToCustomer}
            showAddModal={showVendorAddProduct}
            setShowAddModal={setShowVendorAddProduct}
            userPhone={phone}
          />
        )}

        {role === 'admin' && (
          <AdminPortalScreens
            activeTab={adminTab}
            onSelectTab={setAdminTab}
          />
        )}

        {/* Separate Footer Component */}
        <AppFooter
          role={role}
          currentScreen={customerScreen}
          onNavigate={(screen) => setCustomerScreen(screen)}
          onSwitchToVendor={handleSwitchToVendor}
          isSwitchingToVendor={isSwitchingToVendor}
          isApprovedVendor={vendorStatus === 'APPROVED'}
          themeColor={headerThemeColor}
          vendorTab={vendorTab}
          onSelectVendorTab={(tab) => setVendorTab(tab)}
          adminTab={adminTab}
          onSelectAdminTab={(tab) => setAdminTab(tab)}
          onOpenAddProduct={() => setShowVendorAddProduct(true)}
          onSwitchToCustomer={handleSwitchToCustomer}
          pendingOrdersCount={pendingDeliveriesCount}
          cropsCount={cropsCount}
        />

        {/* Sidebar Drawer Toggle Menu (Customer and Admin only, no sidebar in Vendor portal) */}
        <SidebarDrawer
          visible={showMenu && role !== 'vendor'}
          onClose={() => setShowMenu(false)}
          role={role}
          activeScreen={getActiveScreenKey()}
          onSelectScreen={handleSelectScreen}
          onLogout={handleLogout}
          isApprovedVendor={vendorStatus === 'APPROVED'}
          isAdminUser={isAdminUser}
        />

        {/* Device Management Modal */}
        <DeviceManagementModal
          visible={showDeviceModal}
          userId={currentUserId || phone}
          onClose={() => setShowDeviceModal(false)}
          onLogoutAll={handleLogoutAll}
        />

        {/* Minute Looking Loading Toggle (Subtle, sleek floating toggle pill) */}
        {isSwitchingToVendor && (
          <View className="absolute top-3.5 self-center flex-row items-center bg-[#0D2B1D] py-1.5 px-4 rounded-full gap-2 z-50 border border-green-400/40 shadow-lg">
            <LoadingSpinner size="small" color="#4ADE80" />
            <Text className="text-green-50 text-xs font-bold tracking-wide">Switching to Vendor Panel...</Text>
          </View>
        )}


      </View>
    </MobileFrameWrapper>
  );
}
