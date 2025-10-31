import { Card, CardContent } from '@shared/components';
import { ScanText } from 'lucide-react';

interface OCRTabProps {
  fileData: any;
}

export function OCRTab({ fileData }: OCRTabProps) {
  const rawOcr = fileData?.ocrContent ?? fileData?.content ?? '';
  const ocrText = typeof rawOcr === 'string' ? rawOcr : (rawOcr?.text ?? '');
  const ocrMeta = typeof rawOcr === 'object' && rawOcr !== null ? rawOcr : null;

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ScanText className="w-5 h-5 mr-2 text-indigo-600" />
          Nội dung OCR
        </h3>
        {ocrMeta && (
          <div className="text-xs text-gray-500 mb-3">
            {ocrMeta.engine ? `Engine: ${ocrMeta.engine}` : null}
            {ocrMeta.engine && (ocrMeta.confidence ?? ocrMeta.processingTime) ? ' · ' : null}
            {typeof ocrMeta.confidence === 'number' ? `Độ tin cậy: ${ocrMeta.confidence}` : null}
            {ocrMeta.processingTime ? ` · Thời gian: ${ocrMeta.processingTime}ms` : null}
            {ocrMeta.processedAt ? ` · Lúc: ${ocrMeta.processedAt}` : null}
            {ocrMeta.error ? ` · Lỗi: ${ocrMeta.error}` : null}
          </div>
        )}
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap p-4 bg-gray-50 rounded-lg border border-gray-200">
          {ocrText || 'Chưa có nội dung OCR'}
        </div>
      </CardContent>
    </Card>
  );
}
