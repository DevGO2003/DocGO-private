import { useState } from 'react';
import { useSelector } from 'react-redux';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Dialog, Button, Input } from '@shared/components';
import { useCreateOrganization } from '@features/organizations';
import type { OrganizationCreateData } from '@features/organizations';
import type { RootState } from '@store';
import { useTranslation } from 'react-i18next';

interface CreateOrganizationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateOrganizationDialog = ({
  open,
  onClose,
  onSuccess,
}: CreateOrganizationDialogProps) => {
  const { t } = useTranslation();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [formData, setFormData] = useState<Omit<OrganizationCreateData, 'ownerUserId'>>({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: createOrganization, isPending } = useCreateOrganization();

  const handleChange = (field: keyof Omit<OrganizationCreateData, 'ownerUserId'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('organizations.createDialog.errors.nameRequired');
    } else if (formData.name.length < 3) {
      newErrors.name = t('organizations.createDialog.errors.nameMin');
    } else if (formData.name.length > 100) {
      newErrors.name = t('organizations.createDialog.errors.nameMax');
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = t('organizations.createDialog.errors.descMax');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    console.log('🔍 [Create Org] Current user from Redux:', currentUser);
    console.log('🔍 [Create Org] Current user ID:', currentUser?.id);
    
    if (!currentUser?.id) {
      setErrors({ submit: t('organizations.createDialog.errors.authRequired') });
      return;
    }

    const payload: OrganizationCreateData = {
      ...formData,
      ownerUserId: currentUser.id,
    };

    console.log('📤 [Create Org] Sending organization data:', payload);
    console.log('📤 [Create Org] Owner User ID:', payload.ownerUserId);

    createOrganization(payload, {
      onSuccess: () => {
        console.log('✅ Organization created successfully');
        // Reset form
        setFormData({
          name: '',
          description: '',
        });
        onSuccess?.();
        onClose();
      },
      onError: (error: any) => {
        console.error('❌ Failed to create organization:', error);
        console.error('❌ Error response:', error?.response?.data);
        console.error('❌ Error status:', error?.response?.status);
        
        // Extract error message from backend response
        const errorData = error?.response?.data;
        const errorMessage = 
          errorData?.description ||
          errorData?.shortMessage || 
          errorData?.message || 
          error?.message ||
          t('organizations.createDialog.errors.submitFailed');
        
        setErrors({ submit: errorMessage });
      },
    });
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      description: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={t('organizations.createDialog.title')}
      maxWidth="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            {t('organizations.createDialog.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? t('organizations.createDialog.creating') : t('organizations.createDialog.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Icon Header */}
        <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: '#e5e7eb' }} >
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#f3e8ff' }} >
            <CommonIcon name="building" size={24} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: '#111827' }} >{t('organizations.createDialog.header.title')}</h3>
            <p className="text-sm" style={{ color: '#4b5563' }} >{t('organizations.createDialog.header.subtitle')}</p>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="flex items-start gap-2 p-4 border rounded-lg" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }} >
            <CommonIcon name="alert-circle" size={16} />
            <div>
              <p className="text-sm font-medium" style={{ color: '#991b1b' }} >{t('organizations.createDialog.errorTitle')}</p>
              <p className="text-sm" style={{ color: '#b91c1c' }} >{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Organization Name */}
        <div className="space-y-2">
          <label htmlFor="org-name" className="block text-sm font-medium" style={{ color: '#374151' }} >
            {t('organizations.createDialog.orgNameLabel')} <span style={{ color: '#ef4444' }} >*</span>
          </label>
          <Input
            id="org-name"
            type="text"
            placeholder={t('organizations.createDialog.orgNamePlaceholder')}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={errors.name ? 'border-red-300' : ''}
            disabled={isPending}
          />
          {errors.name && (
            <p className="text-sm" style={{ color: '#dc2626' }} >{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="org-description" className="block text-sm font-medium" style={{ color: '#374151' }} >
            {t('organizations.createDialog.descriptionLabel')} <span style={{ color: '#9ca3af' }} >{t('organizations.createDialog.descriptionOptional')}</span>
          </label>
          <textarea
            id="org-description"
            rows={3}
            placeholder={t('organizations.createDialog.descriptionPlaceholder')}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isPending}
          />
          {errors.description && (
            <p className="text-sm" style={{ color: '#dc2626' }} >{errors.description}</p>
          )}
          <p className="text-xs" style={{ color: '#6b7280' }} >
            {t('organizations.createDialog.descriptionCounter', { count: formData.description?.length || 0 })}
          </p>
        </div>

        {/* Info Note */}
        <div className="p-4 border rounded-lg" style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }} >
          <p className="text-sm" style={{ color: '#1e40af' }} >{t('organizations.createDialog.note')}</p>
        </div>
      </div>
    </Dialog>
  );
};
