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
  const basic = fileData?.basic ?? {};
  const fileSystemMetadata = fileData?.fileSystemMetadata ?? {};
  
  const [title, setTitle] = useState(basic?.fileName ?? overview?.title ?? 'Chưa có tiêu đề');
  const [archiveSerial, setArchiveSerial] = useState(overview?.archiveSerial ?? '');
  const [documentType, setDocumentType] = useState(overview?.documentType ?? 'GENERAL');
  const [status, setStatus] = useState(overview?.status ?? 'ACTIVE');
  const [ownerName] = useState(basic?.owner?.username || basic?.owner?.email || 'Chưa xác định');
  const dateAdded = fileSystemMetadata?.dateAdded ? new Date(fileSystemMetadata.dateAdded).toLocaleDateString('vi-VN') : 'Chưa xác định';
  const [correspondent, setCorrespondent] = useState('');

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
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >
                ID
              </label>
              <Text className="w-full px-3 py-2 border rounded-md" style={{ borderColor: '#d1d5db', backgroundColor: '#f9fafb' }} >{id}</Text>
            </div>

            {/* Title - Editable */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >
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
                <Text className="w-full px-3 py-2 border rounded-md" style={{ borderColor: '#d1d5db', backgroundColor: '#f9fafb' }} >{title}</Text>
              )}
            </div>

            {/* Archive Serial - Editable với +1 button */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >Số lưu trữ</label>
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
                <Text className="w-full px-3 py-2 border rounded-md" style={{ borderColor: '#d1d5db', backgroundColor: '#f9fafb' }} >
                  {archiveSerial || 'Chưa có'}
                </Text>
              )}
            </div>

            {/* Date Added - Read only */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >Ngày tạo</label>
              <Text className="w-full px-3 py-2 border rounded-md" style={{ borderColor: '#d1d5db', backgroundColor: '#f9fafb' }} >
                {dateAdded}
              </Text>
            </div>

            {/* Document Type - Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >
                Loại tài liệu
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Select
                    value={documentType}
                    options={documentTypes}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setDocumentType(e.target.value);
                      handleFieldChange('documentType', e.target.value);
                    }}
                  />
                </div>
              ) : (
                <Text className="w-full px-3 py-2 border rounded-md" style={{ borderColor: '#d1d5db', backgroundColor: '#f9fafb' }} >
                  {documentTypes.find(t => t.value === documentType)?.label || documentType}
                </Text>
              )}
            </div>

            {/* Status - Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >Trạng thái</label>
              {isEditing ? (
                <Select
                  value={status}
                  options={statusOptions}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setStatus(e.target.value);
                    handleFieldChange('status', e.target.value);
                  }}
                />
              ) : (
                <Text className="w-full px-3 py-2 border rounded-md" style={{ borderColor: '#d1d5db', backgroundColor: '#f9fafb' }} >
                  {statusOptions.find(s => s.value === status)?.label || status}
                </Text>
              )}
            </div>

            {/* Correspondent - Editable */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >Đối tác</label>
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
                </div>
              ) : (
                <Text className="w-full px-3 py-2 border rounded-md" style={{ borderColor: '#d1d5db', backgroundColor: '#f9fafb' }} >
                  {correspondent || 'Chưa có'}
                </Text>
              )}
            </div>

            {/* Owner - Read only */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >Người sở hữu</label>
              <Text className="w-full px-3 py-2 border rounded-md" style={{ borderColor: '#d1d5db', backgroundColor: '#f9fafb' }} >{ownerName}</Text>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
