import React, { useState, useEffect } from 'react';
import { customers, getCustomerOrders, Customer, fetchCustomersFromDB } from '../data/mockData';

const statusChip = (status: string) => {
  const map: Record<string, string> = { Active: 'chip-success', Inactive: 'chip-danger', VIP: 'chip-purple' };
  return map[status] ?? 'chip-default';
};

const orderStatusChip = (status: string) => {
  const map: Record<string, string> = { Pending: 'chip-warning', Processing: 'chip-info', Delivered: 'chip-success', Cancelled: 'chip-danger', Returned: 'chip-default' };
  return map[status] ?? 'chip-default';
};

const Customers: React.FC = () => {
  const [items, setItems] = useState<Customer[]>(customers);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomersFromDB().then(dbCustomers => {
      if (dbCustomers && dbCustomers.length > 0) {
        setItems(dbCustomers);
      }
    });
  }, []);

  const filtered = items.filter(c => {
    const match = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    return match && matchStatus;
  });

  const customerOrders = selectedCustomer ? getCustomerOrders(selectedCustomer.id) : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Customers</div>
          <div className="page-subtitle">{items.length} registered customers · {items.filter(c => c.status === 'VIP').length} VIP</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input placeholder="Search name, email, location…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['All', 'Active', 'VIP', 'Inactive'].map(s => (
          <button key={s} className={`filter-chip${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Joined</th>
              <th>Orders</th>
              <th>Spend</th>
              <th>Status</th>
              <th>History</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'linear-gradient(135deg,var(--color-primary-light),var(--color-accent))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0
                    }}>{c.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last active {c.lastActive}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: 12 }}>{c.email}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.phone}</div>
                </td>
                <td style={{ fontSize: 13 }}>📍 {c.location}</td>
                <td style={{ fontSize: 13 }}>{new Date(c.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td style={{ fontWeight: 700, textAlign: 'center' }}>{c.totalOrders}</td>
                <td style={{ fontWeight: 700 }}>₹{c.totalSpend.toLocaleString()}</td>
                <td><span className={`chip ${statusChip(c.status)}`}>{c.status === 'VIP' ? '👑 VIP' : c.status}</span></td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedCustomer(c)} id={`customer-detail-${c.id}`}>
                    📋 View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Detail Panel */}
      {selectedCustomer && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 499, backdropFilter: 'blur(2px)' }}
            onClick={() => setSelectedCustomer(null)}
          />
          <div className="detail-panel">
            <div className="detail-panel-header">
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--color-primary),var(--color-accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0
              }}>{selectedCustomer.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {selectedCustomer.name}
                  {selectedCustomer.status === 'VIP' && ' 👑'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedCustomer.email}</div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedCustomer(null)}
                style={{ fontSize: 18 }}
              >✕</button>
            </div>

            <div className="detail-panel-body">
              {/* Quick Stats */}
              <div className="stat-row">
                <div className="stat-box">
                  <div className="stat-box-val" style={{ color: 'var(--color-primary)' }}>{selectedCustomer.totalOrders}</div>
                  <div className="stat-box-lbl">Orders</div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-val" style={{ color: 'var(--color-accent-dark)' }}>₹{(selectedCustomer.totalSpend / 1000).toFixed(1)}K</div>
                  <div className="stat-box-lbl">Total Spend</div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-val" style={{ color: 'var(--color-info)' }}>
                    ₹{Math.round(selectedCustomer.totalSpend / Math.max(selectedCustomer.totalOrders, 1))}
                  </div>
                  <div className="stat-box-lbl">Avg Order</div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Customer Info</div>
                {[
                  { label: '📍 Location', value: selectedCustomer.location },
                  { label: '📞 Phone', value: selectedCustomer.phone },
                  { label: '📅 Joined', value: new Date(selectedCustomer.joinDate).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
                  { label: '🕐 Last Active', value: selectedCustomer.lastActive },
                  { label: '🏷️ Status', value: selectedCustomer.status },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                    <span style={{ fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Order History Timeline */}
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>🛒 Order History ({customerOrders.length})</div>
              {customerOrders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📦</div>
                  <div className="empty-state-text">No orders yet</div>
                </div>
              ) : (
                <div className="timeline">
                  {customerOrders.map(order => (
                    <div key={order.id} className="timeline-item">
                      <div className={`timeline-dot ${order.status === 'Delivered' ? 'chip-success' : order.status === 'Cancelled' ? 'chip-danger' : 'chip-warning'}`}
                        style={{
                          background: order.status === 'Delivered' ? 'rgba(34,197,94,0.2)' : order.status === 'Cancelled' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'
                        }}>
                        {order.status === 'Delivered' ? '✅' : order.status === 'Cancelled' ? '❌' : '⏳'}
                      </div>
                      <div className="timeline-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div className="timeline-title">{order.id}</div>
                            <div className="timeline-sub">
                              {order.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
                            </div>
                            <div className="timeline-sub">💳 {order.paymentMethod}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>₹{order.total.toLocaleString()}</div>
                            <span className={`chip ${orderStatusChip(order.status)}`} style={{ fontSize: 10 }}>{order.status}</span>
                          </div>
                        </div>
                        <div className="timeline-date">📅 {new Date(order.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Customers;
