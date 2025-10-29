import React from 'react';
import { HeaderControlLayout } from '../HeaderControlLayout';
import type { HeaderControlLayoutProps } from '../HeaderControlLayout/types';

export interface OrganizationHeaderLayoutProps extends HeaderControlLayoutProps {
  orgActions?: React.ReactNode;
  filters?: React.ReactNode;
}

export const OrganizationHeaderLayout: React.FC<OrganizationHeaderLayoutProps> = ({
  orgActions,
  filters,
  ...base
}) => {
  return (
    <HeaderControlLayout
      {...base}
      rightActions={orgActions ?? base.rightActions}
      headerChildren={filters ?? base.headerChildren}
    />
  );
};
