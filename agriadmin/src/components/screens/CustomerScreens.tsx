import React, { useState } from 'react';
import { MockProducts, Product } from '../../../../agriapp/src/constants/mockData';

// Shared styling helper for buttons and badges
const cardShadow = {
  boxShadow: '0 2px 8px rgba(31, 46, 34, 0.08)'
};

// 1. WELCOME SCREEN
export const WelcomeScreen: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => {
  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', boxSizing: 'border-box', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
        {/* Dynamic Organic Icon Mockup */}
        <div style={{ width: '90px', height: '90px', borderRadius: '45px', backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '2px solid #81C784' }}>
          <span style={{ fontSize: '42px', color: '#2E7D32' }}>🌱</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2E7D32', margin: '0 0 8px 0', fontFamily: 'sans-serif' }}>OrganicFlow AI</h1>
        <p style={{ fontSize: '15px', color: '#7A8C7F', textAlign: 'center', margin: '0', fontStyle: 'italic' }}>“Pure. Natural. Healthy.”</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', height: '180px', borderRadius: '16px', background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', border: '1px dashed #A5D6A7', padding: '16px', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '40px' }}>🚜</span>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#2C3E2F', fontWeight: '600' }}>Direct From Organic Farms</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#7A8C7F' }}>Subscriptions & Free Home Delivery</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <button 
          onClick={() => onNavigate('HOME')}
          style={{ width: '100%', padding: '14px', borderRadius: '30px', backgroundColor: '#2E7D32', color: '#ffffff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          Customer Dashboard
        </button>
        <button 
          onClick={() => onNavigate('VENDOR_DASHBOARD')}
          style={{ width: '100%', padding: '14px', borderRadius: '30px', backgroundColor: '#8D6E63', color: '#ffffff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }}
        >
          Vendor Portal
        </button>
        <button 
          onClick={() => onNavigate('DELIVERY_STAFF')}
          style={{ width: '100%', padding: '14px', borderRadius: '30px', backgroundColor: '#EFEBE9', color: '#2C3E2F', fontWeight: 'bold', border: '1px solid #CCC', cursor: 'pointer', fontSize: '15px' }}
        >
          Delivery Login
        </button>
      </div>
    </div>
  );
};

// 2. CUSTOMER HOME SCREEN
export const CustomerHomeScreen: React.FC<{ 
  onNavigate: (screen: string) => void;
  onSelectProduct: (p: Product) => void; 
}> = ({ onNavigate, onSelectProduct }) => {
  const [search, setSearch] = useState('');
  const activeProducts = MockProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      {/* Search Header */}
      <div style={{ padding: '16px', backgroundColor: '#2E7D32', color: '#fff', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>DELIVERING TO</span>
            <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>📍 Indiranagar, Bangalore</p>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '18px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => onNavigate('PROFILE')}>
            👤
          </div>
        </div>
        <div style={{ display: 'flex', backgroundColor: '#fff', borderRadius: '30px', padding: '8px 16px', alignItems: 'center' }}>
          <span style={{ color: '#888', marginRight: '8px' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search milk, ghee, spinach..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', color: '#333' }}
          />
        </div>
      </div>

      {/* Main List */}
      <div style={{ padding: '16px' }}>
        {/* Banner Card */}
        <div style={{ background: 'linear-gradient(135deg, #2E7D32 0%, #558B2F 100%)', borderRadius: '16px', padding: '16px', color: '#fff', marginBottom: '20px', ...cardShadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <span style={{ backgroundColor: '#FFB74D', color: '#3E2723', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>OFFER</span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '16px' }}>Set up Morning Milk</h3>
              <p style={{ margin: '0', fontSize: '12px', opacity: 0.9 }}>Get 10% Cash-Back on advance payments</p>
            </div>
            <span style={{ fontSize: '40px' }}>🥛</span>
          </div>
        </div>

        {/* Categories Grid */}
        <h4 style={{ margin: '0 0 12px 0', color: '#2C3E2F' }}>Categories</h4>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '8px' }}>
          {['All', 'Dairy', 'Vegetables', 'Fruits', 'Honey & Dry Fruits'].map((cat, idx) => (
            <div 
              key={idx} 
              onClick={() => onNavigate('ALL_PRODUCTS')}
              style={{ backgroundColor: idx === 0 ? '#E8F5E9' : '#fff', border: idx === 0 ? '1px solid #2E7D32' : '1px solid #EFEBE9', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', color: idx === 0 ? '#2E7D32' : '#2C3E2F', fontWeight: 'bold', whiteSpace: 'nowrap', cursor: 'pointer' }}
            >
              {cat}
            </div>
          ))}
        </div>

        {/* Featured Products */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ margin: '0', color: '#2C3E2F' }}>Organic Fresh Crops</h4>
          <span onClick={() => onNavigate('ALL_PRODUCTS')} style={{ fontSize: '12px', color: '#2E7D32', cursor: 'pointer', fontWeight: 'bold' }}>See All</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {activeProducts.slice(0, 4).map((product) => (
            <div 
              key={product.id} 
              onClick={() => onSelectProduct(product)}
              style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #EFEBE9', padding: '10px', display: 'flex', flexDirection: 'column', cursor: 'pointer', ...cardShadow }}
            >
              <div style={{ height: '90px', backgroundColor: '#F9F9F9', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', position: 'relative' }}>
                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: '5px', left: '5px', backgroundColor: '#E8F5E9', color: '#2E7D32', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>Certified</span>
              </div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#2C3E2F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h5>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#2E7D32' }}>₹{product.price}<span style={{ fontSize: '10px', color: '#888', fontWeight: 'normal' }}>/{product.unit}</span></span>
                <span style={{ fontSize: '10px', color: '#F5B041' }}>★ {product.rating}</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '9px', color: '#7A8C7F' }}>Available {product.availabilityStart}-{product.availabilityEnd}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. ALL PRODUCTS SCREEN
export const AllProductsScreen: React.FC<{ 
  onBack: () => void; 
  onSelectProduct: (p: Product) => void;
}> = ({ onBack, onSelectProduct }) => {
  const [activeCat, setActiveCat] = useState('All');
  const filtered = activeCat === 'All' 
    ? MockProducts 
    : MockProducts.filter(p => p.category === activeCat);

  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #EFEBE9', backgroundColor: '#fff' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '18px', marginRight: '12px', cursor: 'pointer', color: '#2E7D32' }}>←</button>
        <h3 style={{ margin: '0', fontSize: '16px', color: '#2C3E2F' }}>Organic Catalog</h3>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 16px', borderBottom: '1px solid #EFEBE9', backgroundColor: '#fff' }}>
        {['All', 'Dairy & Pure Ghee', 'Fresh Vegetables', 'Fresh Fruits', 'Dry Fruits & Snacks'].map((cat, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveCat(cat)}
            style={{ padding: '6px 12px', borderRadius: '15px', border: activeCat === cat ? 'none' : '1px solid #E5DFD5', backgroundColor: activeCat === cat ? '#2E7D32' : 'transparent', color: activeCat === cat ? '#fff' : '#2C3E2F', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
          >
            {cat.replace(' & Pure Ghee', '').replace(' & Snacks', '')}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(p => (
          <div 
            key={p.id}
            onClick={() => onSelectProduct(p)}
            style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #EFEBE9', padding: '12px', display: 'flex', gap: '12px', cursor: 'pointer', ...cardShadow }}
          >
            <div style={{ width: '85px', height: '85px', borderRadius: '8px', backgroundColor: '#F9F9F9', overflow: 'hidden' }}>
              <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: '0', fontSize: '14px', color: '#2C3E2F', fontWeight: 'bold' }}>{p.name}</h4>
                {p.stock < 10 && <span style={{ backgroundColor: '#FADBD8', color: '#E53935', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>Low Stock</span>}
              </div>
              <p style={{ margin: '4px 0', fontSize: '11px', color: '#7A8C7F' }}>Available: {p.availabilityStart} - {p.availabilityEnd}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#2E7D32' }}>₹{p.price}/<span style={{ fontSize: '10px', color: '#888' }}>{p.unit}</span></span>
                <span style={{ fontSize: '11px', color: '#F5B041' }}>★ {p.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. PRODUCT DETAILS SCREEN
export const ProductDetailsScreen: React.FC<{ 
  product: Product; 
  onBack: () => void; 
  onStartSubscription: (p: Product) => void;
  onAddToCart: (p: Product, qty: number) => void;
}> = ({ product, onBack, onStartSubscription, onAddToCart }) => {
  const [qty, setQty] = useState(1);

  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', position: 'absolute', top: 0, left: 0, zIndex: 10, width: '100%' }}>
        <button onClick={onBack} style={{ width: '32px', height: '32px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Product Image */}
        <div style={{ height: '220px', backgroundColor: '#EFEBE9' }}>
          <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Text Area */}
        <div style={{ padding: '20px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', backgroundColor: '#FDFBF7', marginTop: '-20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px' }}>100% ORGANIC CERTIFIED</span>
            <span style={{ fontSize: '12px', color: '#888' }}>★ {product.rating}</span>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C3E2F', margin: '0 0 6px 0' }}>{product.name}</h2>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2E7D32', margin: '0 0 16px 0' }}>₹{product.price} <span style={{ fontSize: '13px', color: '#888', fontWeight: 'normal' }}>/ {product.unit}</span></p>

          <h5 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#2C3E2F' }}>Description</h5>
          <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#666', lineHeight: 1.5 }}>{product.description}</p>

          <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#2C3E2F' }}>Certifications & Benefits</h5>
          <ul style={{ margin: '0 0 20px 0', paddingLeft: '18px', fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
            {product.benefits.map((b, i) => <li key={i}>{b}</li>)}
            <li>Available delivery window: {product.availabilityStart} - {product.availabilityEnd}</li>
          </ul>
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div style={{ padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #EFEBE9', display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Quantity Select */}
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #EFEBE9', borderRadius: '20px', padding: '4px 10px', gap: '10px', height: '40px', boxSizing: 'border-box' }}>
          <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ border: 'none', background: 'none', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
          <span style={{ fontSize: '13px', minWidth: '15px', textAlign: 'center' }}>{qty}</span>
          <button onClick={() => setQty(qty + 1)} style={{ border: 'none', background: 'none', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
        </div>

        {product.oneTimeAllowed && (
          <button 
            onClick={() => onAddToCart(product, qty)}
            style={{ flex: 1, height: '40px', borderRadius: '20px', backgroundColor: '#EFEBE9', color: '#2C3E2F', fontWeight: 'bold', border: 'none', fontSize: '12px', cursor: 'pointer' }}
          >
            Buy Once
          </button>
        )}

        {product.subscriptionAllowed && (
          <button 
            onClick={() => onStartSubscription(product)}
            style={{ flex: 1, height: '40px', borderRadius: '20px', backgroundColor: '#2E7D32', color: '#fff', fontWeight: 'bold', border: 'none', fontSize: '12px', cursor: 'pointer' }}
          >
            Subscribe
          </button>
        )}
      </div>
    </div>
  );
};

// 5. SUBSCRIPTION CREATION SCREEN
export const SubscriptionCreationScreen: React.FC<{ 
  product: Product; 
  onBack: () => void;
  onSubmit: (sub: any) => void;
}> = ({ product, onBack, onSubmit }) => {
  const [qty, setQty] = useState(2);
  const [freq, setFreq] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [duration, setDuration] = useState(30);
  const [time, setTime] = useState('06:30 AM');
  const [autoRenew, setAutoRenew] = useState(true);
  const [confirmReq, setConfirmReq] = useState(true);

  // Price estimate (e.g. 2 * 85 * 30 = 5100)
  const daysMultiplier = freq === 'Daily' ? duration : freq === 'Weekly' ? Math.ceil(duration / 7) : Math.ceil(duration / 30);
  const totalCost = qty * product.price * daysMultiplier;

  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #EFEBE9', backgroundColor: '#fff' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '18px', marginRight: '12px', cursor: 'pointer', color: '#2E7D32' }}>←</button>
        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2C3E2F' }}>Subscribe to {product.name}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Quantity Selection */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: '12px', padding: '12px', border: '1px solid #EFEBE9' }}>
          <div>
            <h5 style={{ margin: '0', fontSize: '13px', color: '#2C3E2F' }}>Daily Quantity</h5>
            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#888' }}>Adjust amount per delivery</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #EFEBE9', borderRadius: '20px', padding: '4px 10px', gap: '12px' }}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ border: 'none', background: 'none', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{qty} {product.unit}</span>
            <button onClick={() => setQty(qty + 1)} style={{ border: 'none', background: 'none', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
          </div>
        </div>

        {/* Frequency */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '12px', border: '1px solid #EFEBE9', ...cardShadow }}>
          <h5 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#2C3E2F' }}>Frequency</h5>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['Daily', 'Weekly', 'Monthly'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFreq(f)}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: freq === f ? 'none' : '1px solid #E5DFD5', backgroundColor: freq === f ? '#2E7D32' : 'transparent', color: freq === f ? '#fff' : '#2C3E2F', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Time Selection */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '12px', border: '1px solid #EFEBE9' }}>
          <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#2C3E2F' }}>Select Morning Slot</h5>
          <select 
            value={time} 
            onChange={(e) => setTime(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5DFD5', backgroundColor: '#fff', outline: 'none' }}
          >
            <option value="06:00 AM">06:00 AM - 07:00 AM</option>
            <option value="07:00 AM">07:00 AM - 08:00 AM</option>
            <option value="08:00 AM">08:00 AM - 09:00 AM</option>
          </select>
        </div>

        {/* Duration */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '12px', border: '1px solid #EFEBE9' }}>
          <h5 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#2C3E2F' }}>Duration</h5>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[15, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: duration === d ? 'none' : '1px solid #E5DFD5', backgroundColor: duration === d ? '#2E7D32' : 'transparent', color: duration === d ? '#fff' : '#2C3E2F', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
            <span style={{ fontSize: '12px', color: '#2C3E2F' }}>Automated Auto-Renewal</span>
            <input type="checkbox" checked={autoRenew} onChange={(e) => setAutoRenew(e.target.checked)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
            <span style={{ fontSize: '12px', color: '#2C3E2F' }}>WhatsApp confirming before dispatch</span>
            <input type="checkbox" checked={confirmReq} onChange={(e) => setConfirmReq(e.target.checked)} />
          </div>
        </div>
      </div>

      {/* Floating Cost Info */}
      <div style={{ padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #EFEBE9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '10px', color: '#888' }}>ADVANCE SPECIFIED</span>
          <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#2E7D32' }}>₹{totalCost.toLocaleString('en-IN')}</p>
        </div>
        <button 
          onClick={() => onSubmit({ product, qty, freq, duration, time, autoRenew, confirmReq, priceTotal: totalCost })}
          style={{ padding: '12px 24px', borderRadius: '24px', backgroundColor: '#2E7D32', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
        >
          Check Plan
        </button>
      </div>
    </div>
  );
};

// 6. SUBSCRIPTION SUMMARY SCREEN
export const SubscriptionSummaryScreen: React.FC<{ 
  summary: { product: Product; qty: number; freq: string; duration: number; time: string; priceTotal: number };
  onBack: () => void;
  onProceed: () => void;
}> = ({ summary, onBack, onProceed }) => {
  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #EFEBE9', backgroundColor: '#fff' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '18px', marginRight: '12px', cursor: 'pointer', color: '#2E7D32' }}>←</button>
        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2C3E2F' }}>Plan Review</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #EFEBE9', padding: '16px', ...cardShadow }}>
          <h4 style={{ margin: '0 0 12px 0', borderBottom: '1px solid #EFEBE9', paddingBottom: '8px', color: '#2C3E2F' }}>Delivery Breakdown</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7A8C7F' }}>Product:</span>
              <span style={{ fontWeight: 'bold', color: '#2C3E2F' }}>{summary.product.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7A8C7F' }}>Interval Cycle:</span>
              <span style={{ fontWeight: 'bold' }}>{summary.freq}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7A8C7F' }}>Quantity / Drop:</span>
              <span style={{ fontWeight: 'bold' }}>{summary.qty} {summary.product.unit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7A8C7F' }}>Target Window:</span>
              <span style={{ fontWeight: 'bold' }}>{summary.time}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7A8C7F' }}>Duration:</span>
              <span style={{ fontWeight: 'bold' }}>{summary.duration} Days</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #EFEBE9', padding: '16px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2C3E2F' }}>Payment Accounting</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
            <span style={{ color: '#687B6E' }}>Lump Sum Cost ({summary.duration} days):</span>
            <span>₹{summary.priceTotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#2E7D32', fontWeight: 'bold', borderTop: '1px solid #E5DFD5', paddingTop: '8px' }}>
            <span>Advance Due Now:</span>
            <span>₹{summary.priceTotal}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #EFEBE9' }}>
        <button 
          onClick={onProceed}
          style={{ width: '100%', padding: '14px', borderRadius: '30px', backgroundColor: '#2E7D32', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px' }}
        >
          Confirm to Pay
        </button>
      </div>
    </div>
  );
};

// 7. PAYMENT CHECKOUT SCREEN
export const PaymentScreen: React.FC<{ 
  amount: number; 
  onBack: () => void;
  onSuccess: () => void;
}> = ({ amount, onBack, onSuccess }) => {
  const [gatewaySelected, setGatewaySelected] = useState('UPI');

  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #EFEBE9', backgroundColor: '#fff' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '18px', marginRight: '12px', cursor: 'pointer', color: '#2E7D32' }}>←</button>
        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2C3E2F' }}>Checkout Portal</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Billing Header */}
        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#EFEBE9', textAlign: 'center', border: '1px solid #D7CCC8' }}>
          <span style={{ fontSize: '11px', color: '#8D6E63', fontWeight: 'bold' }}>Secured payment via Razorpay Test mode</span>
          <h2 style={{ margin: '6px 0 0 0', color: '#2C3E2F' }}>₹{amount.toLocaleString('en-IN')}</h2>
        </div>

        {/* Gateways */}
        <h5 style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#2C3E2F' }}>Payment Method</h5>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { id: 'UPI', name: 'Google Pay / PhonePe (UPI)', icon: '📱' },
            { id: 'CARD', name: 'Credit or Debit Shell Cards', icon: '💳' },
            { id: 'BANKING', name: 'Net Banking', icon: '🏛️' },
            { id: 'WALLET', name: 'Other Wallets', icon: '💼' }
          ].map(gate => (
            <div 
              key={gate.id}
              onClick={() => setGatewaySelected(gate.id)}
              style={{ display: 'flex', alignItems: 'center', padding: '14px', borderRadius: '8px', border: gatewaySelected === gate.id ? '2px solid #2E7D32' : '1px solid #EFEBE9', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '20px', marginRight: '12px' }}>{gate.icon}</span>
              <span style={{ fontSize: '13px', color: '#2C3E2F', fontWeight: gatewaySelected === gate.id ? 'bold' : 'normal' }}>{gate.name}</span>
              <input 
                type="radio" 
                checked={gatewaySelected === gate.id} 
                onChange={() => {}}
                style={{ marginLeft: 'auto', accentColor: '#2E7D32' }} 
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#7A8C7F', fontSize: '11px', marginTop: '10px' }}>
          <span>🔒 PCI-DSS Compliant Gateway</span>
        </div>
      </div>

      <div style={{ padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #EFEBE9' }}>
        <button 
          onClick={onSuccess}
          style={{ width: '100%', padding: '14px', borderRadius: '30px', backgroundColor: '#4CAF50', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px' }}
        >
          Pay Securely Now
        </button>
      </div>
    </div>
  );
};
