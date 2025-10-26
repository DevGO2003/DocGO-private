import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Users as UsersIcon } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '@shared/components';
import {
  MemberTable,
  InviteMemberModal,
  useOrganization,
  useOrganizationMembers,
  MemberRole,
} from '@features/organization';
import { useSelector } from 'react-redux';
import type { RootState } from '@store';
import { ORGANIZATIONS_PATH } from '@constants';

export const OrganizationMembers = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    return <LoadingSpinner text="Loading members..." fullScreen />;
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-700 mb-4">Organization not found</p>
            <Button
              variant="outline"
              onClick={() => navigate(ORGANIZATIONS_PATH)}
              animated
            >
              Back to Organizations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Invite Member Modal */}
      <InviteMemberModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        organizationId={id!}
        onSuccess={() => {
          refetchMembers();
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate(`/organizations/${id}/workspace`)}
              className="flex items-center gap-2 mb-4"
              animated
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Workspace
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Members</h1>
                <p className="text-gray-600 mt-1">
                  Manage team members for <strong>{organization.name}</strong>
                </p>
              </div>

              {canInviteMembers && (
                <Button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center gap-2"
                  animated
                >
                  <UserPlus className="w-5 h-5" />
                  Invite Member
                </Button>
              )}
            </div>
          </div>

          {/* Members Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5" />
                  Team Members ({members.length})
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
            <h3 className="font-semibold text-blue-900 mb-2">About Member Roles</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-semibold mt-0.5">•</span>
                <span>
                  <strong>Owner:</strong> Full access to all organization features and settings
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold mt-0.5">•</span>
                <span>
                  <strong>Manager:</strong> Can approve contracts and manage team based on assigned permissions
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold mt-0.5">•</span>
                <span>
                  <strong>Member:</strong> Can upload and manage their own contracts
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};
