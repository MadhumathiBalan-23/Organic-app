import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  Award,
  ShoppingCart,
  Users,
  FileText,
  Sprout
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  mobileOpen: boolean;
}

const navItems = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, to: '/', section: 'Main' },
  { label: 'Products', icon: <Package size={18} />, to: '/products', section: 'Catalogue' },
  { label: 'Categories', icon: <Tags size={18} />, to: '/categories', section: 'Catalogue' },
  { label: 'Brands', icon: <Award size={18} />, to: '/brands', section: 'Catalogue' },
  { label: 'Orders', icon: <ShoppingCart size={18} />, to: '/orders', section: 'Sales' },
  { label: 'Customers', icon: <Users size={18} />, to: '/customers', section: 'Sales' },
  { label: 'User Logs', icon: <FileText size={18} />, to: '/logs', section: 'Admin' },
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
            <div className="sidebar-brand-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sprout size={20} color="#10B981" />
            </div>
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
                    <span className="sidebar-item-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>{item.icon}</span>
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
