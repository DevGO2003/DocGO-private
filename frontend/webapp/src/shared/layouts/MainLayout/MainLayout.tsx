import { useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: (collapsed: boolean) => void;
}

export const MainLayout = ({
  children,
  showSidebar = true,
  showHeader = true,
  sidebarCollapsed = false,
  onSidebarToggle,
}: MainLayoutProps) => {
  console.log('[MainLayout] Rendering, showHeader:', showHeader);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(sidebarCollapsed);
  const COLLAPSE_STORAGE_KEY = 'sidebar_collapsed';

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(COLLAPSE_STORAGE_KEY) : null;
      if (saved != null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onSidebarToggle?.(collapsed);
    try {
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(collapsed));
    } catch {}
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 flex">
      {/* Sidebar */}
      {showSidebar && (
        <>
          {/* Mobile overlay */}
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75 transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <motion.div
            initial={false}
            animate={{
              x: isSidebarOpen || window.innerWidth >= 1024 ? 0 : -256,
              width: isCollapsed && window.innerWidth >= 1024 ? 64 : 256
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-y-0 left-0 z-50 bg-white shadow-lg"
          >
            <Sidebar 
              collapsed={isCollapsed}
              onCollapseToggle={() => handleSidebarCollapse(!isCollapsed)}
              onClose={() => setIsSidebarOpen(false)}
            />
          </motion.div>
        </>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${showSidebar ? (isCollapsed ? 'ml-16' : 'ml-64') : ''}`}>
        {/* Header */}
        {showHeader && (
          <Header
            onMenuToggle={handleSidebarToggle}
            showSearch={true}
            showNotifications={true}
            showUserMenu={true}
          />
        )}

        {/* Page Content - internal scroll only */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto"
        >
          {children}
        </motion.main>
      </div>

      {/* Desktop collapse toggle handle */}
      {showSidebar && (
        <motion.button
          initial={false}
          animate={{
            left: isCollapsed ? 16 : 256 - 16
          }}
          type="button"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          onClick={() => handleSidebarCollapse(!isCollapsed)}
          className="hidden lg:flex items-center justify-center fixed top-24 z-50 h-8 w-8 rounded-full border-2 border-gray-300 bg-white shadow-md hover:shadow-lg transition-all hover:scale-110"
        >
          <span className="text-sm font-bold text-gray-700">{isCollapsed ? '>' : '<'}</span>
        </motion.button>
      )}
    </div>
  );
};
