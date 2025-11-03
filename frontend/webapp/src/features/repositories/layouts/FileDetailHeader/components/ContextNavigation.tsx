import React from 'react';
import { Button } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface ContextNavigationProps {
  onPrevFile?: () => void;
  onNextFile?: () => void;
  currentIndex?: number;
  totalFiles?: number;
}

export const ContextNavigation: React.FC<ContextNavigationProps> = ({
  onPrevFile,
  onNextFile,
  currentIndex,
  totalFiles,
}) => {
  if (!onPrevFile && !onNextFile) return null;

  const hasPrev = onPrevFile && currentIndex !== undefined && currentIndex > 0;
  const hasNext = onNextFile && currentIndex !== undefined && totalFiles !== undefined && currentIndex < totalFiles - 1;

  return (
    <div className="flex items-center gap-2">
      {/* Previous File Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevFile}
        disabled={!hasPrev}
        className="inline-flex items-center gap-1"
      >
        <CommonIcon name="chevron-left" size={16} />
        <span className="hidden md:inline">File trước</span>
      </Button>

      {/* File Counter */}
      {currentIndex !== undefined && totalFiles !== undefined && (
        <span className="text-sm px-2" style={ color: '#4b5563' }>
          Tệp {currentIndex + 1}/{totalFiles}
        </span>
      )}

      {/* Next File Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onNextFile}
        disabled={!hasNext}
        className="inline-flex items-center gap-1"
      >
        <span className="hidden md:inline">File kế tiếp</span>
        <CommonIcon name="chevron-right" size={16} />
      </Button>
    </div>
  );
};

