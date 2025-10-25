import { Outlet } from 'react-router-dom';
import { MainLayout } from '../MainLayout';

export const DashboardLayout = () => {
  return (
    <MainLayout
      showSidebar={true}
      showHeader={true}
      sidebarCollapsed={false}
    >
      <Outlet />
    </MainLayout>
  );
};
