import { useState } from 'react';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Button } from '@shared/components';
import { RoleBadge, PermissionBadge } from '@/features/organizations';
import type { OrganizationMember, MemberRole } from '@/features/organizations';
import { useRemoveMember } from '@/features/organizations';
import { formatDate } from '@shared/utils/dateFormatter';

interface MemberTableProps {
  members: OrganizationMember[];
  organizationId: string;
  currentUserId: string;
  currentUserRole: MemberRole;
  isLoading?: boolean;
  onEditMember?: (member: OrganizationMember) => void;
  onRefresh?: () => void;
}

export const MemberTable = ({
  members,
  organizationId,
  currentUserId,
  currentUserRole,
  isLoading,
  onEditMember,
  onRefresh,
}: MemberTableProps) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null);
  
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();

  const canManageMembers = currentUserRole === 'OWNER' || currentUserRole === 'MANAGER';

  const handleRemoveMember = () => {
    if (!memberToRemove) return;

    removeMember(
      { orgId: organizationId, memberId: memberToRemove.userId },
      {
        onSuccess: () => {
          setMemberToRemove(null);
          onRefresh?.();
        },
        onError: (error: any) => {
          console.error('Failed to remove member:', error);
          alert('Failed to remove member. Please try again.');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <CommonIcon name="shield" size={16} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">No members yet</p>
        <p className="text-sm text-gray-500">Invite team members to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              {canManageMembers && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => {
              const isCurrentUser = member.userId === currentUserId;
              const isOwner = member.role === 'OWNER';
              const canEdit = canManageMembers && !isOwner && !isCurrentUser;

              return (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  {/* Member Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {(member.firstName?.charAt(0) || member.username.charAt(0)).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            {member.firstName && member.lastName
                              ? `${member.firstName} ${member.lastName}`
                              : member.firstName || member.lastName || member.username}
                          </div>
                          {isCurrentUser && (
                            <span className="text-xs text-blue-600 font-medium">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleBadge role={member.role} />
                  </td>

                  {/* Permissions */}
                  <td className="px-6 py-4">
                    {member.role === 'OWNER' ? (
                      <span className="text-xs text-purple-600 font-medium">All Permissions</span>
                    ) : member.role === 'MANAGER' && member.permissions && member.permissions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.map((permission) => (
                          <PermissionBadge key={permission} permission={permission} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        member.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : member.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(member.joinedAt)}
                  </td>

                  {/* Actions */}
                  {canManageMembers && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {canEdit ? (
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <CommonIcon name="more-vertical" size={16} className="w-4 h-4 text-gray-600" />
                          </button>

                          {openMenuId === member.id && (
                            <>
                              {/* Backdrop */}
                              <div
                                className="fixed inset-0 z-[100]"
                                onClick={() => setOpenMenuId(null)}
                              />
                              {/* Menu - Fixed position to avoid being cut off */}
                              <div 
                                className="fixed w-48 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-[101]"
                                style={{
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)'
                                }}
                              >
                                <div className="py-1">
                                  {onEditMember && (
                                    <button
                                      onClick={() => {
                                        onEditMember(member);
                                        setOpenMenuId(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <CommonIcon name="edit" size={16} />
                                      Edit Member
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setMemberToRemove(member);
                                      setOpenMenuId(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <CommonIcon name="trash" size={16} />
                                    Remove Member
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Remove Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
                <CommonIcon name="alert-circle" size={16} className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Remove Member
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to remove <strong>
                    {memberToRemove.firstName && memberToRemove.lastName
                      ? `${memberToRemove.firstName} ${memberToRemove.lastName}`
                      : memberToRemove.firstName || memberToRemove.lastName || memberToRemove.username}
                  </strong> from this organization? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setMemberToRemove(null)}
                    disabled={isRemoving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleRemoveMember()}
                    disabled={isRemoving}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isRemoving ? 'Removing...' : 'Remove Member'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
