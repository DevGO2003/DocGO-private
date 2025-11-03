import React from 'react';
import { Button, RefreshButton } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface NormalModeActionsProps {
  onNew?: () => void;
  onUpload?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  onSearch?: (query: string) => void;
  onSettings?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const NormalModeActions: React.FC<NormalModeActionsProps> = ({
  onNew,
  onUpload,
  onDownload,
  onDelete,
  onSearch,
  onSettings,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <>
      {/* New File Button */}
      {onNew && (
        <Button
          variant="default"
          size="sm"
          onClick={onNew}
          className="inline-flex items-center gap-2 hover:bg-green-700" style={ backgroundColor: '#16a34a', color: '#ffffff' }
        >
          <CommonIcon name="plus" size={16} />
          <span className="hidden md:inline">Tệp mới</span>
        </Button>
      )}

      {/* Upload Button */}
      {onUpload && (
        <Button
          variant="default"
          size="sm"
          onClick={onUpload}
          className="inline-flex items-center gap-2"
        >
          <CommonIcon name="upload" size={16} />
          <span className="hidden md:inline">Tải lên</span>
        </Button>
      )}

      {/* Download Button */}
      {onDownload && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="inline-flex items-center gap-2"
        >
          <CommonIcon name="download" size={16} />
          <span className="hidden md:inline">Tải xuống</span>
        </Button>
      )}

      {/* Delete Button */}
      {onDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          className="inline-flex items-center gap-2"
        >
          <CommonIcon name="trash" size={16} />
          <span className="hidden md:inline">Xóa</span>
        </Button>
      )}

      {/* Search Button */}
      {onSearch && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSearch('')}
          className="inline-flex items-center gap-2"
        >
          <CommonIcon name="search" size={16} />
          <span className="hidden md:inline">Tìm kiếm</span>
        </Button>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <RefreshButton
          onClick={onRefresh}
          loading={isRefreshing}
        />
      )}

      {/* Settings Button */}
      {onSettings && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          className="inline-flex items-center gap-2"
        >
          <CommonIcon name="settings" size={16} />
        </Button>
      )}
    </>
  );
};

