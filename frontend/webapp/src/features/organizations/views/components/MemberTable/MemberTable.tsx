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
          <div key={i} className="rounded-lg" style={{ backgroundColor: '#e5e7eb' }} ></div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg" style={{ borderColor: '#d1d5db' }} >
        <CommonIcon name="shield" size={16} className="h-12 mx-auto mb-4" style={{ color: '#9ca3af' }} />
        <p className="mb-2" style={{ color: '#4b5563' }} >No members yet</p>
        <p className="text-sm" style={{ color: '#6b7280' }} >Invite team members to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto border rounded-lg" style={{ borderColor: '#e5e7eb' }} >
        <table className="min-w-full divide-y divide-gray-200">
          <thead style={{ backgroundColor: '#f9fafb' }} >
            <tr>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }} >
                Member
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }} >
                Role
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }} >
                Permissions
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }} >
                Status
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }} >
                Joined
              </th>
              {canManageMembers && (
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }} >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#ffffff' }} >
            {members.map((member) => {
              const isCurrentUser = member.userId === currentUserId;
              const isOwner = member.role === 'OWNER';
              const canEdit = canManageMembers && !isOwner && !isCurrentUser;

              return (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  {/* Member Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 rounded-full flex items-center justify-center" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                        <span className="font-semibold" style={{ color: '#ffffff' }} >
                          {(member.firstName?.charAt(0) || member.username.charAt(0)).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium" style={{ color: '#111827' }} >
                            {member.firstName && member.lastName
                              ? `${member.firstName} ${member.lastName}`
                              : member.firstName || member.lastName || member.username}
                          </div>
                          {isCurrentUser && (
                            <span className="text-xs font-medium" style={{ color: '#2563eb' }} >(You)</span>
                          )}
                        </div>
                        <div className="text-sm" style={{ color: '#6b7280' }} >{member.email}</div>
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
                      <span className="text-xs font-medium" style={{ color: '#9333ea' }} >All Permissions</span>
                    ) : member.role === 'MANAGER' && member.permissions && member.permissions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.map((permission) => (
                          <PermissionBadge key={permission} permission={permission} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm" style={{ color: '#9ca3af' }} >-</span>
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
                  <td className="px-6 py-4 text-sm" style={{ color: '#6b7280' }} >
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
                            <CommonIcon name="more-vertical" size={16} style={{ color: '#4b5563' }} />
                          </button>

                          {openMenuId === member.id && (
                            <>
                              {/* Backdrop */}
                              <div
                                className="fixed inset-0 z-[100]"
                                onClick={() => setOpenMenuId(null)}
                              />
                              {/* Menu - Positioned relative to button */}
                              <div 
                                className="absolute right-0 top-full mt-1 z-[101] rounded-lg shadow-lg border min-w-[160px]" 
                                style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}
                              >
                                <div className="py-1">
                                  {onEditMember && (
                                    <button
                                      onClick={() => {
                                        onEditMember(member);
                                        setOpenMenuId(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100" style={{ color: '#374151' }} >
                                      <CommonIcon name="edit" size={16} />
                                      Edit Member
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setMemberToRemove(member);
                                      setOpenMenuId(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-50" style={{ color: '#dc2626' }} >
                                    <CommonIcon name="trash" size={16} />
                                    Remove Member
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#9ca3af' }} >-</span>
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
          <div className="rounded-lg max-w-md w-full p-6" style={{ backgroundColor: '#ffffff' }} >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-lg" style={{ backgroundColor: '#fee2e2' }} >
                <CommonIcon name="alert-circle" size={16} style={{ color: '#dc2626' }} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }} >
                  Remove Member
                </h3>
                <p className="text-sm mb-4" style={{ color: '#4b5563' }} >
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
                    className="hover:bg-red-700" style={{ backgroundColor: '#dc2626', color: '#ffffff' }} >
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
