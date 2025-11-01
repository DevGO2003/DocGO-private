import React from 'react';
import { Button } from '@shared/components';
import { X, Save, SaveAll } from 'lucide-react';

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
        <X className="w-4 h-4" />
        <span className="hidden md:inline">Hủy</span>
      </Button>

      {/* Save & Close Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onSaveAndClose}
        className="inline-flex items-center gap-2"
      >
        <SaveAll className="w-4 h-4" />
        <span className="hidden md:inline">Lưu & Đóng</span>
      </Button>

      {/* Save Button */}
      <Button
        variant="default"
        size="sm"
        onClick={onSave}
        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
      >
        <Save className="w-4 h-4" />
        <span className="hidden md:inline">Lưu</span>
      </Button>
    </>
  );
};

