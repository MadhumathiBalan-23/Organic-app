import React, { useState } from 'react';
import { Product, MockProducts } from '../../../agriapp/src/constants/mockData';

// Import screens from submodules
import { 
  WelcomeScreen, 
  CustomerHomeScreen, 
  AllProductsScreen, 
  ProductDetailsScreen, 
  SubscriptionCreationScreen, 
  SubscriptionSummaryScreen, 
  PaymentScreen 
} from './screens/CustomerScreens';

import { 
  MySubscriptionsScreen, 
  DailyDeliveryConfirmationScreen, 
  WhatsAppAIScreen, 
  AIVoiceCallScreen 
} from './screens/SubscriptionScreens';

import { 
  CustomerOrderHistoryScreen, 
  PaymentHistoryScreen, 
  CustomerProfileScreen, 
  DeliveryStaffScreen 
} from './screens/OperationsScreens';

import { 
  VendorDashboardScreen, 
  VendorProductManagementScreen, 
  VendorStockManagementScreen, 
  VendorOrdersScreen, 
  AIMonitoringScreen, 
  AdminDashboardScreen 
} from './screens/BusinessScreens';

export default function Simulator() {
  const [activeScreen, setActiveScreen] = useState<string>('WELCOME');
  const [selectedProduct, setSelectedProduct] = useState<Product>(MockProducts[0]);
  const [activeSubscriptionData, setActiveSubscriptionData] = useState<any>({
    product: MockProducts[0],
    qty: 2,
    freq: 'Daily',
    duration: 30,
    time: '06:30 AM',
    priceTotal: 5100
  });

  // Track simulated transaction/action logs
  const [actionLogs, setActionLogs] = useState<string[]>([
    'System initialized. Mock database seeded.',
    'Ready for screen transitions...'
  ]);

  const pushLog = (logMessage: string) => {
    setActionLogs(prev => [`[${new Date().toLocaleTimeString()}] ${logMessage}`, ...prev.slice(0, 14)]);
  };

  const handleNavigation = (screenName: string) => {
    setActiveScreen(screenName);
    pushLog(`Transitioned to: ${screenName} view`);
  };

  const selectProductDetail = (p: Product) => {
    setSelectedProduct(p);
    handleNavigation('PRODUCT_DETAILS');
  };

  const startSubscriptionPlan = (p: Product) => {
    setSelectedProduct(p);
    handleNavigation('SUBSCRIPTION_CREATE');
  };

  const submitSubscriptionConfig = (subData: any) => {
    setActiveSubscriptionData(subData);
    pushLog(`Subscription configured: ${subData.qty}L Milk, ${subData.freq}`);
    handleNavigation('SUBSCRIPTION_SUMMARY');
  };

  const executePayment = () => {
    pushLog(`Razorpay Order created. Received transaction ID TXN-${Math.floor(Math.random() * 90000 + 10000)}`);
    pushLog(`Payment of ₹${activeSubscriptionData.priceTotal} SUCCESS. Subscription activated.`);
    handleNavigation('MY_SUBSCRIPTIONS');
  };

  // Render active screen inside the phone viewport
  const renderPhoneScreen = () => {
    switch (activeScreen) {
      case 'WELCOME':
        return <WelcomeScreen onNavigate={handleNavigation} />;
      case 'HOME':
        return <CustomerHomeScreen onNavigate={handleNavigation} onSelectProduct={selectProductDetail} />;
      case 'ALL_PRODUCTS':
        return <AllProductsScreen onBack={() => handleNavigation('HOME')} onSelectProduct={selectProductDetail} />;
      case 'PRODUCT_DETAILS':
        return (
          <ProductDetailsScreen 
            product={selectedProduct} 
            onBack={() => handleNavigation('ALL_PRODUCTS')} 
            onStartSubscription={startSubscriptionPlan}
            onAddToCart={(p, q) => {
              pushLog(`Added to cart: ${q} x ${p.name}`);
              handleNavigation('HOME');
            }}
          />
        );
      case 'SUBSCRIPTION_CREATE':
        return <SubscriptionCreationScreen product={selectedProduct} onBack={() => handleNavigation('PRODUCT_DETAILS')} onSubmit={submitSubscriptionConfig} />;
      case 'SUBSCRIPTION_SUMMARY':
        return <SubscriptionSummaryScreen summary={activeSubscriptionData} onBack={() => handleNavigation('SUBSCRIPTION_CREATE')} onProceed={() => handleNavigation('PAYMENT')} />;
      case 'PAYMENT':
        return <PaymentScreen amount={activeSubscriptionData.priceTotal} onBack={() => handleNavigation('SUBSCRIPTION_SUMMARY')} onSuccess={executePayment} />;
      case 'MY_SUBSCRIPTIONS':
        return <MySubscriptionsScreen onBack={() => handleNavigation('HOME')} />;
      case 'DAILY_CONFIRMATION':
        return <DailyDeliveryConfirmationScreen onBack={() => handleNavigation('HOME')} onNavigateSub={() => handleNavigation('MY_SUBSCRIPTIONS')} />;
      case 'WHATSAPP_AI':
        return <WhatsAppAIScreen />;
      case 'AI_VOICE_CALL':
        return <AIVoiceCallScreen />;
      case 'ORDER_HISTORY':
        return <CustomerOrderHistoryScreen onBack={() => handleNavigation('HOME')} />;
      case 'PAYMENT_HISTORY':
        return <PaymentHistoryScreen onBack={() => handleNavigation('HOME')} />;
      case 'PROFILE':
        return <CustomerProfileScreen onBack={() => handleNavigation('HOME')} onNavigateWelcome={() => handleNavigation('WELCOME')} />;
      
      // Vendor
      case 'VENDOR_DASHBOARD':
        return <VendorDashboardScreen onNavigate={handleNavigation} />;
      case 'VENDOR_PRODUCT_MGMT':
        return <VendorProductManagementScreen onBack={() => handleNavigation('VENDOR_DASHBOARD')} />;
      case 'VENDOR_STOCK_MGMT':
        return <VendorStockManagementScreen onBack={() => handleNavigation('VENDOR_DASHBOARD')} />;
      case 'VENDOR_ORDERS':
        return <VendorOrdersScreen onBack={() => handleNavigation('VENDOR_DASHBOARD')} />;
      
      // AI / Admin
      case 'AI_MONITORING':
        return <AIMonitoringScreen />;
      case 'DELIVERY_STAFF':
        return <DeliveryStaffScreen onNavigateWelcome={() => handleNavigation('WELCOME')} />;
      case 'ADMIN_DASHBOARD':
        return <AdminDashboardScreen />;
      
      default:
        return <WelcomeScreen onNavigate={handleNavigation} />;
    }
  };

  const ScreenTabButton: React.FC<{ screen: string; label: string }> = ({ screen, label }) => (
    <button 
      onClick={() => handleNavigation(screen)}
      style={{
        padding: '10px 14px',
        borderRadius: '6px',
        border: 'none',
        textAlign: 'left',
        fontSize: '11px',
        fontWeight: activeScreen === screen ? 'bold' : 'normal',
        backgroundColor: activeScreen === screen ? '#E8F5E9' : 'transparent',
        color: activeScreen === screen ? '#2E7D32' : '#2C3E2F',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      <span style={{ fontSize: '10px' }}>{activeScreen === screen ? '🟢' : '⚪'}</span>
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', gap: '30px', padding: '30px', backgroundColor: '#fcfbf7', minHeight: '90vh', fontFamily: 'sans-serif', color: '#2C3E2F' }}>
      
      {/* LEFT: Navigation Board */}
      <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #EFEBE9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #EFEBE9', paddingBottom: '8px', color: '#2E7D32', fontSize: '14px' }}>📱 Phone View Navigator</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#888', marginTop: '4px' }}>STARTUP</span>
          <ScreenTabButton screen="WELCOME" label="1. Splash Welcome" />
          
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#888', marginTop: '4px' }}>CUSTOMER JOURNEY</span>
          <ScreenTabButton screen="HOME" label="2. Customer Home" />
          <ScreenTabButton screen="ALL_PRODUCTS" label="3. Product Catalog" />
          <ScreenTabButton screen="PRODUCT_DETAILS" label="4. Product Details" />
          <ScreenTabButton screen="SUBSCRIPTION_CREATE" label="5. Subscription builder" />
          <ScreenTabButton screen="SUBSCRIPTION_SUMMARY" label="6. Plan Review" />
          <ScreenTabButton screen="PAYMENT" label="7. Secure Checkout" />
          <ScreenTabButton screen="MY_SUBSCRIPTIONS" label="8. My Subscriptions" />
          <ScreenTabButton screen="DAILY_CONFIRMATION" label="9. Delivery Checklist" />
          
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#888', marginTop: '4px' }}>AI COMMUNICATIONS</span>
          <ScreenTabButton screen="WHATSAPP_AI" label="10. WhatsApp AI Agent" />
          <ScreenTabButton screen="AI_VOICE_CALL" label="11. AI Voice Call" />
          
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#888', marginTop: '4px' }}>ACCOUNT ACTIVITY</span>
          <ScreenTabButton screen="ORDER_HISTORY" label="12. Order Archives" />
          <ScreenTabButton screen="PAYMENT_HISTORY" label="13. Payment Records" />
          <ScreenTabButton screen="PROFILE" label="14. Account Profile" />
          
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#888', marginTop: '4px' }}>MERCHANT / VENDOR</span>
          <ScreenTabButton screen="VENDOR_DASHBOARD" label="15. Farmer Dashboard" />
          <ScreenTabButton screen="VENDOR_PRODUCT_MGMT" label="16. Crop Publisher" />
          <ScreenTabButton screen="VENDOR_STOCK_MGMT" label="17. Stock Depot" />
          <ScreenTabButton screen="VENDOR_ORDERS" label="18. Direct Shipments" />
          
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#888', marginTop: '4px' }}>SYSTEM & OPERATIONS</span>
          <ScreenTabButton screen="AI_MONITORING" label="19. AI Intelligence" />
          <ScreenTabButton screen="DELIVERY_STAFF" label="20. Rider Portal" />
          <ScreenTabButton screen="ADMIN_DASHBOARD" label="21. Super Admin Panel" />
        </div>
      </div>

      {/* CENTER: Simulated Smartphone Device */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: '320px',
          height: '640px',
          borderRadius: '40px',
          backgroundColor: '#000',
          padding: '12px',
          border: '4px solid #444',
          boxShadow: '0 12px 30px rgba(31, 46, 34, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          {/* Smartphone Speaker Ear Piece */}
          <div style={{ width: '60px', height: '14px', borderRadius: '7px', backgroundColor: '#222', position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', justifyContent: 'center' }} />
          
          {/* Phone Screen Viewport */}
          <div style={{
            flex: 1,
            borderRadius: '28px',
            backgroundColor: '#FDFBF7',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            {/* Top Status Bar Mock */}
            <div style={{ height: '24px', backgroundColor: 'rgba(0,0,0,0.03)', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', fontWeight: 'bold', color: '#444' }}>
              <span>9:41 AM</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span>📶</span>
                <span>🔋 100%</span>
              </div>
            </div>

            {/* Screen Content */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {renderPhoneScreen()}
            </div>

            {/* Bottom Navigation for Customer Screens */}
            {['HOME', 'ALL_PRODUCTS', 'MY_SUBSCRIPTIONS', 'PROFILE'].includes(activeScreen) && (
              <div style={{
                height: '48px',
                borderTop: '1px solid #EFEBE9',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                fontSize: '9px',
                fontWeight: 'bold',
                color: '#7A8C7F'
              }}>
                <div onClick={() => handleNavigation('HOME')} style={{ cursor: 'pointer', textAlign: 'center', color: activeScreen === 'HOME' ? '#2E7D32' : '#7A8C7F' }}>
                  <div style={{ fontSize: '13px' }}>🏠</div>Home
                </div>
                <div onClick={() => handleNavigation('ALL_PRODUCTS')} style={{ cursor: 'pointer', textAlign: 'center', color: activeScreen === 'ALL_PRODUCTS' ? '#2E7D32' : '#7A8C7F' }}>
                  <div style={{ fontSize: '13px' }}>📦</div>Shop
                </div>
                <div onClick={() => handleNavigation('MY_SUBSCRIPTIONS')} style={{ cursor: 'pointer', textAlign: 'center', color: activeScreen === 'MY_SUBSCRIPTIONS' ? '#2E7D32' : '#7A8C7F' }}>
                  <div style={{ fontSize: '13px' }}>📅</div>Plans
                </div>
                <div onClick={() => handleNavigation('PROFILE')} style={{ cursor: 'pointer', textAlign: 'center', color: activeScreen === 'PROFILE' ? '#2E7D32' : '#7A8C7F' }}>
                  <div style={{ fontSize: '13px' }}>👤</div>Profile
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: System Event Log */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #EFEBE9' }}>
        <h4 style={{ margin: '0', color: '#2E7D32', fontSize: '14px', borderBottom: '1px solid #EFEBE9', paddingBottom: '8px' }}>📡 AI-Server Operations logs</h4>
        <div style={{ flex: 1, backgroundColor: '#1A3323', borderRadius: '8px', padding: '14px', fontFamily: 'monospace', fontSize: '11px', color: '#A5D6A7', minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          {actionLogs.map((log, idx) => (
            <div key={idx} style={{ lineHeight: 1.4, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>{log}</div>
          ))}
        </div>
      </div>

    </div>
  );
}
