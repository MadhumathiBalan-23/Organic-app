import React, { useState, useEffect } from 'react';
import { DollarSign, Package, Users, Clock, TrendingUp, FileText } from 'lucide-react';
import { Product, Order, UserLog, fetchKpiDataFromDB, fetchProductsFromDB, fetchOrdersFromDB, fetchUserLogsFromDB } from '../data/mockData';

const Dashboard: React.FC = () => {
  const [liveKpi, setLiveKpi] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    processingOrders: 0,
    lowStockProducts: 0
  });
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [liveLogs, setLiveLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchKpiDataFromDB().then(setLiveKpi),
      fetchProductsFromDB().then(setLiveProducts),
      fetchOrdersFromDB().then(setLiveOrders),
      fetchUserLogsFromDB().then(setLiveLogs)
    ]).finally(() => setLoading(false));
  }, []);

  const topProducts = [...liveProducts].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 5);
  const recentLogs = liveLogs.slice(0, 6);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'create': return 'green';
      case 'update': return 'gold';
      case 'delete': return 'red';
      case 'login': case 'logout': return 'blue';
      default: return 'blue';
    }
  };

  const recentOrders = [...liveOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const statusChip = (status: string) => {
    const map: Record<string, string> = {
      Pending: 'chip-warning', Processing: 'chip-info', Delivered: 'chip-success',
      Cancelled: 'chip-danger', Returned: 'chip-default',
    };
    return map[status] ?? 'chip-default';
  };

  const maxSales = Math.max(...topProducts.map(p => p.sales || 1), 1);

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card green">
          <div className="kpi-icon green"><DollarSign size={20} /></div>
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value">₹{(liveKpi.totalRevenue / 1000).toFixed(1)}K</div>
          <div className="kpi-change up">▲ Live from SQLite DB</div>
        </div>
        <div className="kpi-card gold">
          <div className="kpi-icon gold"><Package size={20} /></div>
          <div className="kpi-label">Total Orders</div>
          <div className="kpi-value">{liveKpi.totalOrders}</div>
          <div className="kpi-change up">▲ {liveKpi.pendingOrders} pending dispatch</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-icon blue"><Users size={20} /></div>
          <div className="kpi-label">Total Customers</div>
          <div className="kpi-value">{liveKpi.totalCustomers}</div>
          <div className="kpi-change up">▲ Active verified profiles</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-icon purple"><Clock size={20} /></div>
          <div className="kpi-label">Active Products</div>
          <div className="kpi-value">{liveKpi.totalProducts}</div>
          <div className="kpi-change up">
            {liveKpi.lowStockProducts > 0 ? (
              <span style={{ color: 'var(--color-danger)' }}>{liveKpi.lowStockProducts} low stock</span>
            ) : (
              'All in stock'
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
          Refreshing live metrics from backend API...
        </div>
      )}

      {/* Two Column Section */}
      <div className="dashboard-grid">
        {/* Left Column: Top Selling Products */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Top Selling Products</div>
              <div className="card-subtitle">Ranked by customer orders</div>
            </div>
            <span className="chip chip-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={12} /> Live API
            </span>
          </div>

          <div className="product-bars">
            {topProducts.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No product sales recorded yet.
              </div>
            ) : topProducts.map((p, idx) => (
              <div key={p.id} className="product-bar-item">
                <div className="product-bar-header">
                  <div className="product-bar-name">
                    <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>#{idx + 1}</span>
                    {p.name}
                  </div>
                  <div className="product-bar-sales">₹{p.price * (p.sales || 1)} · {p.sales} {p.unit}s</div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${((p.sales || 1) / maxSales) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Activity Logs */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Audit Trail & Activity</div>
              <div className="card-subtitle">Live system event log</div>
            </div>
            <span className="chip chip-default" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <FileText size={12} /> {liveLogs.length} events
            </span>
          </div>

          <div className="activity-list">
            {recentLogs.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No activity logs available.
              </div>
            ) : recentLogs.map(l => (
              <div key={l.id} className="activity-item">
                <div className={`activity-dot ${getLogColor(l.type)}`} />
                <div className="activity-content">
                  <div className="activity-text">
                    <strong>{l.user}</strong>: {l.action}
                  </div>
                  <div className="activity-time">
                    {new Date(l.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {l.module}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Recent Customer Orders</div>
            <div className="card-subtitle">Real-time orders received from mobile app</div>
          </div>
        </div>

        <div className="table-wrap">
          {recentOrders.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No orders found in database.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{o.id}</span></td>
                    <td><strong>{o.customerName}</strong></td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
                      </span>
                    </td>
                    <td><strong>₹{o.total.toLocaleString()}</strong></td>
                    <td><span className={`chip ${statusChip(o.status)}`}>{o.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(o.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
