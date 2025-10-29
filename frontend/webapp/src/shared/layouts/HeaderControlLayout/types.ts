import React from 'react';

export type Breadcrumb = {
  label: string;
  href?: string;
  current?: boolean;
};

export interface HeaderControlLayoutProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  rightActions?: React.ReactNode;
  primaryTabs?: React.ReactNode;
  secondaryTabs?: React.ReactNode;
  headerChildren?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export interface UploadHeaderLayoutProps extends HeaderControlLayoutProps {
  uploadActions?: React.ReactNode;
  fileFilters?: React.ReactNode;
}

export interface DashboardHeaderLayoutProps extends HeaderControlLayoutProps {}

export interface RepositoryHeaderLayoutProps extends HeaderControlLayoutProps {
  repoActions?: React.ReactNode;
}
