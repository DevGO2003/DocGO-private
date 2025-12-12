import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  defaultOrganizationId?: string;
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
  defaultOrganizationId,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<RepositoryCreateData>({
    name: '',
    description: '',
    type: defaultOrganizationId ? 'ORGANIZATION' : 'PERSONAL',
    isPublic: false,
    organizationId: defaultOrganizationId,
  });

  // Update formData when defaultOrganizationId changes (e.g., when modal opens)
  React.useEffect(() => {
    if (defaultOrganizationId) {
      setFormData(prev => ({
        ...prev,
        type: 'ORGANIZATION',
        organizationId: defaultOrganizationId,
      }));
    }
  }, [defaultOrganizationId]);

  const [errors, setErrors] = useState<Partial<Record<keyof RepositoryCreateData, string>>>({});
  
  // Fetch user's organizations
  const { data: organizationsData } = useMyOrganizations({ page: 0, size: 100 });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RepositoryCreateData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('repositories.createModal.errors.nameRequired');
    } else if (formData.name.length < 3) {
      newErrors.name = t('repositories.createModal.errors.nameTooShort');
    } else if (formData.name.length > 100) {
      newErrors.name = t('repositories.createModal.errors.nameTooLong');
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = t('repositories.createModal.errors.descriptionTooLong');
    }

    if (formData.type === 'ORGANIZATION' && !formData.organizationId) {
      newErrors.organizationId = t('repositories.createModal.errors.organizationRequired');
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
    // If changing to ORGANIZATION type, set isPublic to false (org repos are private by default)
    if (field === 'type' && value === 'ORGANIZATION') {
      setFormData(prev => ({ ...prev, [field]: value, isPublic: false }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: defaultOrganizationId ? 'ORGANIZATION' : 'PERSONAL',
      isPublic: false,
      organizationId: defaultOrganizationId,
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
      title={t('repositories.createModal.title')}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-sm" style={{ color: '#6b7280' }}>
            {t('repositories.createModal.requiredFields')}
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t('repositories.createModal.cancel')}
            </Button>
            <Button form="create-repo-form" type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <CommonIcon name="user" size={16} />
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('repositories.createModal.submitting')}
                </div>
              ) : (
                t('repositories.createModal.submit')
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
            <Label htmlFor="type" className="text-sm font-medium" style={{ color: '#111827' }}>
              {t('repositories.createModal.labels.type')} <span style={{ color: '#ef4444' }}>*</span>
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
                      {t('repositories.createModal.types.personal.label')}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
                      {t('repositories.createModal.types.personal.description')}
                    </div>
                  </div>
                  {formData.type === 'PERSONAL' && (
                    <div className="absolute top-2 right-2">
                      <div className="rounded-full" style={{ backgroundColor: '#2563eb' }}></div>
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
                      {t('repositories.createModal.types.organization.label')}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
                      {t('repositories.createModal.types.organization.description')}
                    </div>
                  </div>
                  {formData.type === 'ORGANIZATION' && (
                    <div className="absolute top-2 right-2">
                      <div className="rounded-full" style={{ backgroundColor: '#16a34a' }}></div>
                    </div>
                  )}
                </div>
              </button>
            </div>
            {errors.type && (
              <p className="text-sm" style={{ color: '#dc2626' }}>{errors.type}</p>
            )}
          </div>

          {formData.type === 'ORGANIZATION' && (
            <div className="space-y-2 p-4 border rounded-lg" style={{ borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}>
              <div className="flex items-center gap-2 mb-3">
                <CommonIcon name="building" size={16} />
                <Label htmlFor="organizationId" className="text-sm font-medium" style={{ color: '#111827' }}>
                  {t('repositories.createModal.labels.organization')} <span style={{ color: '#ef4444' }}>*</span>
                </Label>
              </div>
              <Select
                value={formData.organizationId || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('organizationId', e.target.value)}
                options={[
                  { value: '', label: t('repositories.createModal.placeholders.organization') },
                  ...(organizationsData?.content || []).map(org => ({
                    value: org.id,
                    label: org.name
                  }))
                ]}
                style={{ backgroundColor: '#ffffff' }}
              />
              {errors.organizationId && (
                <p className="text-sm" style={{ color: '#dc2626' }}>{errors.organizationId}</p>
              )}
              {organizationsData?.content?.length === 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md mt-2">
                  <div className="text-amber-600 text-sm">
                    {t('repositories.createModal.warnings.noOrganizations')}
                  </div>
                </div>
              )}
              {organizationsData?.content && organizationsData.content.length > 0 && (
                <p className="text-xs mt-2" style={{ color: '#4b5563' }}>
                  {t('repositories.createModal.organizationsFound', { count: organizationsData.content.length })}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium" style={{ color: '#374151' }}>
              {t('repositories.createModal.labels.name')} <span style={{ color: '#ef4444' }}>*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={t('repositories.createModal.placeholders.name')}
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm" style={{ color: '#dc2626' }}>{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium" style={{ color: '#374151' }}>
              {t('repositories.createModal.labels.description')}
            </Label>
            <Textarea
              id="description"
              placeholder={t('repositories.createModal.placeholders.description')}
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm" style={{ color: '#dc2626' }}>{errors.description}</p>
            )}
            <p className="text-xs" style={{ color: '#6b7280' }}>
              {t('repositories.createModal.characterCount', { count: formData.description?.length || 0, max: 500 })}
            </p>
          </div>

          {/* Only show visibility toggle for personal repositories */}
          {formData.type === 'PERSONAL' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium" style={{ color: '#374151' }}>
                {t('repositories.createModal.labels.public')}
              </Label>
              <div className="flex items-center space-x-3">
                <Switch
                  checked={formData.isPublic}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('isPublic', e.target.checked)}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium" style={{ color: '#111827' }}>
                    {t(formData.isPublic ? 'repositories.createModal.public.label' : 'repositories.createModal.private.label')}
                  </p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>
                    {t(formData.isPublic ? 'repositories.createModal.public.description' : 'repositories.createModal.private.description')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
