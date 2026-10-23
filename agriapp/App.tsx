import React, { useState } from 'react';
import { 
  SafeAreaView, StyleSheet, Text, View, TextInput, 
  TouchableOpacity, StatusBar, Alert, Modal, Image, ActivityIndicator
} from 'react-native';
import { MockProducts, MockDeliveries, Product } from './src/constants/mockData';
import { MobileFrameWrapper } from './src/components/MobileFrameWrapper';
import { RoleHeader, UserRole } from './src/components/RoleHeader';
import { BottomNavBar } from './src/components/BottomNavBar';
import { VendorBottomNavBar } from './src/components/VendorBottomNavBar';
import { CustomerScreens } from './src/screens/CustomerScreens';
import { AIScreens } from './src/screens/AIScreens';
import { VendorAndAdminScreens } from './src/screens/VendorAndAdminScreens';
import { SidebarDrawer } from './src/components/SidebarDrawer';

export default function App() {
  const [role, setRole] = useState<UserRole>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  // Tab & Navigation States per Role
  const [customerScreen, setCustomerScreen] = useState<string>('HOME');
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [vendorTab, setVendorTab] = useState<string>('dashboard');
  const [showVendorAddProduct, setShowVendorAddProduct] = useState(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product>(MockProducts[0]);
  const [activeSubscriptionData, setActiveSubscriptionData] = useState<any>({
    product: MockProducts[0],
    qty: 2,
    freq: 'Daily',
    duration: 30,
    time: '06:30 AM',
    priceTotal: 5100
  });
  const [subscriptions, setSubscriptions] = useState<any[]>([
    {
      id: 'sub_101',
      product: MockProducts[0],
      qty: 2,
      freq: 'Daily',
      duration: 30,
      time: '06:30 AM',
      priceTotal: 5100,
      status: 'Active',
      startDate: '2026-08-28'
    }
  ]);

  // Mobile OTP Auth states (Customer-only login, Passwordless)
  const [authStep, setAuthStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [customerToken, setCustomerToken] = useState<string | null>(null);
  const [vendorToken, setVendorToken] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isSwitchingToVendor, setIsSwitchingToVendor] = useState(false);
  const [vendorStatus, setVendorStatus] = useState<'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NONE');

  const checkVendorStatus = async (overridePhone?: string) => {
    const cleanPhone = (overridePhone || phone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) return;
    try {
      const res = await fetch(`http://localhost:5050/api/vendor-requests/status/${cleanPhone}`);
      const data = await res.json();
      if (data.success && data.status) {
        setVendorStatus(data.status);
      }
    } catch {
      // offline fallback
    }
  };

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleSendOtp = async (overridePhone?: string) => {
    const cleanPhone = (overridePhone || phone).replace(/[^0-9]/g, '');
    setAuthError(null);

    if (cleanPhone.length !== 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch('http://localhost:5050/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanPhone })
      });
      const data = await res.json();
      if (data.success) {
        setReceivedOtp(data.otp || '1234');
      } else {
        setReceivedOtp('1234');
      }
    } catch {
      // Offline / network fallback with demo OTP
      setReceivedOtp('1234');
    } finally {
      setIsSendingOtp(false);
      setAuthStep('OTP');
      setOtp('');
    }
  };

  // Customer Login: ONLY generates and sets Customer Token, moves directly to Customer Page
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanCode = (codeToVerify || otp).trim();
    setAuthError(null);

    if (cleanCode.length !== 4) {
      setAuthError('Please enter the 4-digit OTP code.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('http://localhost:5050/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanPhone, otp: cleanCode })
      });
      const data = await res.json();
      if (data.success && data.user) {
        if (data.token) {
          setCustomerToken(data.token);
        }
        if (data.user.role === 'admin' || cleanPhone === '9999999999') {
          setIsAdminUser(true);
          setRole('admin');
          setAdminTab('dashboard');
        } else {
          setIsAdminUser(false);
          setRole('customer');
          setCustomerScreen('HOME');
          checkVendorStatus(cleanPhone);
        }
        setAuthStep('PHONE');
        setOtp('');
        return;
      }
    } catch {
      // Fallback
    }

    // Client-side fallback check
    if (cleanCode === '1234' || (receivedOtp && cleanCode === receivedOtp)) {
      if (cleanPhone === '9999999999') {
        setIsAdminUser(true);
        setCustomerToken('demo_admin_token_' + Date.now());
        setRole('admin');
        setAdminTab('dashboard');
      } else {
        setIsAdminUser(false);
        setCustomerToken('demo_customer_token_' + Date.now());
        setRole('customer');
        setCustomerScreen('HOME');
        checkVendorStatus(cleanPhone);
      }
      setAuthStep('PHONE');
      setOtp('');
    } else {
      setAuthError('Invalid OTP code. Enter 1234 or your received OTP.');
    }
    setIsVerifying(false);
  };

  // Switch to Vendor: ONLY permitted when Admin has verified and approved the vendor request
  const handleSwitchToVendor = async () => {
    if (isSwitchingToVendor) return;
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const validPhone = cleanPhone.length === 10 ? cleanPhone : '9876543210';

    setIsSwitchingToVendor(true);

    try {
      const res = await fetch('http://localhost:5050/api/auth/vendor-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: validPhone })
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
        }, 400);
      } else {
        setIsSwitchingToVendor(false);
        Alert.alert(
          'Vendor Verification Required',
          data.message || 'Please submit your Vendor Application in your Profile and wait for Admin approval.'
        );
      }
    } catch {
      setIsSwitchingToVendor(false);
    }
  };

  // Switch back to Customer Market
  const handleSwitchToCustomer = () => {
    setRole('customer');
    setCustomerScreen('HOME');
  };

  const handleLogout = () => {
    setRole(null);
    setIsAdminUser(false);
    setPhone('');
    setOtp('');
    setReceivedOtp('');
    setAuthStep('PHONE');
    setAuthError(null);
    setCustomerToken(null);
    setVendorToken(null);
    setCustomerScreen('HOME');
    setAdminTab('dashboard');
    setVendorTab('dashboard');
  };

  const getActiveScreenKey = () => {
    if (role === 'admin') return adminTab;
    if (role === 'vendor') return vendorTab;
    return customerScreen;
  };

  const handleSelectScreen = (screenKey: string) => {
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

  // --- 1. NEAT CUSTOMER LOGIN SCREEN (ONLY CUSTOMER TOKEN GENERATED) ---
  if (role === null) {
    return (
      <MobileFrameWrapper>
        <SafeAreaView style={styles.authContainer}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.loginCard}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('./asset/logo.jpeg')}
                style={styles.logoImg}
                resizeMode="contain"
              />
              <Text style={styles.brandTitle}>Mathira Organic Farming</Text>
              <Text style={styles.brandSubtitle}>
                Pure · Natural · Healthy organic food products direct from certified farms.
              </Text>
              
              <View style={styles.customerBadge}>
                <Text style={styles.customerBadgeText}>🛒 Customer Access</Text>
              </View>
            </View>

            {authStep === 'PHONE' ? (
              <View style={{ width: '100%' }}>
                <Text style={styles.inputSectionTitle}>Enter Mobile Number</Text>
                
                <View style={styles.phoneInputRow}>
                  <View style={styles.countryCodeBadge}>
                    <Text style={styles.flagEmoji}>🇮🇳</Text>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <TextInput 
                    style={styles.phoneInput} 
                    placeholder="10-digit number" 
                    keyboardType="phone-pad" 
                    maxLength={10}
                    value={phone} 
                    onChangeText={(text) => {
                      setPhone(text.replace(/[^0-9]/g, ''));
                      setAuthError(null);
                    }} 
                    placeholderTextColor="#94A3B8" 
                  />
                </View>

                {authError && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {authError}</Text>
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.primaryButton, phone.length !== 10 && styles.buttonDisabled]} 
                  onPress={() => handleSendOtp()}
                  disabled={isSendingOtp}
                  activeOpacity={0.8}
                >
                  {isSendingOtp ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Get OTP on SMS 📲</Text>
                  )}
                </TouchableOpacity>

                {/* Neat One-tap test shortcut */}
                <TouchableOpacity 
                  style={styles.neatTestPill}
                  onPress={() => { setPhone('9876543210'); setAuthError(null); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.neatTestText}>
                    👤 Customer Demo: <Text style={{ fontWeight: 'bold', color: '#15803D' }}>9876543210</Text>
                  </Text>
                </TouchableOpacity>

                {/* Super Admin Quick Access */}
                <TouchableOpacity 
                  style={[styles.neatTestPill, { marginTop: 6, borderColor: '#166534', backgroundColor: '#F0FDF4' }]}
                  onPress={() => { setPhone('9999999999'); setAuthError(null); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.neatTestText}>
                    ⚙️ Super Admin Access: <Text style={{ fontWeight: 'bold', color: '#166534' }}>9999999999</Text>
                  </Text>
                </TouchableOpacity>
                
                <Text style={styles.privacyNote}>
                  🔒 Passwordless Secure Login · Instant SMS OTP verification (Code: 1234).
                </Text>
              </View>
            ) : (
              <View style={{ width: '100%' }}>
                <View style={styles.otpHeaderRow}>
                  <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => { setAuthStep('PHONE'); setAuthError(null); }}
                  >
                    <Text style={styles.backButtonText}>← Edit Number</Text>
                  </TouchableOpacity>
                  <View style={styles.smsSentBadge}>
                    <Text style={styles.smsSentBadgeText}>✓ SMS Sent</Text>
                  </View>
                </View>

                <Text style={styles.otpSentToLabel}>
                  Code sent to <Text style={{ fontWeight: 'bold', color: '#15803D' }}>+91 {phone}</Text>
                </Text>

                {/* Instant Tap-to-AutoFill Banner */}
                <TouchableOpacity 
                  style={styles.autoFillBanner} 
                  onPress={() => {
                    const code = receivedOtp || '1234';
                    setOtp(code);
                    handleVerifyOtp(code);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.autoFillLeft}>
                    <Text style={styles.autoFillIcon}>⚡</Text>
                    <View>
                      <Text style={styles.autoFillTitle}>
                        Demo OTP: <Text style={styles.autoFillCode}>{receivedOtp || '1234'}</Text>
                      </Text>
                      <Text style={styles.autoFillSubtitle}>Tap to auto-fill & login instantly</Text>
                    </View>
                  </View>
                  <Text style={styles.autoFillArrow}>→</Text>
                </TouchableOpacity>

                <View style={styles.otpInputWrapper}>
                  <TextInput 
                    style={styles.otpInput} 
                    placeholder="• • • •" 
                    placeholderTextColor="#CBD5E1"
                    keyboardType="number-pad" 
                    maxLength={4}
                    value={otp} 
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
                </View>

                {authError && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {authError}</Text>
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.primaryButton, otp.length !== 4 && styles.buttonDisabled]} 
                  onPress={() => handleVerifyOtp()}
                  disabled={isVerifying}
                  activeOpacity={0.8}
                >
                  {isVerifying ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Verify & Start Shopping 🛒</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.resendRow}>
                  <Text style={styles.resendPrompt}>Didn't receive code? </Text>
                  <TouchableOpacity onPress={() => handleSendOtp(phone)}>
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
      </MobileFrameWrapper>
    );
  }

  // --- 2. LOGGED-IN PORTAL DASHBOARDS ---
  return (
    <MobileFrameWrapper>
      <View style={{ flex: 1, backgroundColor: '#FCFBF9' }}>
        {/* Dynamic Header */}
        <RoleHeader
          role={role}
          onSelectRole={(r) => {
            setRole(r);
            if (r === 'customer') setCustomerScreen('HOME');
          }}
          onOpenMenu={() => setShowMenu(true)}
          onOpenProfile={() => setCustomerScreen('PROFILE')}
          onSwitchToCustomer={handleSwitchToCustomer}
          customerScreen={customerScreen}
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
            />
          )
        )}

        {(role === 'vendor' || role === 'admin') && (
          <VendorAndAdminScreens
            role={role}
            triggerRefresh={triggerRefresh}
            activeTab={role === 'admin' ? adminTab : vendorTab}
            onSelectTab={(t) => role === 'admin' ? setAdminTab(t) : setVendorTab(t)}
            onSwitchToCustomer={handleSwitchToCustomer}
            showAddModal={showVendorAddProduct}
            setShowAddModal={setShowVendorAddProduct}
          />
        )}

        {/* Bottom Tab Bar for Customer view - ONLY shows Vendor button if approved by Admin */}
        {role === 'customer' && ['HOME', 'ALL_PRODUCTS', 'MY_SUBSCRIPTIONS', 'PROFILE'].includes(customerScreen) && (
          <BottomNavBar
            currentScreen={customerScreen}
            onNavigate={(screen) => setCustomerScreen(screen)}
            onSwitchToVendor={handleSwitchToVendor}
            isSwitchingToVendor={isSwitchingToVendor}
            isApprovedVendor={vendorStatus === 'APPROVED'}
          />
        )}

        {/* Dedicated Down Footer Menu for Vendor */}
        {role === 'vendor' && (
          <VendorBottomNavBar
            currentTab={vendorTab}
            onSelectTab={(tab) => setVendorTab(tab)}
            onOpenAddProduct={() => setShowVendorAddProduct(true)}
            onSwitchToCustomer={handleSwitchToCustomer}
            pendingOrdersCount={MockDeliveries.filter((d) => d.status !== 'Delivered').length}
            cropsCount={MockProducts.length}
          />
        )}

        {/* Sidebar Drawer Toggle Menu */}
        <SidebarDrawer
          visible={showMenu}
          onClose={() => setShowMenu(false)}
          role={role}
          activeScreen={getActiveScreenKey()}
          onSelectScreen={handleSelectScreen}
          onLogout={handleLogout}
          isApprovedVendor={vendorStatus === 'APPROVED'}
          isAdminUser={isAdminUser}
        />

        {/* Minute Looking Loading Toggle (Subtle, sleek floating toggle pill) */}
        {isSwitchingToVendor && (
          <View style={styles.minuteLoadingToggle}>
            <ActivityIndicator size="small" color="#4ADE80" />
            <Text style={styles.minuteLoadingToggleText}>Switching to Farmer Portal...</Text>
          </View>
        )}
      </View>
    </MobileFrameWrapper>
  );
}

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  welcomeContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  appHeaderSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  welcomeLogoCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#86EFAC',
  },
  welcomeAppTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#15803D',
    marginBottom: 4,
  },
  welcomeAppSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  welcomeGraphicsCard: {
    width: '100%',
    height: 170,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#86EFAC',
    padding: 16,
  },
  welcomeGraphicsTitle: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: 'bold',
    marginTop: 4,
  },
  welcomeGraphicsDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  welcomeButtonsContainer: {
    width: '100%',
    gap: 10,
    marginBottom: 10,
  },
  welcomeActBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeActBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginCard: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    alignItems: 'center',
  },
  backToWelcomeBtn: {
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  backToWelcomeText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: 'bold',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#15803D',
    marginTop: 4,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  customerBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  customerBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803D',
  },
  inputSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 48,
    marginRight: 8,
  },
  flagEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  phoneInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    fontWeight: '600',
  },
  neatTestPill: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    alignItems: 'center',
  },
  neatTestText: {
    fontSize: 12,
    color: '#64748B',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    width: '100%',
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  primaryButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#15803D',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  privacyNote: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 14,
    textAlign: 'center',
    lineHeight: 16,
  },
  otpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803D',
  },
  smsSentBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  smsSentBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#15803D',
  },
  otpSentToLabel: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 12,
  },
  autoFillBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  autoFillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  autoFillIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  autoFillTitle: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  autoFillCode: {
    fontWeight: 'bold',
    color: '#047857',
    fontSize: 13,
  },
  autoFillSubtitle: {
    fontSize: 10,
    color: '#059669',
    marginTop: 2,
  },
  autoFillArrow: {
    fontSize: 16,
    color: '#059669',
    fontWeight: 'bold',
  },
  otpInputWrapper: {
    width: '100%',
    marginBottom: 14,
  },
  otpInput: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#15803D',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    letterSpacing: 14,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  resendPrompt: {
    fontSize: 12,
    color: '#64748B',
  },
  resendLink: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803D',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 14,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  modalOption: {
    paddingVertical: 12,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  minuteLoadingToggle: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D2B1D',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 99999,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  minuteLoadingToggleText: {
    color: '#F0FDF4',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
