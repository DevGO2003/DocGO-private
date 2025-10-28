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
import { RepositoryType } from '@features/repositories/models/types/repository.types';

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
    
    if (validateForm()) {
      onSubmit(formData);
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
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-gray-700">
              Loại Repository
            </Label>
            <Select
              value={formData.type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('type', e.target.value as RepositoryType)}
              options={[
                { value: 'PERSONAL', label: 'Cá nhân' },
                { value: 'ORGANIZATION', label: 'Tổ chức' },
              ]}
            />
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          {formData.type === 'ORGANIZATION' && (
            <div className="space-y-2">
              <Label htmlFor="organizationId" className="text-sm font-medium text-gray-700">
                Tổ chức
              </Label>
              <Select
                value={formData.organizationId || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('organizationId', e.target.value)}
                options={[
                  { value: 'org1', label: 'Công ty ABC' },
                  { value: 'org2', label: 'Tổ chức XYZ' },
                ]}
              />
              {errors.organizationId && (
                <p className="text-sm text-red-600">{errors.organizationId}</p>
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
