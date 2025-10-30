import { Card, CardContent, Text } from '@shared/components';
import { Calendar, User, Tag, Folder } from 'lucide-react';

interface DetailsTabProps {
  fileData: any;
}

export function DetailsTab({ fileData }: DetailsTabProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-indigo-600" />
                Tiêu đề tài liệu
              </label>
              <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {fileData?.title || 'Chưa có tiêu đề'}
              </Text>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Folder className="w-4 h-4 mr-2 text-indigo-600" />
                Mã tài liệu
              </label>
              <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {fileData?.id || 'Chưa xác định'}
              </Text>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                Ngày tạo
              </label>
              <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {formatDate(fileData?.createdAt)}
              </Text>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-indigo-600" />
                Trạng thái
              </label>
              <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {fileData?.status || 'Chưa xác định'}
              </Text>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại tài liệu</label>
              <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {fileData?.contractType || fileData?.type || 'Chưa xác định'}
              </Text>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kích thước file</label>
              <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {fileData?.fileSystemMetadata?.originalFileSize 
                  ? `${(fileData.fileSystemMetadata.originalFileSize / 1024).toFixed(2)} KB`
                  : 'Chưa xác định'}
              </Text>
            </div>
          </div>

          {fileData?.description && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
              <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {fileData.description}
              </Text>
            </div>
          )}

          {fileData?.tags && fileData.tags.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {fileData.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
