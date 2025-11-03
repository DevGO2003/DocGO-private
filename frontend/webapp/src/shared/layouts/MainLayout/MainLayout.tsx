import { useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ControlMainLayout } from './ControlMainLayout';

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
  
  const location = useLocation();
  // Regex patterns cho các trang chỉ muốn ControlMainLayout (không Header/Sidebar)
  const minimalPatterns: RegExp[] = [
    // Ví dụ: thêm các route tối giản khác tại đây nếu cần
  ];
  const isMinimal = minimalPatterns.some((re) => re.test(location.pathname));
  const resolvedShowHeader = isMinimal ? false : showHeader;
  const resolvedShowSidebar = isMinimal ? false : showSidebar;

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
    <div className="h-screen overflow-hidden flex" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
      {/* Sidebar */}
      {resolvedShowSidebar && (
        <>
          {/* Mobile overlay */}
          {isSidebarOpen && (
            <div
              className="fixed z-40 lg:hidden transition-opacity duration-300"
              style={{ backgroundColor: '#4b5563', opacity: isSidebarOpen ? 0.75 : 0 }}
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <div
            className="fixed left-0 z-50 transition-all duration-300"
            style={{
              backgroundColor: '#ffffff',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transform: `translateX(${isSidebarOpen || window.innerWidth >= 1024 ? '0' : '-256px'})`,
              width: isCollapsed && window.innerWidth >= 1024 ? '64px' : '256px'
            }}
          >
            <Sidebar 
              collapsed={isCollapsed}
              onCollapseToggle={() => handleSidebarCollapse(!isCollapsed)}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${resolvedShowSidebar ? (isCollapsed ? 'ml-16' : 'ml-64') : ''}`}>
        {/* Header */}
        {resolvedShowHeader && (
          <Header
            onMenuToggle={handleSidebarToggle}
            showSearch={true}
            showNotifications={true}
            showUserMenu={true}
          />
        )}

        {/* Page Content - internal scroll only */}
        <main
          className="flex-1 overflow-hidden p-2.5 transition-opacity duration-300"
          style={{ opacity: 1 }}
        >
          <ControlMainLayout>
            {children}
          </ControlMainLayout>
        </main>
      </div>

    </div>
  );
};
