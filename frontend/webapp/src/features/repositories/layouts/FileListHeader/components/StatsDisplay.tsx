import React from 'react';
import { FileText, FilePlus, Loader } from 'lucide-react';

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
        <FileText className="w-4 h-4" />
        <span>Tổng: <strong>{totalFiles}</strong></span>
      </div>
      
      {newFiles !== undefined && newFiles > 0 && (
        <div className="flex items-center gap-1 text-green-600">
          <FilePlus className="w-4 h-4" />
          <span>Mới: <strong>{newFiles}</strong></span>
        </div>
      )}
      
      {processingFiles !== undefined && processingFiles > 0 && (
        <div className="flex items-center gap-1 text-blue-600">
          <Loader className="w-4 h-4 animate-spin" />
          <span>Đang xử lý: <strong>{processingFiles}</strong></span>
        </div>
      )}
    </div>
  );
};

