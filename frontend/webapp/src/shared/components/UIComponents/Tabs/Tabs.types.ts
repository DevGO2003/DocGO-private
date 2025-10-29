import React from 'react';

export interface TabsProps {
  children: React.ReactNode;
  className?: string;
}

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export interface TabProps {
  value: string;
  activeValue: string;
  onSelect: (val: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}
