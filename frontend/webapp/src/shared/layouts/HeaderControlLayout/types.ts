import React from 'react';
import type { TabConfig } from '../../components/UIComponents/Tabs/GenericMainTabsNav';
import type { SubTabConfig } from '../../components/UIComponents/Tabs/GenericSubTabsNav';

export type Breadcrumb = {
  label: string;
  href?: string;
  current?: boolean;
};

export interface TabsConfig {
  mainTabs?: TabConfig[];
  activeMainTab?: string;
  onMainTabChange?: (tabId: string) => void;
  subTabsMap?: Record<string, SubTabConfig[]>;
  activeSubTab?: string;
  onSubTabChange?: (tabId: string) => void;
  loading?: boolean;
}

export interface HeaderControlLayoutProps {
  title: string
  subtitle?: string
  description: string // ✅ REQUIRED - Mô tả nội dung trang
  breadcrumbs?: Breadcrumb[]
  rightActions?: React.ReactNode
  children?: React.ReactNode
  className?: string
  tabsConfig?: TabsConfig
  // Deprecated: keep for backward compatibility
  primaryTabs?: React.ReactNode
  secondaryTabs?: React.ReactNode
  headerChildren?: React.ReactNode
  onRefresh?: () => void
}

export interface UploadHeaderLayoutProps extends HeaderControlLayoutProps {
  uploadActions?: React.ReactNode;
  fileFilters?: React.ReactNode;
}

export interface DashboardHeaderLayoutProps extends HeaderControlLayoutProps {}

export interface RepositoryHeaderLayoutProps extends HeaderControlLayoutProps {
  repoActions?: React.ReactNode;
}
