import React from 'react';

export interface TabsProps {
  children: React.ReactNode;
  className?: string;
}

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export interface CommonTabProps {
  value: string;
  activeValue: string;
  onSelect: (val: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string; // Added to fix prop type errors
  title?: string; // Tooltip for disabled tabs
}
