import { PreviewPanel } from '@shared/components';
import { FileText, AlertCircle } from 'lucide-react';

interface ContentTabProps {
  fileData: any;
}

export function ContentTab({ fileData }: ContentTabProps) {
  const content = fileData?.content || '';
  const fileName = fileData?.title || fileData?.overview?.title || 'document';
  const mimeType = fileData?.fileSystemMetadata?.originalMimeType || fileData?.metadata?.mimeType;

  // TODO: Khi có storage URL từ backend, tạo File object để preview
  // const fileUrl = fileData?.storage?.s3Url || fileData?.storage?.previewUrl;
  // const mockFile = fileUrl ? await fetch(fileUrl).then(r => r.blob()).then(b => new File([b], fileName)) : null;

  return (
    <div className="h-[calc(100vh-300px)] min-h-[600px]">
      <PreviewPanel
        selectedFile={null}
        title={`Preview: ${fileName}`}
        placeholder="File preview"
        supportedFormats="Hỗ trợ PDF, hình ảnh, tài liệu Word, Excel, audio, video"
        showOfficeWarning={false}
        containerClassName="h-full"
        className="h-full overflow-auto"
      >
        {/* Temporary: Show extracted text until storage URL is available */}
        <div className="space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Preview tạm thời</p>
              <p>Hiện đang hiển thị nội dung văn bản đã trích xuất. Preview file thực tế (PDF, hình ảnh, v.v.) sẽ có sẵn khi backend cung cấp storage URL.</p>
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
      </PreviewPanel>
    </div>
  );
}
