import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Switch,
} from '@shared/components';
import { X, Plus, Building, User } from 'lucide-react';
import { RepositoryType } from '@features/repository/models/types/repository.types';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof RepositoryCreateData, value: any) => {
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
    <AnimatePresence>
      {isOpen && (
        <Modal onClose={handleClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
          >
            <ModalHeader className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Tạo Repository Mới
                    </h2>
                    <p className="text-sm text-gray-600">
                      Tạo kho lưu trữ tài liệu mới của bạn
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <ModalContent className="px-6 py-4">
                <div className="space-y-6">
                  {/* Repository Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                      Loại Repository
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: RepositoryType) => handleInputChange('type', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn loại repository" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERSONAL">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Cá nhân</div>
                              <div className="text-sm text-gray-500">Repository riêng của bạn</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="ORGANIZATION">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Tổ chức</div>
                              <div className="text-sm text-gray-500">Repository của tổ chức</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-red-600">{errors.type}</p>
                    )}
                  </div>

                  {/* Organization Selection (only for ORGANIZATION type) */}
                  {formData.type === 'ORGANIZATION' && (
                    <div className="space-y-2">
                      <Label htmlFor="organizationId" className="text-sm font-medium text-gray-700">
                        Tổ chức
                      </Label>
                      <Select
                        value={formData.organizationId || ''}
                        onValueChange={(value) => handleInputChange('organizationId', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn tổ chức" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="org1">Công ty ABC</SelectItem>
                          <SelectItem value="org2">Tổ chức XYZ</SelectItem>
                          {/* TODO: Load from API */}
                        </SelectContent>
                      </Select>
                      {errors.organizationId && (
                        <p className="text-sm text-red-600">{errors.organizationId}</p>
                      )}
                    </div>
                  )}

                  {/* Repository Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Tên Repository <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nhập tên repository..."
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Mô tả
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Nhập mô tả cho repository..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
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

                  {/* Visibility */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Công khai
                    </Label>
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
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
              </ModalContent>

              <ModalFooter className="border-t border-gray-200 px-6 py-4">
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
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="min-w-[120px]"
                    >
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
              </ModalFooter>
            </form>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};
