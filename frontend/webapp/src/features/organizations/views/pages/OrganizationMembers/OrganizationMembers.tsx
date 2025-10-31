import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Users as UsersIcon } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '@shared/components';
import {
  MemberTable,
  InviteMemberModal,
  useOrganization,
  useOrganizationMembers,
  MemberRole,
} from '@/features/organizations';
import { useSelector } from 'react-redux';
import type { RootState } from '@store';
import { ORGANIZATIONS_PATH } from '@constants';
import OrganizationLayout from '../../../layouts/OrganizationLayout';

export const OrganizationMembers = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const { data: organization, isLoading: orgLoading } = useOrganization(id!);
  const {
    data: membersData,
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = useOrganizationMembers(id!, { page: 0, size: 50 });

  const members = membersData?.content || [];
  const isLoading = orgLoading || membersLoading;

  // Get current user's role in this organization
  const currentUserRole = organization?.userRole || MemberRole.MEMBER;
  const canInviteMembers = currentUserRole === MemberRole.OWNER || currentUserRole === MemberRole.MANAGER;

  // Debug logs
  console.log('🔍 [Members Page] Organization:', organization?.name);
  console.log('🔍 [Members Page] Your role:', currentUserRole);
  console.log('🔍 [Members Page] Can invite members?', canInviteMembers);
  console.log('🔍 [Members Page] Members count:', members.length);

  if (isLoading) {
    return <LoadingSpinner text={t('organizations.members.loading')} fullScreen />;
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-700 mb-4">{t('organizations.members.notFound')}</p>
            <Button
              variant="outline"
              onClick={() => navigate(ORGANIZATIONS_PATH)}
            >
              {t('organizations.members.backToOrganizations')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <OrganizationLayout
      title={organization?.name || ''}
      subtitle={t('organizations.members.subtitle')}
      breadcrumbs={[
        { label: t('organizations.list.title'), href: ORGANIZATIONS_PATH },
        { label: organization?.name || '', href: `/organizations/${id}/workspace` },
        { label: t('organizations.members.title'), current: true },
      ]}
      headerRight={(
        <Button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {t('organizations.members.inviteMember')}
        </Button>
      )}
    >
      {/* Invite Member Modal */}
      <InviteMemberModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        organizationId={id!}
        onSuccess={() => {
          refetchMembers();
        }}
      />

      <div className="space-y-6">

          {/* Members Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5" />
                  {t('organizations.members.teamMembers', { count: members.length })}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <MemberTable
                members={members}
                organizationId={id!}
                currentUserId={currentUser?.id || ''}
                currentUserRole={currentUserRole as MemberRole}
                isLoading={membersLoading}
                onRefresh={() => refetchMembers()}
              />
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">{t('organizations.members.aboutRolesTitle')}</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-semibold mt-0.5">•</span>
                <span>{t('organizations.members.roles.owner')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold mt-0.5">•</span>
                <span>{t('organizations.members.roles.manager')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold mt-0.5">•</span>
                <span>{t('organizations.members.roles.member')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
};
