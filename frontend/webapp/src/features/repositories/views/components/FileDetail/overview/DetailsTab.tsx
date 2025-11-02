import { Card, CardContent, Text, Input, Select, Button } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { useState } from 'react';

interface DetailsTabProps {
  fileData: any;
  isEditing?: boolean;
  onDataChange?: (newData: any) => void;
}

export function DetailsTab({ fileData, isEditing = false, onDataChange }: DetailsTabProps) {
  const id = fileData?.id ?? 'Chưa xác định';
  const overview = fileData?.overview ?? {};
  
  const [title, setTitle] = useState(overview?.title ?? 'Chưa có tiêu đề');
  const [archiveSerial, setArchiveSerial] = useState(overview?.archiveSerial ?? '');
  const [documentType, setDocumentType] = useState(overview?.documentType ?? 'GENERAL');
  const [status, setStatus] = useState(overview?.status ?? 'ACTIVE');
  const [tags, setTags] = useState<string[]>(Array.isArray(overview?.tags) ? overview.tags : []);
  const [ownerUserId] = useState(overview?.ownerUserId ?? 'Chưa xác định');
  const [dateCreated, setDateCreated] = useState('');
  const [correspondent, setCorrespondent] = useState('');
  const [storagePath, setStoragePath] = useState('');

  const handleFieldChange = (field: string, value: any) => {
    if (onDataChange) {
      onDataChange({ ...fileData, overview: { ...overview, [field]: value } });
    }
  };

  const handleIncrementSerial = () => {
    const current = parseInt(archiveSerial) || 0;
    const newSerial = (current + 1).toString().padStart(archiveSerial.length || 7, '0');
    setArchiveSerial(newSerial);
    handleFieldChange('archiveSerial', newSerial);
  };

  const documentTypes = [
    { value: 'GENERAL', label: 'Tài liệu thông thường' },
    { value: 'CONTRACT', label: 'Hợp đồng' },
    { value: 'INVOICE', label: 'Hóa đơn' },
    { value: 'REPORT', label: 'Báo cáo' },
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'ARCHIVED', label: 'Đã lưu trữ' },
    { value: 'DRAFT', label: 'Bản nháp' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ID - Read only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CommonIcon name="folder" className="w-4 h-4 mr-2 text-indigo-600" />
                ID
              </label>
              <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{id}</Text>
            </div>

            {/* Title - Editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CommonIcon name="tag" className="w-4 h-4 mr-2 text-indigo-600" />
                Tiêu đề
              </label>
              {isEditing ? (
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    handleFieldChange('title', e.target.value);
                  }}
                  placeholder="Nhập tiêu đề"
                />
              ) : (
                <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{title}</Text>
              )}
            </div>

            {/* Archive Serial - Editable với +1 button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số lưu trữ</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={archiveSerial}
                    onChange={(e) => {
                      setArchiveSerial(e.target.value);
                      handleFieldChange('archiveSerial', e.target.value);
                    }}
                    placeholder="Auto-generated"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleIncrementSerial}
                    className="px-3"
                  >
                    +1
                  </Button>
                </div>
              ) : (
                <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {archiveSerial || 'Chưa có'}
                </Text>
              )}
            </div>

            {/* Date Created - Date picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày tạo</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateCreated}
                    onChange={(e) => {
                      setDateCreated(e.target.value);
                      handleFieldChange('dateCreated', e.target.value);
                    }}
                    className="flex-1"
                  />
                  <Button variant="outline" className="px-3">
                    <CommonIcon name="calendar" className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {dateCreated || 'Chưa xác định'}
                </Text>
              )}
            </div>

            {/* Document Type - Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CommonIcon name="user" className="w-4 h-4 mr-2 text-indigo-600" />
                Loại tài liệu
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Select
                    value={documentType}
                    onValueChange={(value) => {
                      setDocumentType(value);
                      handleFieldChange('documentType', value);
                    }}
                  >
                    {documentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                  <Button variant="outline" className="px-3">
                    <CommonIcon name="plus" className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {documentTypes.find(t => t.value === documentType)?.label || documentType}
                </Text>
              )}
            </div>

            {/* Status - Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              {isEditing ? (
                <Select
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value);
                    handleFieldChange('status', value);
                  }}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {statusOptions.find(s => s.value === status)?.label || status}
                </Text>
              )}
            </div>

            {/* Correspondent - Editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đối tác</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={correspondent}
                    onChange={(e) => setCorrespondent(e.target.value)}
                    placeholder="Chọn đối tác"
                    className="flex-1"
                  />
                  <Button variant="outline" className="px-3">
                    <CommonIcon name="chevron-down" className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="px-3">
                    <CommonIcon name="plus" className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {correspondent || 'Chưa có'}
                </Text>
              )}
            </div>

            {/* Storage Path - Editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đường dẫn lưu trữ</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={storagePath}
                    onChange={(e) => setStoragePath(e.target.value)}
                    placeholder="Chọn đường dẫn"
                    className="flex-1"
                  />
                  <Button variant="outline" className="px-3">
                    <CommonIcon name="chevron-down" className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {storagePath || 'Chưa có'}
                </Text>
              )}
            </div>

            {/* Owner - Read only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Người sở hữu</label>
              <Text className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{ownerUserId}</Text>
            </div>

            {/* Tags - Multi-select */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="Thêm tag..." className="flex-1" />
                    <Button variant="outline" className="px-3">
                      <CommonIcon name="plus" className="w-4 h-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-1"
                        >
                          {tag}
                          <button className="hover:text-indigo-900">✕</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                      {tag}
                    </span>
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
