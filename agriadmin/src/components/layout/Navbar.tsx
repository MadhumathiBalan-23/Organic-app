import React from 'react';
import { useLocation } from 'react-router-dom';

interface NavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '📊 Dashboard', subtitle: 'Overview of your agri business' },
  '/products': { title: '🌾 Products', subtitle: 'Manage your product catalogue' },
  '/categories': { title: '🏷️ Categories', subtitle: 'Organise products by category' },
  '/brands': { title: '🌱 Brands', subtitle: 'Manage partner brands & suppliers' },
  '/orders': { title: '📦 Orders', subtitle: 'Track and manage customer orders' },
  '/customers': { title: '👥 Customers', subtitle: 'Customer profiles and purchase history' },
  '/logs': { title: '📋 User Logs', subtitle: 'Activity and audit trail' },
};

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const info = pageTitles[location.pathname] ?? { title: 'AgriFlow AI', subtitle: 'Admin Panel' };
  const now = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className="admin-navbar">
      {/* Hamburger */}
      <button
        className="navbar-hamburger"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        id="nav-toggle-btn"
      >
        ☰
      </button>

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="navbar-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {info.title}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{info.subtitle}</div>
      </div>

      {/* Right actions */}
      <div className="navbar-actions">
        {/* Date — hidden on small mobile */}
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}
              className="hide-sm">
          {now}
        </span>

        {/* Notification */}
        <button className="navbar-icon-btn" aria-label="Notifications">
          🔔
          <span className="navbar-badge">3</span>
        </button>

        {/* Settings */}
        <button className="navbar-icon-btn" aria-label="Settings">⚙️</button>

        {/* Avatar */}
        <div className="navbar-avatar" title="Jeena Admin">JA</div>
      </div>
    </header>
  );
};

export default Navbar;
