import { Card, CardContent } from '@shared/components';
import { ScanText } from 'lucide-react';

interface OCRTabProps {
  fileData: any;
}

export function OCRTab({ fileData }: OCRTabProps) {
  const ocrContent = fileData?.ocrContent || fileData?.content || '';

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ScanText className="w-5 h-5 mr-2 text-indigo-600" />
          Nội dung OCR
        </h3>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap p-4 bg-gray-50 rounded-lg border border-gray-200">
          {ocrContent || 'Chưa có nội dung OCR'}
        </div>
      </CardContent>
    </Card>
  );
}
