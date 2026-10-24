import React, { useState, useEffect } from 'react';
import { Search, Eye, X, Package, MapPin, CreditCard, ShoppingCart } from 'lucide-react';
import { Order, fetchOrdersFromDB } from '../data/mockData';
import { updateOrderAPI } from '../services/api';

const statusChip = (s: string) => {
  const map: Record<string, string> = { Pending: 'chip-warning', Processing: 'chip-info', Delivered: 'chip-success', Cancelled: 'chip-danger', Returned: 'chip-default' };
  return map[s] ?? 'chip-default';
};

const Orders: React.FC = () => {
  const [items, setItems] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const dbOrders = await fetchOrdersFromDB();
      setItems(dbOrders);
    } catch (e) {
      console.error('Failed to load orders from API:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = items.filter(o => {
    const match = o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    return match && matchStatus;
  });

  const updateStatus = async (id: string, status: Order['status']) => {
    try {
      await updateOrderAPI(id, { status });
    } catch (e) {
      console.warn('API update order error:', e);
    }
    setItems(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null);
  };

  const totalRevenue = filtered.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Orders</div>
          <div className="page-subtitle">{filtered.length} orders · ₹{totalRevenue.toLocaleString()} delivered revenue</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-row" style={{ marginBottom: 20 }}>
        {[
          { label: 'All Orders', val: items.length, color: 'var(--text-primary)' },
          { label: 'Pending', val: items.filter(o=>o.status==='Pending').length, color: 'var(--color-warning)' },
          { label: 'Processing', val: items.filter(o=>o.status==='Processing').length, color: 'var(--color-info)' },
          { label: 'Delivered', val: items.filter(o=>o.status==='Delivered').length, color: 'var(--color-success)' },
          { label: 'Cancelled', val: items.filter(o=>o.status==='Cancelled').length, color: 'var(--color-danger)' },
        ].map(s => (
          <div key={s.label} className="stat-box">
            <div className="stat-box-val" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-box-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-bar">
          <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}><Search size={16} /></span>
          <input placeholder="Search order ID or customer name…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'].map(s => (
          <button key={s} className={`filter-chip${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrap">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading orders directly from live API...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShoppingCart size={36} style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }} />
            No orders found.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{o.id}</span></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.paymentMethod}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
                    </span>
                  </td>
                  <td><strong>₹{o.total.toLocaleString()}</strong></td>
                  <td>{new Date(o.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                  <td><span className={`chip ${statusChip(o.status)}`}>{o.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedOrder(o)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={12} /> View
                      </button>
                      <select
                        className="form-select"
                        value={o.status}
                        onChange={e => updateStatus(o.id, e.target.value as any)}
                        style={{ padding: '3px 8px', fontSize: 12, width: 'auto' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedOrder && (
        <>
          <div className="drawer-overlay" onClick={() => setSelectedOrder(null)} />
          <div className="detail-panel">
            <div className="detail-panel-header">
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>Order {selectedOrder.id}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(selectedOrder.date).toLocaleDateString('en-IN', { dateStyle: 'full' })}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrder(null)} style={{ padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <div className="detail-panel-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span className={`chip ${statusChip(selectedOrder.status)}`} style={{ fontSize: 12, padding: '4px 12px' }}>{selectedOrder.status}</span>
                <select
                  className="form-select"
                  value={selectedOrder.status}
                  onChange={e => updateStatus(selectedOrder.id, e.target.value as any)}
                  style={{ width: 'auto', padding: '4px 10px', fontSize: 12 }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Customer */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Customer Details</div>
                <div style={{ fontWeight: 600 }}>{selectedOrder.customerName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <MapPin size={12} /> {selectedOrder.address}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <CreditCard size={12} /> Paid via {selectedOrder.paymentMethod}
                </div>
              </div>

              {/* Items */}
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Items ({selectedOrder.items.length})</div>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid var(--color-border)' : 'none', fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Package size={14} color="var(--color-primary)" />
                      <span>{it.name} <span style={{ color: 'var(--text-muted)' }}>×{it.qty}</span></span>
                    </div>
                    <strong>₹{(it.price * it.qty).toLocaleString()}</strong>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--color-border)', marginTop: 12, paddingTop: 10, fontWeight: 800, fontSize: 15 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--color-primary)' }}>₹{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
