import React from 'react';
import { HeaderControlLayout } from '../HeaderControlLayout';
import type { DashboardHeaderLayoutProps } from '../HeaderControlLayout/types';

export const DashboardHeaderLayout: React.FC<DashboardHeaderLayoutProps> = (props) => {
  return <HeaderControlLayout {...props} />;
};
