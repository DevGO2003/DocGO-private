import React from 'react';
import { HeaderControlLayout } from '../HeaderControlLayout';
import type { UploadHeaderLayoutProps } from '../HeaderControlLayout/types';

export const UploadHeaderLayout: React.FC<UploadHeaderLayoutProps> = ({
  uploadActions,
  fileFilters,
  ...base
}) => {
  return (
    <HeaderControlLayout
      {...base}
      rightActions={
        uploadActions ? (
          <div className="flex items-center gap-2">{uploadActions}</div>
        ) : base.rightActions
      }
      headerChildren={
        fileFilters ? (
          <div className="flex items-center gap-2">{fileFilters}</div>
        ) : base.headerChildren
      }
    />
  );
};
