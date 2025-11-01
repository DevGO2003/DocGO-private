import React from 'react';
import { FileData } from '../FileDetailHeader.types';
import { FileText, User, Calendar, HardDrive } from 'lucide-react';

interface MetadataDisplayProps {
  file: FileData;
}

export const MetadataDisplay: React.FC<MetadataDisplayProps> = ({ file }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-2 text-sm">
      {/* Code */}
      {file.code && (
        <div className="flex items-center gap-2 text-gray-600">
          <FileText className="w-4 h-4" />
          <span className="font-medium">Mã:</span>
          <span>{file.code}</span>
        </div>
      )}

      {/* Type */}
      {file.type && (
        <div className="flex items-center gap-2 text-gray-600">
          <FileText className="w-4 h-4" />
          <span className="font-medium">Loại:</span>
          <span>{file.type}</span>
        </div>
      )}

      {/* Owner */}
      {file.owner && (
        <div className="flex items-center gap-2 text-gray-600">
          <User className="w-4 h-4" />
          <span className="font-medium">Chủ sở hữu:</span>
          <span>{file.owner}</span>
        </div>
      )}

      {/* Created Date */}
      {file.createdAt && (
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">Ngày tạo:</span>
          <span>{formatDate(file.createdAt)}</span>
        </div>
      )}

      {/* Size */}
      {file.size && (
        <div className="flex items-center gap-2 text-gray-600">
          <HardDrive className="w-4 h-4" />
          <span className="font-medium">Kích thước:</span>
          <span>{formatSize(file.size)}</span>
        </div>
      )}

      {/* Status */}
      {file.status && (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600">Trạng thái:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            file.status === 'active' ? 'bg-green-100 text-green-700' :
            file.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {file.status}
          </span>
        </div>
      )}
    </div>
  );
};

