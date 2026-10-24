import React, { useState, useEffect } from 'react';
import { User, MapPin, ArrowLeft, Check, X } from 'lucide-react';
import { fetchOrdersFromDB, fetchDeliveriesFromDB } from '../../data/mockData';

// 12. CUSTOMER ORDER HISTORY SCREEN
export const CustomerOrderHistoryScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrdersFromDB().then(data => {
      if (data && Array.isArray(data)) setOrders(data);
    });
  }, []);

  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #EFEBE9', backgroundColor: '#fff' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', marginRight: '12px', cursor: 'pointer', color: '#2E7D32', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </button>
        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2C3E2F' }}>Order Archives</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {orders.map(ord => (
          <div 
            key={ord.id}
            style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid #EFEBE9' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E5DFD5', paddingBottom: '8px', marginBottom: '8px', fontSize: '11px' }}>
              <span style={{ fontWeight: 'bold', color: '#2E7D32' }}>{ord.id}</span>
              <span style={{ color: '#888' }}>{ord.date}</span>
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#2C3E2F' }}>
              {Array.isArray(ord.items) ? ord.items.map((i: any) => `${i.name} (${i.qty})`).join(', ') : (ord.products || 'Organic Farm Produce')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#2E7D32' }}>₹{ord.total}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#E8F5E9', color: '#2E7D32', fontWeight: 'bold' }}>
                  {ord.status}
                </span>
                <button style={{ padding: '2px 10px', borderRadius: '4px', fontSize: '10px', border: '1px solid #2E7D32', backgroundColor: '#fff', color: '#2E7D32', cursor: 'pointer' }}>
                  Reorder
                </button>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', padding: '30px', fontSize: '13px' }}>
            No orders found in history.
          </div>
        )}
      </div>
    </div>
  );
};

// 13. PAYMENT HISTORY SCREEN
export const PaymentHistoryScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchOrdersFromDB().then(data => {
      if (data && Array.isArray(data)) {
        setTransactions(data.map((o: any) => ({
          id: `TXN-${o.id}`,
          date: o.date,
          method: o.paymentMethod || 'UPI',
          amount: o.total,
          status: 'SUCCESS'
        })));
      }
    });
  }, []);

  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #EFEBE9', backgroundColor: '#fff' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', marginRight: '12px', cursor: 'pointer', color: '#2E7D32', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </button>
        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2C3E2F' }}>Billing History</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {transactions.map(tx => (
          <div 
            key={tx.id}
            style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '12px', border: '1px solid #EFEBE9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <h5 style={{ margin: '0', fontSize: '12px', color: '#2C3E2F' }}>{tx.id}</h5>
              <span style={{ fontSize: '10px', color: '#888' }}>{tx.date} | {tx.method}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#2E7D32', display: 'block' }}>₹{tx.amount}</span>
              <span style={{ fontSize: '9px', color: '#4CAF50', fontWeight: 'bold' }}>{tx.status}</span>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', padding: '30px', fontSize: '13px' }}>
            No payment transactions recorded.
          </div>
        )}
      </div>
    </div>
  );
};

// 14. CUSTOMER PROFILE SCREEN
export const CustomerProfileScreen: React.FC<{ 
  onBack: () => void;
  onNavigateWelcome: () => void;
}> = ({ onBack, onNavigateWelcome }) => {
  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #EFEBE9', backgroundColor: '#fff' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', marginRight: '12px', cursor: 'pointer', color: '#2E7D32', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </button>
        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2C3E2F' }}>My Farm Profile</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* User Card */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #EFEBE9' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '30px', backgroundColor: '#EFEBE9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={28} color="#8D6E63" />
          </div>
          <div>
            <h4 style={{ margin: '0', fontSize: '15px', color: '#2C3E2F' }}>Ananya Sharma</h4>
            <span style={{ fontSize: '11px', color: '#888' }}>+91 98765 43210</span>
          </div>
        </div>

        {/* Address Cards */}
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid #EFEBE9' }}>
          <h5 style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#2C3E2F', display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={13} /> Delivery Address
          </h5>
          <p style={{ margin: '0', fontSize: '11px', color: '#666', lineHeight: 1.4 }}>Flat 402, Green Glen Layout, Outer Ring Road, Bangalore - 560103</p>
        </div>

        {/* Settings Links */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid #EFEBE9', backgroundColor: '#fff', overflow: 'hidden' }}>
          {['Edit Profile Info', 'Address Settings', 'Manage Notification Alarms', 'FARM Help & Support'].map((link, i) => (
            <div 
              key={i}
              style={{ padding: '12px 16px', fontSize: '12px', borderBottom: i === 3 ? 'none' : '1px solid #EFEBE9', color: '#2C3E2F', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
            >
              <span>{link}</span>
              <span style={{ color: '#ccc' }}>&gt;</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button 
          onClick={onNavigateWelcome}
          style={{ width: '100%', padding: '12px', borderRadius: '24px', border: '1px solid #E53935', backgroundColor: 'transparent', color: '#E53935', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', marginTop: '20px' }}
        >
          Logout Account
        </button>
      </div>
    </div>
  );
};

// 20. DELIVERY STAFF SCREEN
export const DeliveryStaffScreen: React.FC<{ onNavigateWelcome: () => void }> = ({ onNavigateWelcome }) => {
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    fetchDeliveriesFromDB().then(data => {
      if (data && Array.isArray(data)) setDeliveries(data);
    });
  }, []);

  const updateDeliveryStatus = (id: string, s: string) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: s } : d));
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '16px', backgroundColor: '#EFEBE9', borderBottom: '1px solid #D7CCC8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '10px', color: '#8D6E63', fontWeight: 'bold' }}>DELIVERY PORTAL</span>
          <h4 style={{ margin: '0', fontSize: '14px', color: '#2C3E2F' }}>Rider: Ramesh Kumar</h4>
        </div>
        <button onClick={onNavigateWelcome} style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '10px', cursor: 'pointer' }}>Exit</button>
      </div>

      {/* Main List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h5 style={{ margin: '0', color: '#2C3E2F' }}>Today's Appointed Tasks</h5>
        
        {deliveries.map(d => (
          <div 
            key={d.id}
            style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #EFEBE9', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E5DFD5', paddingBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#8D6E63' }}>Drop Time: {d.deliveryTime}</span>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: d.status === 'Delivered' ? '#E8F5E9' : '#FFF3E0', color: d.status === 'Delivered' ? '#2E7D32' : '#E65100', fontWeight: 'bold' }}>
                {d.status}
              </span>
            </div>

            <div style={{ fontSize: '12px' }}>
              <h5 style={{ margin: '0 0 2px 0', color: '#2C3E2F' }}>{d.customerName}</h5>
              <p style={{ margin: '0 0 8px 0', fontSize: '10px', color: '#777', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} /> {d.address}
              </p>
              <p style={{ margin: '0', fontWeight: 'bold', color: '#2E7D32' }}>Items: {d.products}</p>
            </div>

            {d.status !== 'Delivered' && d.status !== 'Failed' && (
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <button 
                  onClick={() => updateDeliveryStatus(d.id, 'Delivered')}
                  style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', backgroundColor: '#4CAF50', color: '#fff', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <Check size={13} /> Delivered
                </button>
                <button 
                  onClick={() => updateDeliveryStatus(d.id, 'Failed')}
                  style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', backgroundColor: '#E53935', color: '#fff', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <X size={13} /> Failed
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
