import { ReactNode } from 'react';
import { MainLayout } from '../MainLayout';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <MainLayout
      showSidebar={true}
      showHeader={true}
      sidebarCollapsed={false}
    >
      {children}
    </MainLayout>
  );
};
