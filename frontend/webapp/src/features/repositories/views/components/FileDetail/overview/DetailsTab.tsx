import { Card, CardContent, Text, Input, Select } from '@shared/components';
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
  
  const [title, setTitle] = useState(fileData?.title ?? basic?.fileName ?? overview?.title ?? 'Chưa có tiêu đề');
  const repositoryName = fileData?.repositoryName || overview?.repositoryName || 'Chưa xác định';
  const [documentType, setDocumentType] = useState(overview?.documentType ?? 'GENERAL');
  const [status, setStatus] = useState(overview?.status ?? 'ACTIVE');
  // Owner có thể là string (userId) hoặc object
  const ownerData = basic?.owner || fileData?.owner || overview?.owner || overview?.ownerUserId;
  const ownerName = typeof ownerData === 'string' 
    ? ownerData  // Hiển thị userId nếu là string
    : ownerData?.username || ownerData?.email || ownerData?.firstName 
      ? `${ownerData?.firstName || ''} ${ownerData?.lastName || ''}`.trim() || ownerData?.username || ownerData?.email 
      : 'Chưa xác định';
  
  // Lấy createdAt từ nhiều nguồn
  const createdAt = fileData?.createdAt || basic?.createdAt || fileSystemMetadata?.dateAdded || overview?.dateCreated;
  const dateAdded = createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : 'Chưa xác định';
  
  const handleFieldChange = (field: string, value: any) => {
    if (onDataChange) {
      onDataChange({ ...fileData, overview: { ...overview, [field]: value } });
    }
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

            {/* Repository Name - Read only */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >Kho chứa</label>
              <Text className="w-full px-3 py-2 border rounded-md" style={{ borderColor: '#d1d5db', backgroundColor: '#f9fafb' }} >
                {repositoryName}
              </Text>
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
