import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  mobileOpen: boolean;
}

const navItems = [
  { label: 'Dashboard', icon: '📊', to: '/', section: 'Main' },
  { label: 'Products', icon: '🌾', to: '/products', section: 'Catalogue' },
  { label: 'Categories', icon: '🏷️', to: '/categories', section: 'Catalogue' },
  { label: 'Brands', icon: '🌱', to: '/brands', section: 'Catalogue' },
  { label: 'Orders', icon: '📦', to: '/orders', section: 'Sales' },
  { label: 'Customers', icon: '👥', to: '/customers', section: 'Sales' },
  { label: 'User Logs', icon: '📋', to: '/logs', section: 'Admin' },
];

const sections = ['Main', 'Catalogue', 'Sales', 'Admin'];

const Sidebar: React.FC<SidebarProps> = ({ open, mobileOpen, onClose }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <nav
        className={`admin-sidebar${!open && !isMobile ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}
        style={{ overflow: 'hidden' }}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">
            <div className="sidebar-brand-icon">🌿</div>
            <div>
              <div className="sidebar-brand-name">AgriFlow AI</div>
              <div className="sidebar-brand-sub">Admin Portal</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          {sections.map(section => (
            <div key={section}>
              <div className="sidebar-section-label">{section}</div>
              {navItems
                .filter(item => item.section === section)
                .map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `sidebar-item${isActive ? ' active' : ''}`
                    }
                    onClick={() => { if (mobileOpen) onClose(); }}
                  >
                    <span className="sidebar-item-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-avatar">JA</div>
          <div className="sidebar-footer-info">
            <div className="sidebar-footer-name">Jeena Admin</div>
            <div className="sidebar-footer-role">Super Admin</div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
