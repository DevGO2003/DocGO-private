import { useState, useEffect } from 'react';
import { PreviewPanel } from '@shared/components';
import { FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useFileDownload } from '@features/repositories/models/api/repositoryApi';

interface ContentTabProps {
  fileData: any;
}

export function ContentTab({ fileData }: ContentTabProps) {
  const content = fileData?.content || '';
  const fileName = fileData?.title || fileData?.overview?.title || 'document';
  const mimeType = fileData?.fileSystemMetadata?.originalMimeType || fileData?.metadata?.mimeType;
  const fileId = fileData?.id;
  
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  
  // Download file blob từ backend
  const { data: fileBlob, isLoading: isDownloading, isError: downloadError } = useFileDownload(fileId, {
    enabled: !!fileId && !fileObject, // Chỉ download nếu chưa có fileObject
  });
  
  // Tạo File object từ Blob
  useEffect(() => {
    if (fileBlob && !fileObject && !isCreatingFile) {
      setIsCreatingFile(true);
      try {
        const file = new File([fileBlob], fileName, {
          type: mimeType || 'application/octet-stream',
        });
        setFileObject(file);
        console.log('[ContentTab] File object created:', {
          name: file.name,
          size: file.size,
          type: file.type,
        });
      } catch (error) {
        console.error('[ContentTab] Failed to create File object:', error);
      } finally {
        setIsCreatingFile(false);
      }
    }
  }, [fileBlob, fileObject, fileName, mimeType, isCreatingFile]);
  
  // Show loading while downloading
  const showLoading = isDownloading || isCreatingFile;
  const showFallback = !fileObject || downloadError;

  return (
    <div className="h-[calc(100vh-300px)] min-h-[600px]">
      <PreviewPanel
        selectedFile={fileObject}
        title={`Preview: ${fileName}`}
        placeholder="File preview"
        supportedFormats="Hỗ trợ PDF, hình ảnh, tài liệu Word, Excel, audio, video"
        showOfficeWarning={false}
        containerClassName="h-full"
        className="h-full overflow-auto"
      >
        {/* Show loading */}
        {showLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-600">Đang tải file...</p>
          </div>
        )}
        
        {/* Fallback: Show extracted text if file download failed or not available */}
        {!showLoading && showFallback && (
        <div className="space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">
                {downloadError ? 'Không thể tải file' : 'Preview tạm thời'}
              </p>
              <p>
                {downloadError 
                  ? 'Hiển thị nội dung văn bản đã trích xuất thay thế.'
                  : 'Hiện đang hiển thị nội dung văn bản đã trích xuất.'}
              </p>
            </div>
          </div>

          {/* Extracted content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Nội dung đã trích xuất
              </h4>
              <span className="text-xs text-gray-500">
                {content.length.toLocaleString()} ký tự
              </span>
            </div>
            
            {mimeType && (
              <p className="text-xs text-gray-500">Loại file: {mimeType}</p>
            )}

            <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-[500px] overflow-auto">
              <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                {content || 'Chưa có nội dung được trích xuất'}
              </pre>
            </div>
          </div>
        </div>
        )}
      </PreviewPanel>
    </div>
  );
}
