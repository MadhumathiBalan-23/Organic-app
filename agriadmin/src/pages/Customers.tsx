import React, { useState, useEffect } from 'react';
import { Search, MapPin, Crown, X, Phone, Calendar, Clock, Tag, ShoppingCart, Package, CheckCircle2, XCircle, CreditCard, Users } from 'lucide-react';
import { Customer, Order, fetchCustomersFromDB, getCustomerOrders } from '../data/mockData';

const statusChip = (status: string) => {
  const map: Record<string, string> = { Active: 'chip-success', Inactive: 'chip-danger', VIP: 'chip-purple' };
  return map[status] ?? 'chip-default';
};

const orderStatusChip = (status: string) => {
  const map: Record<string, string> = { Pending: 'chip-warning', Processing: 'chip-info', Delivered: 'chip-success', Cancelled: 'chip-danger', Returned: 'chip-default' };
  return map[status] ?? 'chip-default';
};

const Customers: React.FC = () => {
  const [items, setItems] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCustomersFromDB().then(dbCustomers => {
      setItems(dbCustomers);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      getCustomerOrders(selectedCustomer.id).then(setCustomerOrders);
    } else {
      setCustomerOrders([]);
    }
  }, [selectedCustomer]);

  const filtered = items.filter(c => {
    const match = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    return match && matchStatus;
  });

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
          <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}><Search size={16} /></span>
          <input placeholder="Search name, email, location…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['All', 'Active', 'VIP', 'Inactive'].map(s => (
          <button key={s} className={`filter-chip${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrap">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading customers directly from live API...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={36} style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }} />
            No customers found.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Orders</th>
                <th>Spend</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedCustomer(c)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar">{c.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                          {c.name}
                          {c.status === 'VIP' && <Crown size={14} color="#a855f7" />}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Joined {c.joinDate}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{c.phone}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.email}</div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} color="var(--color-primary)" /> {c.location}
                    </span>
                  </td>
                  <td><strong>{c.totalOrders}</strong></td>
                  <td><strong>₹{c.totalSpend.toLocaleString()}</strong></td>
                  <td><span className={`chip ${statusChip(c.status)}`}>{c.status}</span></td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={e => { e.stopPropagation(); setSelectedCustomer(c); }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    >
                      <ShoppingCart size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <>
          <div className="drawer-overlay" onClick={() => setSelectedCustomer(null)} />
          <div className="detail-panel">
            <div className="detail-panel-header">
              <div className="avatar" style={{ width: 44, height: 44, fontSize: 16 }}>{selectedCustomer.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {selectedCustomer.name}
                  {selectedCustomer.status === 'VIP' && <Crown size={15} color="#a855f7" />}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedCustomer.email}</div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedCustomer(null)}
                style={{ padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              ><X size={18} /></button>
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
                  { icon: <MapPin size={13} />, label: 'Location', value: selectedCustomer.location },
                  { icon: <Phone size={13} />, label: 'Phone', value: selectedCustomer.phone },
                  { icon: <Calendar size={13} />, label: 'Joined', value: new Date(selectedCustomer.joinDate).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
                  { icon: <Clock size={13} />, label: 'Last Active', value: selectedCustomer.lastActive },
                  { icon: <Tag size={13} />, label: 'Status', value: selectedCustomer.status },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {row.icon} {row.label}
                    </span>
                    <span style={{ fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Order History Timeline */}
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShoppingCart size={15} color="var(--color-primary)" /> Order History ({customerOrders.length})
              </div>
              {customerOrders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><Package size={36} color="var(--text-muted)" /></div>
                  <div className="empty-state-text">No orders yet</div>
                </div>
              ) : (
                <div className="timeline">
                  {customerOrders.map(order => (
                    <div key={order.id} className="timeline-item">
                      <div className={`timeline-dot ${order.status === 'Delivered' ? 'chip-success' : order.status === 'Cancelled' ? 'chip-danger' : 'chip-warning'}`}
                        style={{
                          background: order.status === 'Delivered' ? 'rgba(34,197,94,0.2)' : order.status === 'Cancelled' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                        {order.status === 'Delivered' ? <CheckCircle2 size={13} color="var(--color-success)" /> : order.status === 'Cancelled' ? <XCircle size={13} color="var(--color-danger)" /> : <Clock size={13} color="var(--color-warning)" />}
                      </div>
                      <div className="timeline-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div className="timeline-title">{order.id}</div>
                            <div className="timeline-sub">
                              {order.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
                            </div>
                            <div className="timeline-sub" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                              <CreditCard size={11} /> {order.paymentMethod}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>₹{order.total.toLocaleString()}</div>
                            <span className={`chip ${orderStatusChip(order.status)}`} style={{ fontSize: 10 }}>{order.status}</span>
                          </div>
                        </div>
                        <div className="timeline-date" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <Calendar size={11} /> {new Date(order.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </div>
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
