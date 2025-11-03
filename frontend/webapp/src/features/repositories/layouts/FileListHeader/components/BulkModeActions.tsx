import React from 'react';
import { Button } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

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
    <div className="flex items-center gap-2 p-2 rounded-lg border" style={ borderColor: '#bfdbfe' } style={ backgroundColor: '#eff6ff' }>
      <span className="text-sm font-medium mr-2" style={ color: '#1e3a8a' }>
        Đã chọn {selectedCount} tệp
      </span>

      {onBulkDownload && (
        <Button variant="default" size="sm" onClick={onBulkDownload} className="inline-flex items-center gap-1">
          <CommonIcon name="download" size={16} />
          <span className="hidden md:inline">Tải xuống</span>
        </Button>
      )}

      {onBulkDelete && (
        <Button variant="destructive" size="sm" onClick={onBulkDelete} className="inline-flex items-center gap-1">
          <CommonIcon name="trash" size={16} />
          <span className="hidden md:inline">Xóa</span>
        </Button>
      )}

      {onBulkTag && (
        <Button variant="outline" size="sm" onClick={onBulkTag} className="inline-flex items-center gap-1">
          <CommonIcon name="tag" size={16} />
          <span className="hidden md:inline">Gắn thẻ</span>
        </Button>
      )}

      {onBulkMove && (
        <Button variant="outline" size="sm" onClick={onBulkMove} className="inline-flex items-center gap-1">
          <CommonIcon name="folder" size={16} />
          <span className="hidden md:inline">Di chuyển</span>
        </Button>
      )}

      {onClearSelection && (
        <Button variant="ghost" size="sm" onClick={onClearSelection} className="inline-flex items-center gap-1">
          <CommonIcon name="x" size={16} />
          <span className="hidden md:inline">Hủy chọn</span>
        </Button>
      )}
    </div>
  );
};

