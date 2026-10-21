import React, { useState } from 'react';
import { 
  SafeAreaView, StyleSheet, Text, View, TextInput, 
  TouchableOpacity, StatusBar, Alert, Modal, Image
} from 'react-native';
import { MockProducts, Product } from './src/constants/mockData';
import { MobileFrameWrapper } from './src/components/MobileFrameWrapper';
import { RoleHeader, UserRole } from './src/components/RoleHeader';
import { BottomNavBar } from './src/components/BottomNavBar';
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

  // Form states
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleUniversalLogin = () => {
    if (phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
      return;
    }
    
    if (phone === '9999999999' && password === 'admin123') {
      setRole('admin');
    } else if (phone === '8888888888' && password === 'vendor123') {
      setRole('vendor');
    } else if (password === 'customer123') {
      setRole('customer');
    } else {
      Alert.alert('Error', 'Invalid Credentials.');
    }
  };

  const handleLogout = () => {
    setRole(null);
    setPhone('');
    setPassword('');
    setShowPassword(false);
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
    if (role === 'admin') {
      setAdminTab(screenKey);
    } else if (role === 'vendor') {
      setVendorTab(screenKey);
    } else {
      setCustomerScreen(screenKey);
    }
  };

  // --- 1. UNIVERSAL LOGIN SCREEN ---
  if (role === null) {
    return (
      <MobileFrameWrapper>
        <SafeAreaView style={styles.authContainer}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.loginCard}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('./asset/logo.jpeg')}
                style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 12 }}
                resizeMode="contain"
              />
              <Text style={styles.logoTitle}>Mathira Organic Farming</Text>
              <Text style={styles.logoSubtitle}>
                Pure · Natural · Healthy organic food products direct from certified farms.
              </Text>
            </View>

            <View style={{ width: '100%' }}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput 
                style={styles.input} 
                placeholder="10-digit number" 
                keyboardType="phone-pad" 
                maxLength={10}
                value={phone} 
                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))} 
                placeholderTextColor="#94A3B8" 
              />
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput 
                  style={styles.passwordInput} 
                  placeholder="••••••••" 
                  value={password} 
                  onChangeText={setPassword} 
                  secureTextEntry={!showPassword} 
                  placeholderTextColor="#94A3B8" 
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleUniversalLogin}>
                <Text style={styles.buttonText}>Secure Login</Text>
              </TouchableOpacity>
              
              <Text style={[styles.demoText, { textAlign: 'left', lineHeight: 18, marginTop: 16 }]}>
                Demo Admin: 9999999999 / admin123{'\n'}
                Demo Vendor: 8888888888 / vendor123{'\n'}
                Demo Customer: Any 10 digits / customer123
              </Text>
            </View>
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
            />
          )
        )}

        {(role === 'vendor' || role === 'admin') && (
          <VendorAndAdminScreens
            role={role}
            triggerRefresh={triggerRefresh}
            activeTab={role === 'admin' ? adminTab : vendorTab}
            onSelectTab={(t) => role === 'admin' ? setAdminTab(t) : setVendorTab(t)}
          />
        )}

        {/* Bottom Tab Bar for Customer view */}
        {role === 'customer' && ['HOME', 'ALL_PRODUCTS', 'MY_SUBSCRIPTIONS', 'PROFILE'].includes(customerScreen) && (
          <BottomNavBar
            currentScreen={customerScreen}
            onNavigate={(screen) => setCustomerScreen(screen)}
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
        />
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
  logoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#15803D',
    marginTop: 6,
  },
  logoSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    width: '100%',
    height: 42,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 42,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  eyeIcon: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 44,
    backgroundColor: '#15803D',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  demoText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 12,
    textAlign: 'center',
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
});
