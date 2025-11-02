import React from 'react';
import { cn } from '@shared/lib/utils';

export interface PreviewPanelProps {
  /** File được chọn để preview */
  selectedFile?: File | null;
  /** Tiêu đề hiển thị khi có file */
  title?: string;
  /** Placeholder text khi chưa có file */
  placeholder?: string;
  /** Mô tả các định dạng hỗ trợ */
  supportedFormats?: string;
  /** Custom icon cho empty state */
  emptyIcon?: React.ReactNode;
  /** Custom content để render preview */
  children?: React.ReactNode;
  /** Thông báo warning cho office files */
  showOfficeWarning?: boolean;
  /** Custom className */
  className?: string;
  /** Custom className cho container */
  containerClassName?: string;
}

const defaultEmptyIcon = (
  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const isOfficeFile = (file: File): boolean => {
  const officeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/msword', // .doc
    'application/vnd.ms-excel', // .xls
    'application/vnd.ms-powerpoint', // .ppt
  ];
  return officeTypes.includes(file.type);
};

export function PreviewPanel({
  selectedFile,
  title,
  placeholder = 'Chọn file để xem trước',
  supportedFormats = 'Hỗ trợ PDF, hình ảnh, tài liệu, Excel, audio, video',
  emptyIcon = defaultEmptyIcon,
  children,
  showOfficeWarning = true,
  className,
  containerClassName,
}: PreviewPanelProps) {
  const headerTitle = selectedFile 
    ? (title || `Preview: ${selectedFile.name}`)
    : placeholder;

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col w-full h-full",
      containerClassName
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <p className="text-sm font-semibold text-gray-900">
          {headerTitle}
        </p>
      </div>

      {/* Content */}
      <div className={cn("p-4 overflow-visible", className)}>
        {selectedFile ? (
          <>
            {/* Office File Warning */}
            {showOfficeWarning && isOfficeFile(selectedFile) && (
              <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-xs text-amber-800">
                  Lưu ý: Đây là bản xem trước tạm thời cho tài liệu văn phòng (Word/Excel/PowerPoint). 
                  Định dạng có thể không hiển thị chính xác 100%.
                </p>
              </div>
            )}
            
            {/* Preview Content */}
            {children}
          </>
        ) : (
          /* Empty State */
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              {emptyIcon}
              <p className="text-gray-500 font-medium">{placeholder}</p>
              <p className="text-sm text-gray-400 mt-1">{supportedFormats}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PreviewPanel;












