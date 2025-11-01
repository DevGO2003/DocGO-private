import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

export type HeaderMode = 'normal' | 'edit' | 'bulk' | 'preview';

export interface BaseHeaderLayoutProps {
  // Required
  breadcrumbs: BreadcrumbItem[];
  title: string;
  actions: React.ReactNode;
  
  // Optional content slots
  subtitle?: string;
  metadata?: React.ReactNode;
  contextNav?: React.ReactNode;
  stats?: React.ReactNode;
  filters?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  
  // Mode and behavior
  mode?: HeaderMode;
  onRefresh?: () => void;
  
  // Styling
  className?: string;
}

