import React, { useState } from 'react';
import { orders, Order } from '../data/mockData';

const statusChip = (s: string) => {
  const map: Record<string, string> = { Pending: 'chip-warning', Processing: 'chip-info', Delivered: 'chip-success', Cancelled: 'chip-danger', Returned: 'chip-default' };
  return map[s] ?? 'chip-default';
};

const Orders: React.FC = () => {
  const [items, setItems] = useState<Order[]>(orders);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = items.filter(o => {
    const match = o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    return match && matchStatus;
  });

  const updateStatus = (id: string, status: Order['status']) => {
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

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input placeholder="Search order ID or customer…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['All', 'Pending', 'Processing', 'Delivered', 'Cancelled', 'Returned'].map(s => (
          <button key={s} className={`filter-chip${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order.id}>
                <td style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: 13 }}>{order.id}</td>
                <td style={{ fontSize: 13, fontWeight: 600 }}>{order.customerName}</td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 180 }}>
                  {order.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
                </td>
                <td style={{ fontWeight: 700 }}>₹{order.total.toLocaleString()}</td>
                <td><span className="chip chip-default">{order.paymentMethod}</span></td>
                <td style={{ fontSize: 13 }}>{new Date(order.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                <td><span className={`chip ${statusChip(order.status)}`}>{order.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrder(order)}>👁️</button>
                    {order.status === 'Pending' && (
                      <button className="btn btn-primary btn-sm" onClick={() => updateStatus(order.id, 'Processing')}>Process</button>
                    )}
                    {order.status === 'Processing' && (
                      <button className="btn btn-accent btn-sm" onClick={() => updateStatus(order.id, 'Delivered')}>Deliver</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">📦 {selectedOrder.id}</div>
                <span className={`chip ${statusChip(selectedOrder.status)}`}>{selectedOrder.status}</span>
              </div>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <div className="form-label" style={{ marginBottom: 8 }}>Customer</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedOrder.customerName}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>📍 {selectedOrder.address}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>💳 {selectedOrder.paymentMethod}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>📅 {new Date(selectedOrder.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: 8 }}>Update Status</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['Pending','Processing','Delivered','Cancelled'] as Order['status'][]).map(s => (
                    <button
                      key={s}
                      className={`btn btn-sm ${selectedOrder.status === s ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div className="form-label" style={{ marginBottom: 10 }}>Order Items</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, i) => (
                      <tr key={i}>
                        <td style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</td>
                        <td>{item.qty}</td>
                        <td>₹{item.price}</td>
                        <td style={{ fontWeight: 700 }}>₹{item.qty * item.price}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-secondary)' }}>Total</td>
                      <td style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-primary)' }}>₹{selectedOrder.total.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
