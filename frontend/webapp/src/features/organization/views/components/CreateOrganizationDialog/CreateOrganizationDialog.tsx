import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Building2, AlertCircle } from 'lucide-react';
import { Dialog, Button, Input } from '@shared/components';
import { useCreateOrganization } from '@features/organization';
import type { OrganizationCreateData } from '@features/organization';
import type { RootState } from '@store';

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
      newErrors.name = 'Organization name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Organization name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Organization name must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    console.log('🔍 [Create Org] Current user from Redux:', currentUser);
    console.log('🔍 [Create Org] Current user ID:', currentUser?.id);
    
    if (!currentUser?.id) {
      setErrors({ submit: 'User not authenticated. Please login again.' });
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
          errorData?.description || // Backend's detailed error message
          errorData?.shortMessage || 
          errorData?.message || 
          error?.message ||
          'Failed to create organization';
        
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
      title="Create New Organization"
      maxWidth="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            animated
          >
            {isPending ? 'Creating...' : 'Create Organization'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Icon Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Building2 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Organization Details</h3>
            <p className="text-sm text-gray-600">
              Create a new organization to collaborate with your team
            </p>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Organization Name */}
        <div className="space-y-2">
          <label htmlFor="org-name" className="block text-sm font-medium text-gray-700">
            Organization Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="org-name"
            type="text"
            placeholder="e.g., Acme Corporation"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={errors.name ? 'border-red-300' : ''}
            disabled={isPending}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="org-description" className="block text-sm font-medium text-gray-700">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="org-description"
            rows={3}
            placeholder="Brief description of your organization..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isPending}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}
          <p className="text-xs text-gray-500">
            {formData.description?.length || 0} / 500 characters
          </p>
        </div>

        {/* Info Note */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You will be the owner of this organization and can manage all settings after creation.
          </p>
        </div>
      </div>
    </Dialog>
  );
};
