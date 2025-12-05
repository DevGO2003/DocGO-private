import { Card, CardContent } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

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
          <CommonIcon name="file-text" className="w-5 h-5 mr-2 text-indigo-600" />
          Nội dung OCR
        </h3>
        {ocrMeta && (
          <div className="text-xs mb-3" style={{ color: '#6b7280' }} >
            {ocrMeta.engine ? `Engine: ${ocrMeta.engine}` : null}
            {ocrMeta.engine && (ocrMeta.confidence ?? ocrMeta.processingTime) ? ' · ' : null}
            {typeof ocrMeta.confidence === 'number' ? `Độ tin cậy: ${ocrMeta.confidence}` : null}
            {ocrMeta.processingTime ? ` · Thời gian: ${ocrMeta.processingTime}ms` : null}
            {ocrMeta.processedAt ? ` · Lúc: ${ocrMeta.processedAt}` : null}
            {ocrMeta.error ? ` · Lỗi: ${ocrMeta.error}` : null}
          </div>
        )}
        <div className="text-sm p-4 rounded-lg border" style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: '#f9fafb' }} >
          {ocrText || 'Chưa có nội dung OCR'}
        </div>
      </CardContent>
    </Card>
  );
}
