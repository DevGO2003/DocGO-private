import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Dialog, Button, Input } from '@shared/components';
import { useInviteMember, MemberRole, ManagerPermission } from '@features/organizations';

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess?: () => void;
}

const MANAGER_PERMISSIONS: { value: ManagerPermission; label: string; description: string }[] = [
  {
    value: 'approve:legal',
    label: 'Phê duyệt Pháp lý',
    description: 'Phê duyệt hợp đồng về mặt pháp lý',
  },
  {
    value: 'approve:finance',
    label: 'Phê duyệt Tài chính',
    description: 'Phê duyệt hợp đồng về mặt tài chính',
  },
  {
    value: 'approve:executive',
    label: 'Phê duyệt cuối cùng',
    description: 'Phê duyệt cấp điều hành',
  },
  {
    value: 'member:invite',
    label: 'Mời thành viên',
    description: 'Có thể mời thành viên mới vào tổ chức',
  },
  {
    value: 'org:settings',
    label: 'Quản lý cài đặt',
    description: 'Có thể quản lý cài đặt tổ chức',
  },
];

export const InviteMemberModal = ({
  open,
  onClose,
  organizationId,
  onSuccess,
}: InviteMemberModalProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<MemberRole>(MemberRole.MEMBER);
  const [selectedPermissions, setSelectedPermissions] = useState<ManagerPermission[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [invitationLink, setInvitationLink] = useState<string>('');
  const [showSuccessView, setShowSuccessView] = useState(false);

  const { mutate: inviteMember, isPending } = useInviteMember();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = t('organizations.inviteModal.errors.emailRequired');
    } else if (!validateEmail(email)) {
      newErrors.email = t('organizations.inviteModal.errors.emailInvalid');
    }

    if (selectedRole === MemberRole.MANAGER && selectedPermissions.length === 0) {
      newErrors.permissions = t('organizations.inviteModal.errors.permissionsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const inviteData = {
      email: email.trim(),
      role: selectedRole,
      ...(selectedRole === MemberRole.MANAGER && { permissions: selectedPermissions }),
    };

    inviteMember(
      { orgId: organizationId, data: inviteData },
      {
        onSuccess: (response: any) => {
          console.log('✅ [Invite Member] Success response:', response);
          
          // Generate invitation link from token
          const token = response?.token;
          if (token) {
            const baseUrl = window.location.origin;
            const link = `${baseUrl}/invitations/accept?token=${token}&email=${encodeURIComponent(email.trim())}`;
            setInvitationLink(link);
            setShowSuccessView(true);
            console.log('📧 [Invite Member] Invitation link:', link);
          } else {
            // No token, just close
            handleClose();
            onSuccess?.();
          }
        },
        onError: (error: any) => {
          const errorData = error?.response?.data;
          const errorMessage =
            errorData?.description ||
            errorData?.shortMessage ||
            errorData?.message ||
            error?.message ||
            t('organizations.inviteModal.errors.submitFailed');
          setErrors({ submit: errorMessage });
        },
      }
    );
  };

  const handleClose = () => {
    setEmail('');
    setSelectedRole(MemberRole.MEMBER);
    setSelectedPermissions([]);
    setErrors({});
    setInvitationLink('');
    setShowSuccessView(false);
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationLink);
    alert(t('organizations.inviteModal.copied'));
  };

  const handleDone = () => {
    handleClose();
    onSuccess?.();
  };

  const togglePermission = (permission: ManagerPermission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
    // Clear permission error when user selects
    if (errors.permissions) {
      setErrors((prev) => ({ ...prev, permissions: '' }));
    }
  };

  // Success View - Show invitation link
  if (showSuccessView) {
    return (
      <Dialog
        open={open}
        onClose={handleDone}
        title={t('organizations.inviteModal.successTitle')}
        maxWidth="lg"
        footer={
          <>
            <Button onClick={handleCopyLink} variant="outline">
              📋 {t('organizations.inviteModal.copyLink')}
            </Button>
            <Button onClick={handleDone}>
              {t('organizations.inviteModal.done')}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Success Header */}
          <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: '#e5e7eb' }} >
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#dcfce7' }} >
              <CommonIcon name="check" size={20} color="#16a34a" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: '#111827' }} >{t('organizations.inviteModal.successHeaderTitle')}</h3>
              <p className="text-sm" style={{ color: '#4b5563' }} >
                {t('organizations.inviteModal.successHeaderDesc', { email })}
              </p>
            </div>
          </div>

          {/* Invitation Link Box */}
          <div className="border rounded-lg p-4" style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }} >
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >{t('organizations.inviteModal.invitationLink')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={invitationLink}
                readOnly
                className="flex-1 px-3 py-2 border rounded-lg text-sm" style={{ borderColor: '#d1d5db', backgroundColor: '#ffffff' }}
                onClick={(e) => e.currentTarget.select()}
              />
              <Button onClick={handleCopyLink}>{t('organizations.inviteModal.copy')}</Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="border rounded-lg p-4" style={{ borderColor: '#fef08a', backgroundColor: '#fefce8' }} >
            <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: '#111827' }} >
              <CommonIcon name="alert-circle" size={20} color="#f59e0b" />
              {t('organizations.inviteModal.nextSteps')}
            </h4>
            <ol className="space-y-1 text-sm" style={{ color: '#374151' }} >
              <li>{t('organizations.inviteModal.steps.copy')}</li>
              <li>{t('organizations.inviteModal.steps.send', { email })}</li>
              <li>{t('organizations.inviteModal.steps.accept')}</li>
            </ol>
          </div>

          {/* Note about email */}
          <div className="text-sm" style={{ color: '#6b7280' }} >
            💡 {t('organizations.inviteModal.note')}
          </div>
        </div>
      </Dialog>
    );
  }

  // Invite Form View
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={t('organizations.inviteModal.dialogTitle')}
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            {t('organizations.inviteModal.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? t('organizations.inviteModal.sending') : t('organizations.inviteModal.sendInvitation')}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: '#e5e7eb' }} >
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#dbeafe' }} >
            <CommonIcon name="user-plus" size={24} color="#2563eb" />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: '#111827' }} >{t('organizations.inviteModal.header.title')}</h3>
            <p className="text-sm" style={{ color: '#4b5563' }} >{t('organizations.inviteModal.header.subtitle')}</p>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="flex items-start gap-2 p-4 border rounded-lg" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }} >
            <CommonIcon name="alert-circle" size={20} color="#dc2626" />
            <div>
              <p className="text-sm font-medium" style={{ color: '#991b1b' }} >{t('organizations.inviteModal.errorTitle')}</p>
              <p className="text-sm" style={{ color: '#b91c1c' }} >{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="invite-email" className="block text-sm font-medium" style={{ color: '#374151' }} >
            {t('organizations.inviteModal.emailAddress')} <span style={{ color: '#ef4444' }} >*</span>
          </label>
          <div className="relative">
            <CommonIcon name="mail" className="absolute left-3 top-1/2" style={{ color: '#9ca3af' }} />
            <Input
              id="invite-email"
              type="email"
              placeholder={t('organizations.inviteModal.emailPlaceholder')}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              className={`pl-10 ${errors.email ? 'border-red-300' : ''}`}
              disabled={isPending}
            />
          </div>
          {errors.email && <p className="text-sm" style={{ color: '#dc2626' }} >{errors.email}</p>}
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: '#374151' }} >
            {t('organizations.inviteModal.selectRole')} <span style={{ color: '#ef4444' }} >*</span>
          </label>
          <div className="space-y-3">
            {/* Member Role */}
            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="role"
                value={MemberRole.MEMBER}
                checked={selectedRole === MemberRole.MEMBER}
                onChange={(e) => {
                  setSelectedRole(e.target.value as MemberRole);
                  setSelectedPermissions([]); // Clear permissions when changing role
                }}
                className="mt-1" style={{ color: '#2563eb' }}
                disabled={isPending}
              />
              <div className="flex-1">
                <p className="font-medium" style={{ color: '#111827' }} >{t('organizations.inviteModal.role.member.title')}</p>
                <p className="text-sm" style={{ color: '#4b5563' }} >{t('organizations.inviteModal.role.member.desc')}</p>
              </div>
            </label>

            {/* Manager Role */}
            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="role"
                value={MemberRole.MANAGER}
                checked={selectedRole === MemberRole.MANAGER}
                onChange={(e) => setSelectedRole(e.target.value as MemberRole)}
                className="mt-1" style={{ color: '#2563eb' }}
                disabled={isPending}
              />
              <div className="flex-1">
                <p className="font-medium" style={{ color: '#111827' }} >{t('organizations.inviteModal.role.manager.title')}</p>
                <p className="text-sm" style={{ color: '#4b5563' }} >{t('organizations.inviteModal.role.manager.desc')}</p>
              </div>
            </label>
          </div>
        </div>

        {/* Manager Permissions */}
        {selectedRole === MemberRole.MANAGER && (
          <div className="space-y-3 pl-4 border-l-4 p-4 rounded-r-lg" style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }} >
            <p className="text-sm font-medium" style={{ color: '#111827' }} >
              {t('organizations.inviteModal.managerPermissions.title')} <span style={{ color: '#ef4444' }} >*</span>
            </p>
            <p className="text-xs" style={{ color: '#4b5563' }} >
              {t('organizations.inviteModal.managerPermissions.subtitle')}
            </p>

            <div className="space-y-2">
              {MANAGER_PERMISSIONS.map((perm) => (
                <label
                  key={perm.value}
                  className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:border-blue-300 transition-colors" style={{ borderColor: '#93c5fd', backgroundColor: '#ffffff' }} >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.value)}
                    onChange={() => togglePermission(perm.value)}
                    className="mt-1 rounded" style={{ color: '#2563eb' }}
                    disabled={isPending}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: '#111827' }} >{perm.label}</p>
                    <p className="text-xs" style={{ color: '#4b5563' }} >{perm.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.permissions && (
              <p className="text-sm" style={{ color: '#dc2626' }} >{errors.permissions}</p>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="border rounded-lg p-4" style={{ borderColor: '#fef08a', backgroundColor: '#fefce8' }} >
          <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: '#111827' }} >
            <CommonIcon name="alert-circle" style={{ color: '#ca8a04' }} />
            {t('organizations.inviteModal.nextSteps')}
          </h4>
          <ol className="space-y-1 text-sm" style={{ color: '#374151' }} >
            <li>{t('organizations.inviteModal.steps.copy')}</li>
            <li>{t('organizations.inviteModal.steps.send', { email })}</li>
            <li>{t('organizations.inviteModal.steps.accept')}</li>
          </ol>
        </div>

        {/* Note about email */}
        <div className="text-sm" style={{ color: '#6b7280' }} >
          {t('organizations.inviteModal.note')}
        </div>
      </div>
    </Dialog>
  );
};
