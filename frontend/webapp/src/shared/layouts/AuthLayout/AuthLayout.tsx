import { Outlet } from 'react-router-dom';
import { MainLayout } from '../MainLayout';

export const AuthLayout = () => {
  return (
    <MainLayout
      showSidebar={false}
      showHeader={false}
      sidebarCollapsed={false}
    >
      <Outlet />
    </MainLayout>
  );
};
