import { Card, CardContent, Text } from '@shared/components';
import { Tag, Folder, User } from 'lucide-react';

interface DetailsTabProps {
  fileData: any;
}

export function DetailsTab({ fileData }: DetailsTabProps) {
  const id = fileData?.id ?? 'Chưa xác định';
  const overview = fileData?.overview ?? {};
  const title = overview?.title ?? 'Chưa có tiêu đề';
  const documentType = overview?.documentType ?? 'Chưa xác định';
  const tags: string[] = Array.isArray(overview?.tags) ? overview.tags : [];
  const ownerUserId = overview?.ownerUserId ?? 'Chưa xác định';

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Folder className="w-4 h-4 mr-2 text-indigo-600" />
                ID
              </label>
              <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{id}</Text>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-indigo-600" />
                Tiêu đề
              </label>
              <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{title}</Text>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-indigo-600" />
                Document type
              </label>
              <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{documentType}</Text>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Owner</label>
              <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{ownerUserId}</Text>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">{tag}</span>
                  ))}
                </div>
              ) : (
                <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">Không có</Text>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
