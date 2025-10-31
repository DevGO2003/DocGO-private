import { Card, CardContent } from '@shared/components';
import { FileText } from 'lucide-react';

interface ContentTabProps {
  fileData: any;
}

export function ContentTab({ fileData }: ContentTabProps) {
  const content = fileData?.content || '';

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-600" />
              Nội dung tài liệu
            </h4>
            <div className="text-sm text-gray-600">
              {content.length} ký tự
            </div>
          </div>

          <div className="prose max-w-none">
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap p-4 bg-gray-50 rounded-lg border border-gray-200">
              {content || 'Chưa có nội dung'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
