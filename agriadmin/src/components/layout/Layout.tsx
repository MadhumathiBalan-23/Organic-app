import React, { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);    // desktop collapsed state
  const [mobileOpen, setMobileOpen] = useState(false);     // mobile overlay state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleToggle = useCallback(() => {
    if (isMobile) {
      setMobileOpen(prev => !prev);
    } else {
      setSidebarOpen(prev => !prev);
    }
  }, [isMobile]);

  const handleClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <div className="admin-shell">
      <Sidebar
        open={sidebarOpen}
        mobileOpen={mobileOpen}
        onClose={handleClose}
      />
      <div className="admin-main">
        <Navbar sidebarOpen={isMobile ? mobileOpen : sidebarOpen} onToggleSidebar={handleToggle} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
