import React, { useState } from 'react';
import { MockProducts, MockAIAlerts, Product, Categories } from '../../../../agriapp/src/constants/mockData';

// Helper for card styling
const boxStyle = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '16px',
  border: '1px solid #EFEBE9',
  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
};

// 15. VENDOR DASHBOARD SCREEN
export const VendorDashboardScreen: React.FC<{ onNavigate: (scr: string) => void }> = ({ onNavigate }) => {
  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      {/* Vendor Header */}
      <div style={{ padding: '16px', backgroundColor: '#8D6E63', color: '#fff', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '11px', opacity: 0.9 }}>FARMER PORTAL</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: '0', fontSize: '16px' }}>🌾 Green Valley Organic Farm</h3>
          <span style={{ fontSize: '12px', color: '#EFEBE9', cursor: 'pointer', border: '1px solid #EFEBE9', padding: '2px 8px', borderRadius: '4px' }} onClick={() => onNavigate('WELCOME')}>Exit</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ ...boxStyle, backgroundColor: '#E8F5E9' }}>
            <span style={{ fontSize: '9px', color: '#2E7D32', fontWeight: 'bold' }}>TODAY'S SALES</span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', color: '#2C3E2F' }}>₹12,450</h3>
          </div>
          <div style={{ ...boxStyle, backgroundColor: '#DFF2F4' }}>
            <span style={{ fontSize: '9px', color: '#006064', fontWeight: 'bold' }}>ACTIVE SUBS</span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', color: '#2C3E2F' }}>42 Users</h3>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <button onClick={() => onNavigate('VENDOR_PRODUCT_MGMT')} style={{ padding: '10px 4px', borderRadius: '8px', border: '1px solid #EFEBE9', backgroundColor: '#fff', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Add Stock</button>
          <button onClick={() => onNavigate('VENDOR_STOCK_MGMT')} style={{ padding: '10px 4px', borderRadius: '8px', border: '1px solid #EFEBE9', backgroundColor: '#fff', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>📦 Inventory</button>
          <button onClick={() => onNavigate('VENDOR_ORDERS')} style={{ padding: '10px 4px', borderRadius: '8px', border: '1px solid #EFEBE9', backgroundColor: '#fff', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>📋 Orders</button>
        </div>

        {/* Stock Status Bar */}
        <div style={boxStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h5 style={{ margin: '0', fontSize: '12px', color: '#2C3E2F' }}>Depot Inventory Alerts</h5>
            <span style={{ fontSize: '10px', color: '#E53935', fontWeight: 'bold' }}>1 Low stock item</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
            <span>Wild Forest Raw Honey</span>
            <span style={{ color: '#E53935', fontWeight: 'bold' }}>Only 9 left</span>
          </div>
        </div>

        {/* Tiny Graph Mock */}
        <div style={boxStyle}>
          <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#2C3E2F' }}>Weekly Organic Sales Flow</h5>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '60px', gap: '14px', paddingTop: '10px', justifyContent: 'center' }}>
            {[30, 45, 60, 40, 75, 90, 80].map((h, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '12px', height: `${h}%`, backgroundColor: idx === 5 ? '#2E7D32' : '#8D6E63', borderRadius: '2px' }} />
                <span style={{ fontSize: '8px', marginTop: '4px', color: '#888' }}>{['M','T','W','T','F','S','S'][idx]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 16. VENDOR PRODUCT MANAGEMENT SCREEN
export const VendorProductManagementScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState(Categories[1]);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) return;
    const newProduct: Product = {
      id: 'p' + (MockProducts.length + 1),
      name,
      category,
      price: parseFloat(price),
      unit: 'kg',
      rating: 5.0,
      stock: parseInt(stock),
      minStock: 5,
      availabilityStart: '06:00 AM',
      availabilityEnd: '10:00 PM',
      description: 'Fresh organic crop added by Vendor.',
      benefits: ['100% organic', 'Directly from farm'],
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
      subscriptionAllowed: true,
      oneTimeAllowed: true,
      organicCertified: true
    };
    MockProducts.push(newProduct);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setName('');
      setPrice('');
      setStock('');
    }, 2000);
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #EFEBE9', backgroundColor: '#fff' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '18px', marginRight: '12px', cursor: 'pointer', color: '#8D6E63' }}>←</button>
        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2C3E2F' }}>Add Organic Crop</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {success && (
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#E8F5E9', border: '1px solid #81C784', color: '#2E7D32', fontSize: '12px', fontWeight: 'bold', marginBottom: '14px' }}>
            ✓ Product catalog updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#8D6E63', display: 'block', marginBottom: '4px' }}>Product Name</label>
            <input type="text" placeholder="e.g. Fresh Organic Strawberries" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #EFEBE9', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#8D6E63', display: 'block', marginBottom: '4px' }}>Price (₹)</label>
              <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #EFEBE9', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#8D6E63', display: 'block', marginBottom: '4px' }}>Unit Type</label>
              <input type="text" placeholder="e.g. kg, Litre, Box" defaultValue="kg" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #EFEBE9', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#8D6E63', display: 'block', marginBottom: '4px' }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #EFEBE9', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' }}>
              {Categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#8D6E63', display: 'block', marginBottom: '4px' }}>Opening Inventory Stock</label>
            <input type="number" placeholder="Quantity" value={stock} onChange={e => setStock(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #EFEBE9', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', fontSize: '11px', marginTop: '10px' }}>
            <label><input type="checkbox" defaultChecked /> Allow Subscriptions</label>
            <label><input type="checkbox" defaultChecked /> Allow One-Time Purchase</label>
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '24px', backgroundColor: '#8D6E63', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', marginTop: '10px' }}>
            Publish Product
          </button>
        </form>
      </div>
    </div>
  );
};

// 17. VENDOR STOCK MANAGEMENT SCREEN
export const VendorStockManagementScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [productStocks, setProductStocks] = useState<Product[]>(MockProducts);

  const addStockQuantity = (id: string, amt: number) => {
    setProductStocks(prev => prev.map(p => p.id === id ? { ...p, stock: p.stock + amt } : p));
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #EFEBE9', backgroundColor: '#fff' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '18px', marginRight: '12px', cursor: 'pointer', color: '#8D6E63' }}>←</button>
        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2C3E2F' }}>Inventory Depot</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {productStocks.map(p => (
          <div 
            key={p.id}
            style={{ ...boxStyle, borderLeft: p.stock < p.minStock ? '4px solid #E53935' : '1px solid #EFEBE9' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h5 style={{ margin: '0', fontSize: '13px' }}>{p.name}</h5>
              <span style={{ fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', backgroundColor: p.stock < p.minStock ? '#FFEBEE' : '#E8F5E9', color: p.stock < p.minStock ? '#C62828' : '#2E7D32' }}>
                {p.stock < p.minStock ? 'LOW STOCK' : 'NORMAL'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666', borderBottom: '1px dashed #E5DFD5', paddingBottom: '6px', marginBottom: '8px' }}>
              <span>Available Stock: <strong>{p.stock}</strong></span>
              <span>Min limit: {p.minStock}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => addStockQuantity(p.id, 10)} style={{ flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '10px', cursor: 'pointer' }}>+10 Item</button>
              <button onClick={() => addStockQuantity(p.id, 50)} style={{ flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '10px', cursor: 'pointer' }}>+50 Items</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 18. VENDOR ORDERS SCREEN
export const VendorOrdersScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'New' | 'Preparing' | 'Packed' | 'Delivered'>('New');

  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #EFEBE9', backgroundColor: '#fff' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '18px', marginRight: '12px', cursor: 'pointer', color: '#8D6E63' }}>←</button>
        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2C3E2F' }}>FARM Shipments</span>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #EFEBE9', backgroundColor: '#fff' }}>
        {(['New', 'Preparing', 'Packed', 'Delivered'] as const).map(tab => (
          <div 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: '10px 0', textAlign: 'center', fontSize: '11px', color: activeTab === tab ? '#8D6E63' : '#666', borderBottom: activeTab === tab ? '2px solid #8D6E63' : 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {tab}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activeTab === 'New' && (
          <div style={{ ...boxStyle }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #EFEBE9', paddingBottom: '6px', marginBottom: '8px', fontSize: '10px', color: '#888' }}>
              <span>ORDER: RECUR-4421</span>
              <span>Tomorrow (6:30 AM)</span>
            </div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#2C3E2F' }}>Ananya Sharma</h5>
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold', color: '#2E7D32' }}>Organic A2 Cow Milk (2 Litres)</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', backgroundColor: '#8D6E63', color: '#fff', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Accept Order</button>
              <button style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '10px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {activeTab !== 'New' && (
          <div style={{ padding: '30px', textAlign: 'center', color: '#888', fontSize: '12px' }}>
            No orders remaining in {activeTab.toLowerCase()} state.
          </div>
        )}
      </div>
    </div>
  );
};

// 19. AI MONITORING DASHBOARD SCREEN
export const AIMonitoringScreen: React.FC = () => {
  return (
    <div style={{ flex: 1, backgroundColor: '#F0F4F2', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <div style={{ padding: '16px', backgroundColor: '#1A3323', color: '#fff' }}>
        <h4 style={{ margin: '0 0 2px 0', fontSize: '9px', color: '#81C784', fontWeight: 'bold' }}>PREDICTOR ENGINE</h4>
        <h3 style={{ margin: '0', fontSize: '15px' }}>⚡ OrganicFlow AI Monitor</h3>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
        {/* Core Insights */}
        {MockAIAlerts.map(al => (
          <div 
            key={al.id}
            style={{ ...boxStyle, borderLeft: '4px solid #2E7D32', display: 'flex', gap: '10px', alignItems: 'flex-start' }}
          >
            <span style={{ fontSize: '18px' }}>🤖</span>
            <div>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#7A8C7F' }}>{al.type.toUpperCase()}</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#2C3E2F', lineHeight: 1.4 }}>{al.text}</p>
            </div>
          </div>
        ))}

        {/* AI Statistics Mocks */}
        <div style={boxStyle}>
          <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#8D6E63', fontWeight: 'bold' }}>FORECAST METRICS</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Expected Tomorrow Demand:</span>
              <span style={{ fontWeight: 'bold', color: '#2E7D32' }}>342 Litres</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Current Farmer Stock:</span>
              <span style={{ fontWeight: 'bold' }}>320 Litres</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E53935', fontWeight: 'bold', borderTop: '1px dashed #ccc', paddingTop: '6px' }}>
              <span>Predicted Deficit:</span>
              <span>- 22 Litres</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 21. MASTER ADMIN DASHBOARD SCREEN
export const AdminDashboardScreen: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isAdminLoggedIn') === 'true');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodCategory, setProdCategory] = useState(Categories[1]);
  const [addSuccess, setAddSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      localStorage.setItem('isAdminLoggedIn', 'true');
      setError('');
    } else {
      setError('Invalid Admin Username or Password.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isAdminLoggedIn');
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodStock) return;
    const newProduct: Product = {
      id: 'p' + (MockProducts.length + 1),
      name: prodName,
      category: prodCategory,
      price: parseFloat(prodPrice),
      unit: 'kg',
      rating: 5.0,
      stock: parseInt(prodStock),
      minStock: 5,
      availabilityStart: '06:00 AM',
      availabilityEnd: '10:00 PM',
      description: 'High-quality organic product added by Super Admin.',
      benefits: ['Verified Organic', 'Pesticide Free', 'Fresh Harvest'],
      imageUrl: 'https://images.unsplash.com/photo-1610832958506-ee5633619144?auto=format&fit=crop&q=80&w=400',
      subscriptionAllowed: true,
      oneTimeAllowed: true,
      organicCertified: true
    };
    MockProducts.push(newProduct);
    setAddSuccess(true);
    setProdName('');
    setProdPrice('');
    setProdStock('');
    setTimeout(() => setAddSuccess(false), 2000);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif', boxSizing: 'border-box', justifyContent: 'center', padding: '24px' }}>
        <div style={{ ...boxStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '32px' }}>🔒</span>
            <h3 style={{ margin: '8px 0 0 0', color: '#2E7D32', fontSize: '18px' }}>Admin Portal Login</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#7A8C7F' }}>Enter credentials to access Control Room</p>
          </div>
          
          {error && (
            <div style={{ fontSize: '11px', color: '#C62828', backgroundColor: '#FFEBEE', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#2C3E2F', display: 'block', marginBottom: '4px' }}>Username</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)} 
                placeholder="admin" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #EFEBE9', outline: 'none', boxSizing: 'border-box', fontSize: '13px' }} 
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#2C3E2F', display: 'block', marginBottom: '4px' }}>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)} 
                placeholder="admin123" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #EFEBE9', outline: 'none', boxSizing: 'border-box', fontSize: '13px' }} 
              />
            </div>
            <button 
              type="submit" 
              style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '24px', backgroundColor: '#2E7D32', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}
            >
              Log In
            </button>
          </form>
          <div style={{ fontSize: '9px', color: '#888', textAlign: 'center' }}>
            Demo Credentials: admin / admin123
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <div style={{ padding: '16px', backgroundColor: '#2E7D32', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: '0 0 2px 0', fontSize: '10px', opacity: 0.8 }}>SYSTEM ADMINISTRATOR</h4>
          <h3 style={{ margin: '0', fontSize: '16px' }}>⚙️ Control Room</h3>
        </div>
        <button 
          onClick={handleLogout}
          style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #fff', backgroundColor: 'transparent', color: '#fff', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Log Out
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
        
        {/* Core KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ ...boxStyle, padding: '10px' }}>
            <span style={{ fontSize: '9px', color: '#777' }}>TOTAL STORES</span>
            <h4 style={{ margin: '2px 0 0 0', fontSize: '14px' }}>14 Farmers</h4>
          </div>
          <div style={{ ...boxStyle, padding: '10px' }}>
            <span style={{ fontSize: '9px', color: '#777' }}>MONTHLY REVENUE</span>
            <h4 style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#2E7D32' }}>₹5,64,200</h4>
          </div>
        </div>

        {/* Add Product Section for Admin */}
        <div style={boxStyle}>
          <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#2E7D32', borderBottom: '1px solid #EFEBE9', paddingBottom: '6px' }}>➕ Add New Product to App Catalog</h5>
          
          {addSuccess && (
            <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#E8F5E9', border: '1px solid #81C784', color: '#2E7D32', fontSize: '11px', fontWeight: 'bold', marginBottom: '10px' }}>
              ✓ Product published successfully to AgriAPP catalog!
            </div>
          )}

          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <input 
                type="text" 
                placeholder="Product Name" 
                value={prodName} 
                onChange={e => setProdName(e.target.value)} 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #EFEBE9', outline: 'none', boxSizing: 'border-box', fontSize: '12px' }} 
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input 
                type="number" 
                placeholder="Price (₹)" 
                value={prodPrice} 
                onChange={e => setProdPrice(e.target.value)} 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #EFEBE9', outline: 'none', boxSizing: 'border-box', fontSize: '12px' }} 
                required
              />
              <input 
                type="number" 
                placeholder="Stock Qty" 
                value={prodStock} 
                onChange={e => setProdStock(e.target.value)} 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #EFEBE9', outline: 'none', boxSizing: 'border-box', fontSize: '12px' }} 
                required
              />
            </div>
            <div>
              <select 
                value={prodCategory} 
                onChange={e => setProdCategory(e.target.value)} 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #EFEBE9', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box', fontSize: '12px' }}
              >
                {Categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button 
              type="submit" 
              style={{ padding: '8px 16px', border: 'none', borderRadius: '18px', backgroundColor: '#2E7D32', color: '#fff', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', alignSelf: 'flex-start' }}
            >
              Publish Product
            </button>
          </form>
        </div>

        {/* System Diagnostics */}
        <div style={boxStyle}>
          <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#2C3E2F' }}>Integration status</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
            {[
              { name: 'Razorpay payment APIs', state: 'ONLINE', color: '#4CAF50' },
              { name: 'WhatsApp webhook triggers', state: 'ONLINE', color: '#4CAF50' },
              { name: 'PostgreSQL Database Node', state: 'ACTIVE', color: '#4CAF50' }
            ].map((srv, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#555' }}>{srv.name}</span>
                <span style={{ fontSize: '9px', fontWeight: 'bold', color: srv.color }}>● {srv.state}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
