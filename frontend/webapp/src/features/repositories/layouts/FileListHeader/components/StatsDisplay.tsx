import React from 'react';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface StatsDisplayProps {
  totalFiles: number;
  newFiles?: number;
  processingFiles?: number;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  totalFiles,
  newFiles,
  processingFiles,
}) => {
  return (
    <div className="flex items-center gap-4 text-sm text-gray-600">
      <div className="flex items-center gap-1">
        <CommonIcon name="file-text" size={16} />
        <span>Tổng: <strong>{totalFiles}</strong></span>
      </div>
      
      {newFiles !== undefined && newFiles > 0 && (
        <div className="flex items-center gap-1 text-green-600">
          <CommonIcon name="plus" size={16} />
          <span>Mới: <strong>{newFiles}</strong></span>
        </div>
      )}
      
      {processingFiles !== undefined && processingFiles > 0 && (
        <div className="flex items-center gap-1 text-blue-600">
          <CommonIcon name="loading" size={16} className="animate-spin" />
          <span>Đang xử lý: <strong>{processingFiles}</strong></span>
        </div>
      )}
    </div>
  );
};

