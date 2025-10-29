import React from 'react';
import { HeaderControlLayout } from '../HeaderControlLayout';
import type { RepositoryHeaderLayoutProps } from '../HeaderControlLayout/types';

export const RepositoryHeaderLayout: React.FC<RepositoryHeaderLayoutProps> = ({
  repoActions,
  ...base
}) => {
  return (
    <HeaderControlLayout
      {...base}
      rightActions={
        repoActions ? (
          <div className="flex items-center gap-2">{repoActions}</div>
        ) : base.rightActions
      }
    />
  );
};
