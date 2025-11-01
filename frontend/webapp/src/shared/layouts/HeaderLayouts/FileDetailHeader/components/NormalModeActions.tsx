import React from 'react';
import { Button } from '@shared/components';
import { Edit, Send, Copy, FileSignature, Download, MessageSquare, Trash2, MoreVertical } from 'lucide-react';

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
        <Edit className="w-4 h-4" />
        <span className="hidden md:inline">Chỉnh sửa</span>
      </Button>

      {/* Submit Button */}
      {onSubmit && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSubmit}
          className="inline-flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
        >
          <Send className="w-4 h-4" />
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
          <Copy className="w-4 h-4" />
          <span className="hidden md:inline">Tạo phiên bản</span>
        </Button>
      )}

      {/* Send for Signature Button */}
      {onSendForSignature && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSendForSignature}
          className="inline-flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          <FileSignature className="w-4 h-4" />
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
          <Download className="w-4 h-4" />
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
          <MessageSquare className="w-4 h-4" />
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
        <Trash2 className="w-4 h-4" />
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
          <MoreVertical className="w-4 h-4" />
        </Button>
      )}
    </>
  );
};

