import React, { useState, useEffect } from 'react';
import { Search, MapPin, Crown, X, Phone, Calendar, Clock, Tag, ShoppingCart, Package, CheckCircle2, XCircle, CreditCard, Users, Sprout, ShieldCheck, RefreshCw } from 'lucide-react';
import { Customer, Order, fetchCustomersFromDB, getCustomerOrders } from '../data/mockData';
import { getVendorRequestsAPI, approveVendorAPI, rejectVendorAPI } from '../services/api';

const statusChip = (status: string) => {
  const map: Record<string, string> = { Active: 'chip-success', Inactive: 'chip-danger', VIP: 'chip-purple' };
  return map[status] ?? 'chip-default';
};

const orderStatusChip = (status: string) => {
  const map: Record<string, string> = { Pending: 'chip-warning', Processing: 'chip-info', Delivered: 'chip-success', Cancelled: 'chip-danger', Returned: 'chip-default' };
  return map[status] ?? 'chip-default';
};

const Customers: React.FC = () => {
  const [pageTab, setPageTab] = useState<'CUSTOMERS' | 'VENDOR_REQUESTS'>('CUSTOMERS');
  const [items, setItems] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Vendor Requests State
  const [vendorRequests, setVendorRequests] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [vendorFilter, setVendorFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadVendors = async () => {
    setLoadingVendors(true);
    try {
      const data = await getVendorRequestsAPI();
      setVendorRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVendors(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCustomersFromDB().then(dbCustomers => {
      setItems(dbCustomers);
      setLoading(false);
    }).catch(() => setLoading(false));

    loadVendors();
  }, []);

  const handleApprove = async (id: string, phone: string, farm: string) => {
    try {
      await approveVendorAPI(id);
      setActionSuccessMsg(`Vendor approved! Mobile number +91 ${phone} (${farm}) now has full Vendor Console access.`);
      setTimeout(() => setActionSuccessMsg(null), 5000);
      loadVendors();
    } catch (err: any) {
      alert(err.message || 'Approval failed.');
    }
  };

  const handleReject = async (id: string, phone: string) => {
    const reason = prompt(`Enter rejection note for vendor +91 ${phone}:`, 'Missing farm organic certification');
    if (reason === null) return;
    try {
      await rejectVendorAPI(id, reason);
      setActionSuccessMsg(`Vendor request for +91 ${phone} rejected.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      loadVendors();
    } catch (err: any) {
      alert(err.message || 'Rejection failed.');
    }
  };

  const pendingCount = vendorRequests.filter(r => r.status === 'PENDING').length;

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

  const filteredVendors = vendorRequests.filter(r => {
    const matchStatus = vendorFilter === 'ALL' || r.status === vendorFilter;
    const matchSearch = !search ||
      r.phoneNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.userName?.toLowerCase().includes(search.toLowerCase()) ||
      r.farmName?.toLowerCase().includes(search.toLowerCase()) ||
      r.farmLocation?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title">
            {pageTab === 'CUSTOMERS' ? 'Customers & Accounts' : 'Vendor Partner Approvals'}
          </div>
          <div className="page-subtitle">
            {pageTab === 'CUSTOMERS'
              ? `${items.length} registered customers · ${items.filter(c => c.status === 'VIP').length} VIP`
              : `${vendorRequests.length} total applications · ${pendingCount} awaiting approval`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn ${pageTab === 'CUSTOMERS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setPageTab('CUSTOMERS')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Users size={16} /> Customers Directory
          </button>
          <button
            className={`btn ${pageTab === 'VENDOR_REQUESTS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setPageTab('VENDOR_REQUESTS'); loadVendors(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Sprout size={16} /> Vendor Approvals
            {pendingCount > 0 && (
              <span style={{ backgroundColor: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 10, padding: '2px 7px', marginLeft: 4 }}>
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '12px 16px', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ── TAB 1: CUSTOMERS DIRECTORY ── */}
      {pageTab === 'CUSTOMERS' && (
        <>
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
        </>
      )}

      {/* ── TAB 2: VENDOR PARTNER APPROVALS ── */}
      {pageTab === 'VENDOR_REQUESTS' && (
        <>
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 16px', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={16} color="#059669" />
              Phone-Verified Vendor Access Policy
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
              Only applicants approved by Admin can access the Vendor Panel in the mobile app. Approving an applicant below instantly unlocks the Farmer Console for their specific 10-digit mobile number.
            </div>
          </div>

          <div className="filter-bar">
            <div className="search-bar">
              <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}><Search size={16} /></span>
              <input placeholder="Search phone, applicant, farm name, location…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
              <button
                key={s}
                className={`filter-chip${vendorFilter === s ? ' active' : ''}`}
                onClick={() => setVendorFilter(s)}
              >
                {s === 'PENDING' ? `Pending (${pendingCount})` : s}
              </button>
            ))}
            <button
              className="btn btn-secondary btn-sm"
              onClick={loadVendors}
              style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div className="table-wrap">
            {loadingVendors ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading vendor applications from database...
              </div>
            ) : filteredVendors.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Sprout size={36} style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }} />
                No vendor applications matching filter.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Registered Phone</th>
                    <th>Applicant & Farm</th>
                    <th>Location</th>
                    <th>Crop Types</th>
                    <th>Experience / Cert</th>
                    <th>Status</th>
                    <th>Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map(req => {
                    const isApproved = req.status === 'APPROVED';
                    const isPending = req.status === 'PENDING';
                    return (
                      <tr key={req.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#0F172A' }}>
                            <Phone size={13} color="#059669" />
                            +91 {req.phoneNumber}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Sprout size={14} color="#059669" />
                            {req.farmName}
                          </div>
                          <div style={{ fontSize: 12, color: '#475569' }}>
                            Applicant: <strong>{req.userName || 'Farmer Partner'}</strong>
                          </div>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                            <MapPin size={12} color="var(--color-primary)" />
                            {req.farmLocation}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, maxWidth: 180 }}>
                          {req.cropCategories || 'Organic Vegetables & Dairy'}
                        </td>
                        <td>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{req.experienceYears || '3'} Years</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{req.certificateNo || 'TN-ORG-VERIFIED'}</div>
                        </td>
                        <td>
                          <span className={`chip ${isApproved ? 'chip-success' : isPending ? 'chip-warning' : 'chip-danger'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          {isPending ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                className="btn btn-sm"
                                style={{ backgroundColor: '#059669', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                onClick={() => handleApprove(req.id, req.phoneNumber, req.farmName)}
                              >
                                <CheckCircle2 size={13} /> Approve Vendor
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ color: '#EF4444', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                onClick={() => handleReject(req.id, req.phoneNumber)}
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </div>
                          ) : isApproved ? (
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={13} /> Active for +91 {req.phoneNumber}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: '#EF4444' }}>
                              Rejected
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

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
