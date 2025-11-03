import React from 'react';
import { Button } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface EditModeActionsProps {
  onCancel: () => void;
  onSave: () => void;
  onSaveAndClose: () => void;
}

export const EditModeActions: React.FC<EditModeActionsProps> = ({
  onCancel,
  onSave,
  onSaveAndClose,
}) => {
  return (
    <>
      {/* Cancel Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="inline-flex items-center gap-2"
      >
        <CommonIcon name="x" size={16} />
        <span className="hidden md:inline">Hủy</span>
      </Button>

      {/* Save & Close Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onSaveAndClose}
        className="inline-flex items-center gap-2"
      >
        <CommonIcon name="save" size={16} />
        <span className="hidden md:inline">Lưu & Đóng</span>
      </Button>

      {/* Save Button */}
      <Button
        variant="default"
        size="sm"
        onClick={onSave}
        className="inline-flex items-center gap-2 hover:bg-green-700" style={ backgroundColor: '#16a34a', color: '#ffffff' }
      >
        <CommonIcon name="save" size={16} />
        <span className="hidden md:inline">Lưu</span>
      </Button>
    </>
  );
};

