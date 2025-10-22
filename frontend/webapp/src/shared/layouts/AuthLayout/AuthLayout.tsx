import { ReactNode } from 'react';
import { MainLayout } from '../MainLayout';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <MainLayout
      showSidebar={false}
      showHeader={false}
      sidebarCollapsed={false}
    >
      {children}
    </MainLayout>
  );
};
