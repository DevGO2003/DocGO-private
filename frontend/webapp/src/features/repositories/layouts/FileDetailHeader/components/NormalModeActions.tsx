import React from 'react';
import { Button } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface NormalModeActionsProps {
  onEdit: () => void;
  onSubmit?: () => void;
  onCreateVersion?: () => void;
  onSendForSignature?: () => void;
  onDownload?: () => void;
  onComment?: () => void;
  onDelete: () => void;
  onMore?: (action: string) => void;
}

export const NormalModeActions: React.FC<NormalModeActionsProps> = ({
  onEdit,
  onSubmit,
  onCreateVersion,
  onSendForSignature,
  onDownload,
  onComment,
  onDelete,
  onMore,
}) => {
  return (
    <>
      {/* Edit Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="inline-flex items-center gap-2"
      >
        <CommonIcon name="edit" size={16} />
        <span className="hidden md:inline">Chỉnh sửa</span>
      </Button>

      {/* Submit Button */}
      {onSubmit && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSubmit}
          className="inline-flex items-center gap-2 hover:bg-green-50" style={ borderColor: '#86efac', color: '#15803d' }
        >
          <CommonIcon name="send" size={16} />
          <span className="hidden md:inline">Gửi duyệt</span>
        </Button>
      )}

      {/* Create Version Button */}
      {onCreateVersion && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateVersion}
          className="inline-flex items-center gap-2"
        >
          <CommonIcon name="copy" size={16} />
          <span className="hidden md:inline">Tạo phiên bản</span>
        </Button>
      )}

      {/* Send for Signature Button */}
      {onSendForSignature && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSendForSignature}
          className="inline-flex items-center gap-2 hover:bg-purple-50" style={ borderColor: '#d8b4fe' } style={ color: '#7e22ce' }
        >
          <CommonIcon name="file-text" size={16} />
          <span className="hidden md:inline">Gửi ký</span>
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

      {/* Comment Button */}
      {onComment && (
        <Button
          variant="outline"
          size="sm"
          onClick={onComment}
          className="inline-flex items-center gap-2"
        >
          <CommonIcon name="message" size={16} />
          <span className="hidden md:inline">Bình luận</span>
        </Button>
      )}

      {/* Delete Button */}
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        className="inline-flex items-center gap-2"
      >
        <CommonIcon name="trash" size={16} />
        <span className="hidden md:inline">Xóa</span>
      </Button>

      {/* More Actions Button */}
      {onMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMore('menu')}
          className="inline-flex items-center gap-2"
        >
          <CommonIcon name="more-vertical" size={16} />
        </Button>
      )}
    </>
  );
};

