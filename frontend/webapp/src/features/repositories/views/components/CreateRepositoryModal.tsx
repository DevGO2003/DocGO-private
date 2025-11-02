import React, { useState } from 'react';
import {
  Button,
  Input,
  CommonTextarea as Textarea,
  CommonSelect as Select,
  CommonLabel as Label,
  CommonSwitch as Switch,
  CommonModal as Modal,
} from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { RepositoryType } from '@features/repositories/models/types/repository.types';
import { useMyOrganizations } from '@features/organizations/models/api/organizationApi';

interface CreateRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RepositoryCreateData) => void;
  isLoading?: boolean;
}

interface RepositoryCreateData {
  name: string;
  description?: string;
  type: RepositoryType;
  isPublic: boolean;
  organizationId?: string;
}

export const CreateRepositoryModal: React.FC<CreateRepositoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<RepositoryCreateData>({
    name: '',
    description: '',
    type: 'PERSONAL',
    isPublic: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RepositoryCreateData, string>>>({});
  
  // Fetch user's organizations
  const { data: organizationsData } = useMyOrganizations({ page: 0, size: 100 });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RepositoryCreateData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên repository là bắt buộc';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Tên repository phải có ít nhất 3 ký tự';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Tên repository không được quá 100 ký tự';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Mô tả không được quá 500 ký tự';
    }

    if (formData.type === 'ORGANIZATION' && !formData.organizationId) {
      newErrors.organizationId = 'Vui lòng chọn tổ chức';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log('[CreateRepositoryModal] Form data before validation:', formData);
    
    if (validateForm()) {
      console.log('[CreateRepositoryModal] Form validated, submitting:', formData);
      onSubmit(formData);
    } else {
      console.log('[CreateRepositoryModal] Form validation failed, errors:', errors);
    }
  };

  const handleInputChange = (field: keyof RepositoryCreateData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'PERSONAL',
      isPublic: false,
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo Repository Mới"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-gray-500">
            Các trường có dấu <span className="text-red-500">*</span> là bắt buộc
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button form="create-repo-form" type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <CommonIcon name="user" size={16} />
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang tạo...
                </div>
              ) : (
                'Tạo Repository'
              )}
            </Button>
          </div>
        </div>
      }
      size="lg"
    >
      <form id="create-repo-form" onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Repository Type Selection */}
          <div className="space-y-3">
            <Label htmlFor="type" className="text-sm font-medium text-gray-900">
              Chọn loại Repository <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {/* Personal Option */}
              <button
                type="button"
                onClick={() => handleInputChange('type', 'PERSONAL')}
                className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.type === 'PERSONAL'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    formData.type === 'PERSONAL' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <CommonIcon name="user" size={20} className={`w-5 h-5 ${
                      formData.type === 'PERSONAL' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-semibold ${
                      formData.type === 'PERSONAL' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      Cá nhân
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Repository của riêng bạn
                    </div>
                  </div>
                  {formData.type === 'PERSONAL' && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>

              {/* Organization Option */}
              <button
                type="button"
                onClick={() => handleInputChange('type', 'ORGANIZATION')}
                className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.type === 'ORGANIZATION'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    formData.type === 'ORGANIZATION' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <CommonIcon name="building" size={20} className={`w-5 h-5 ${
                      formData.type === 'ORGANIZATION' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-semibold ${
                      formData.type === 'ORGANIZATION' ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      Tổ chức
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Thuộc về một tổ chức
                    </div>
                  </div>
                  {formData.type === 'ORGANIZATION' && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            </div>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          {formData.type === 'ORGANIZATION' && (
            <div className="space-y-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CommonIcon name="building" size={16} className="text-green-600" />
                <Label htmlFor="organizationId" className="text-sm font-medium text-gray-900">
                  Chọn tổ chức <span className="text-red-500">*</span>
                </Label>
              </div>
              <Select
                value={formData.organizationId || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('organizationId', e.target.value)}
                options={[
                  { value: '', label: '-- Chọn tổ chức --' },
                  ...(organizationsData?.content || []).map(org => ({
                    value: org.id,
                    label: org.name
                  }))
                ]}
                className="bg-white"
              />
              {errors.organizationId && (
                <p className="text-sm text-red-600">{errors.organizationId}</p>
              )}
              {organizationsData?.content?.length === 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md mt-2">
                  <div className="text-amber-600 text-sm">
                    ⚠️ Bạn chưa có tổ chức nào. Hãy tạo hoặc tham gia một tổ chức trước.
                  </div>
                </div>
              )}
              {organizationsData?.content && organizationsData.content.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  Đã tìm thấy {organizationsData.content.length} tổ chức mà bạn tham gia
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Tên Repository <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Nhập tên repository..."
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Mô tả
            </Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả cho repository..."
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {formData.description?.length || 0}/500 ký tự
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Công khai
            </Label>
            <div className="flex items-center space-x-3">
              <Switch
                checked={formData.isPublic}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('isPublic', e.target.checked)}
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  {formData.isPublic ? 'Công khai' : 'Riêng tư'}
                </p>
                <p className="text-xs text-gray-500">
                  {formData.isPublic
                    ? 'Bất kỳ ai cũng có thể xem repository này'
                    : 'Chỉ bạn và những người được phép mới có thể xem'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
