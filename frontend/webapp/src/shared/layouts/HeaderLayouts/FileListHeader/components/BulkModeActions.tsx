import React from 'react';
import { Button } from '@shared/components';
import { Download, Trash2, Tag, FolderInput, X } from 'lucide-react';

interface BulkModeActionsProps {
  selectedCount: number;
  onBulkDownload?: () => void;
  onBulkDelete?: () => void;
  onBulkTag?: () => void;
  onBulkMove?: () => void;
  onClearSelection?: () => void;
}

export const BulkModeActions: React.FC<BulkModeActionsProps> = ({
  selectedCount,
  onBulkDownload,
  onBulkDelete,
  onBulkTag,
  onBulkMove,
  onClearSelection,
}) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
      <span className="text-sm font-medium text-blue-900 mr-2">
        Đã chọn {selectedCount} tệp
      </span>

      {onBulkDownload && (
        <Button variant="default" size="sm" onClick={onBulkDownload} className="inline-flex items-center gap-1">
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Tải xuống</span>
        </Button>
      )}

      {onBulkDelete && (
        <Button variant="destructive" size="sm" onClick={onBulkDelete} className="inline-flex items-center gap-1">
          <Trash2 className="w-4 h-4" />
          <span className="hidden md:inline">Xóa</span>
        </Button>
      )}

      {onBulkTag && (
        <Button variant="outline" size="sm" onClick={onBulkTag} className="inline-flex items-center gap-1">
          <Tag className="w-4 h-4" />
          <span className="hidden md:inline">Gắn thẻ</span>
        </Button>
      )}

      {onBulkMove && (
        <Button variant="outline" size="sm" onClick={onBulkMove} className="inline-flex items-center gap-1">
          <FolderInput className="w-4 h-4" />
          <span className="hidden md:inline">Di chuyển</span>
        </Button>
      )}

      {onClearSelection && (
        <Button variant="ghost" size="sm" onClick={onClearSelection} className="inline-flex items-center gap-1">
          <X className="w-4 h-4" />
          <span className="hidden md:inline">Hủy chọn</span>
        </Button>
      )}
    </div>
  );
};

