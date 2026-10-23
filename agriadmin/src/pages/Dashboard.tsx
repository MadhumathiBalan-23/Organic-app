import React, { useState, useEffect } from 'react';
import { kpiData, products, orders, userLogs, fetchKpiDataFromDB, fetchProductsFromDB, fetchOrdersFromDB, fetchUserLogsFromDB } from '../data/mockData';

const Dashboard: React.FC = () => {
  const [liveKpi, setLiveKpi] = useState(kpiData);
  const [liveProducts, setLiveProducts] = useState(products);
  const [liveOrders, setLiveOrders] = useState(orders);
  const [liveLogs, setLiveLogs] = useState(userLogs);

  useEffect(() => {
    fetchKpiDataFromDB().then(setLiveKpi);
    fetchProductsFromDB().then(setLiveProducts);
    fetchOrdersFromDB().then(setLiveOrders);
    fetchUserLogsFromDB().then(setLiveLogs);
  }, []);

  const topProducts = [...liveProducts].sort((a, b) => b.sales - a.sales).slice(0, 5);
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

  const maxSales = Math.max(...topProducts.map(p => p.sales || 1));

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card green">
          <div className="kpi-icon green">💰</div>
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value">₹{(liveKpi.totalRevenue / 1000).toFixed(0)}K</div>
          <div className="kpi-change up">▲ 18.4% vs last month</div>
        </div>
        <div className="kpi-card gold">
          <div className="kpi-icon gold">📦</div>
          <div className="kpi-label">Total Orders</div>
          <div className="kpi-value">{liveKpi.totalOrders}</div>
          <div className="kpi-change up">▲ 7 new today</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-icon blue">👥</div>
          <div className="kpi-label">Total Customers</div>
          <div className="kpi-value">{liveKpi.totalCustomers}</div>
          <div className="kpi-change up">▲ 3 this week</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-icon red">⏳</div>
          <div className="kpi-label">Pending Orders</div>
          <div className="kpi-value">{liveKpi.pendingOrders}</div>
          <div className="kpi-change down">⚠ Needs attention</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-icon purple">🌾</div>
          <div className="kpi-label">Low Stock Items</div>
          <div className="kpi-value">{liveKpi.lowStockProducts}</div>
          <div className="kpi-change down">▼ Restock needed</div>
        </div>
      </div>

      {/* Two-column section */}
      <div className="two-col" style={{ marginBottom: '24px' }}>
        {/* Top Selling Products */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>🔥 Top Selling Products</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>Based on units sold</div>
            </div>
            <span className="chip chip-success">Live Data</span>
          </div>
          <div className="bar-chart">
            {topProducts.map(p => (
              <div key={p.id} className="bar-item">
                <div className="bar-info">
                  <span>{p.emoji} {p.name}</span>
                  <span style={{ fontWeight: 700 }}>₹{(p.price * p.sales).toLocaleString()}</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(p.sales / maxSales) * 100}%`,
                      background: 'linear-gradient(90deg, var(--color-primary-light), var(--color-accent))'
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.sales} {p.unit} sold</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '18px' }}>📦 Recent Orders</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentOrders.map(order => (
              <div key={order.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 10, background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{order.id}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.customerName} · {order.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>₹{order.total.toLocaleString()}</div>
                  <span className={`chip ${statusChip(order.status)}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '18px' }}>📋 Recent Admin Activity</div>
        <div>
          {recentLogs.map(log => (
            <div key={log.id} className="log-row">
              <div className={`log-dot ${getLogColor(log.type)}`} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{log.action}</div>
                <div className="log-meta">
                  {log.user} · {log.module} · {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
              <span className={`chip ${log.role === 'Admin' ? 'chip-success' : 'chip-info'}`}>{log.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
